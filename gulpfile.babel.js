import 'babel-polyfill'
import babelify from 'babelify'
import browserify from 'browserify'
import exorcist from 'exorcist'
import gulp from 'gulp'
import gutil, { PluginError } from 'gulp-util'
import sass from 'gulp-sass'
import source from 'vinyl-source-stream'
import watchify from 'watchify'

function tasksFor(target) {
  const PATH = `${target}/${target}`
  const BUILD = `build:${target}`

  gulp.task(`${BUILD}:jsx`, () => {
    watchify.args.debug = true

    let bundler = browserify(`${PATH}.jsx`, watchify.args)
    .transform(babelify.configure({
      sourceMapRelative: process.cwd(),
      presets: ['es2015', 'react', 'stage-0']
    }))
    bundler.on('update', bundle)

    if ([].find.call(gulp.seq, task => 'dev' === task)) {
      bundler = watchify(bundler)
    }

    function bundle() {
      bundler
        .bundle()
        .on('error', function(err) {
          err.message = err.message.replace(':', '\n')
          err.message = err.message.replace(/(.*) \((.*)\)/, '  $2 $1')
          let message = new PluginError('browserify', `${err.message}\n${err.codeFrame}`).toString();
          process.stderr.write(message + '\n');
        })
        .pipe(exorcist(`dist/${PATH}.js.map`))
        .pipe(source(`${target}.js`))
        .pipe(gulp.dest(`dist/${target}`))
    }

    bundle()
  })

  gulp.task(`${BUILD}:sass`, () => {
    gulp.src(`${PATH}.scss`)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(`dist/${target}`))
  })

  gulp.task(`${BUILD}:html`, () => {
    gulp.src(`${PATH}.html`)
      .pipe(gulp.dest(`dist/${target}`))
  })

  gulp.task(BUILD, [`${BUILD}:jsx`, `${BUILD}:sass`, `${BUILD}:html`])

  gulp.task(`watch:${target}`, [`build:${target}`], () => {
    gulp.watch([`${target}/*.jsx`, 'shared/**/*.{jsx,js}'], [`${BUILD}:jsx`])
    gulp.watch([`${target}/*.scss`, 'shared/**/*.scss'], [`${BUILD}:sass`])
    gulp.watch(`${target}/*.html`, [`${BUILD}:html`])
  })
}

tasksFor('bookmarks_override')
tasksFor('browser_action')
tasksFor('background')

gulp.task('icons', () => {
  gulp.src('icons/*')
    .pipe(gulp.dest('dist/icons'))
})

gulp.task('locales', () => {
  gulp.src('_locales/**')
    .pipe(gulp.dest('dist/_locales'))
})

gulp.task('manifest', () => {
  gulp.src('manifest.json')
    .pipe(gulp.dest('dist'))
})

gulp.task('assets', ['icons', 'locales', 'manifest'])

// gulp.task('dev', ['build', 'assets'], () => {
//   gulp.watch(['overrides_bookmarks/bookmarks.jsx', 'shared/**/*.jsx'], ['build:jsx'])
//   gulp.watch(['overrides_bookmarks/bookmarks.scss', 'shared/**/*.scss'], ['build:sass'])
//   gulp.watch('overrides_bookmarks/bookmarks.html', ['build:html'])
// })
//
// gulp.task('default', ['dev'])
