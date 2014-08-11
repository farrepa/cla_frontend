var gulp = require('gulp'),
    path = require('path'),
    plugins = require('gulp-load-plugins')(),
    stylish = require('jshint-stylish'),
    lodash = require('lodash'),
    runSequence = require('run-sequence'),
    java_path = path.resolve('node_modules/closurecompiler/jre/bin');
    process.env.PATH = java_path + ':' + process.env.PATH,
    paths = {
      tmp: '.gulptmp/',
      dest: 'cla_frontend/assets/',
      src: 'cla_frontend/assets-src/',
      icons: [],
      images: [],
      fonts: [],
      styles: [],
      ng_partials: [],
      vendor_static: [],
      scripts: {},
      guidance: []
    };

// styles
paths.styles.push(paths.src + 'stylesheets/**/*.scss');
// icons
paths.icons.push(paths.src + 'fonts/svg-icons/*.svg');
// fonts
paths.fonts.push(paths.src + 'fonts/*.{eot,svg,ttf,woff}');
paths.fonts.push(paths.tmp + 'fonts/*.{eot,svg,ttf,woff}');
// images
paths.images.push(paths.src + 'images/**/*');
// partials
paths.ng_partials.push(paths.src + 'javascripts/app/partials/**/*.html');
// partials
paths.vendor_static.push(paths.src + 'javascripts/vendor/**/*');
// scripts
paths.scripts = {
  vendor: [
    paths.src + 'vendor/lodash/dist/lodash.min.js',
    paths.src + 'vendor/jquery/dist/jquery.min.js',
    paths.src + 'vendor/select2/select2.js',
    // angular specific
    paths.src + 'vendor/angular/angular.js',
    paths.src + 'vendor/angular-sanitize/angular-sanitize.js',
    paths.src + 'vendor/angular-animate/angular-animate.js',
    paths.src + 'vendor/angular-sticky/sticky.js',
    paths.src + 'vendor/angular-resource/angular-resource.js',
    paths.src + 'vendor/angular-ui-router/release/angular-ui-router.js',
    paths.src + 'vendor/angular-ui-select2/src/select2.js',
    paths.src + 'vendor/angular-i18n/angular-locale_en-gb.js',
    paths.src + 'vendor/moment/moment.js',
    paths.src + 'vendor/angular-moment/angular-moment.js',
    paths.src + 'vendor/lunr.js/lunr.js',
    paths.src + 'javascripts/vendor/xeditable.js',
    paths.src + 'javascripts/vendor/ui-bootstrap-custom-tpls-0.10.0.js'
  ],
  app: [
    paths.src + 'javascripts/app/js/app.js',
    paths.tmp + 'javascripts/app/partials/**/*', // dynamically generated by gulp task (ng-templates)
    paths.src + 'javascripts/app/js/**/*.js',
    paths.tmp + 'javascripts/app/js/constants.js' // dynamically generated by gulp task (ng-constants)
  ]
};
paths.guidance.push(paths.src + 'guidance/**/*.md');

// clean out assets folder
gulp.task('clean-pre', function() {
  return gulp
    .src([paths.dest, paths.tmp], {read: false})
    .pipe(plugins.clean());
});
gulp.task('clean-post', function() {
  return gulp
    .src(paths.tmp, {read: false})
    .pipe(plugins.clean());
});

// copy across web fonts
gulp.task('iconfont', ['sass-copy'], function(cb) {
  var fontName = 'cla-icons';

  return gulp.src(paths.icons)
    .pipe(plugins.iconfontCss({
      fontName: fontName,
      path: paths.src + 'stylesheets/_icons.scss',
      targetPath: '../stylesheets/_icons.scss',
      fontPath: '../fonts/'
    }))
    .pipe(plugins.iconfont({ fontName: fontName }))
    .on('codepoints', function(codepoints) {
      var options = {
        glyphs: codepoints,
        fontName: fontName,
        className: 'Icon'
      };
      // create template containing all fonts
      gulp.src(paths.src + 'fonts/icon-template.html')
        .pipe(plugins.consolidate('lodash', options))
        .pipe(plugins.rename({ basename: fontName }))
        .pipe(gulp.dest(paths.dest + 'fonts/'));
    })
    .pipe(gulp.dest(paths.tmp + 'fonts/'));
});
// copy fonts
gulp.task('fonts', ['iconfont'], function(cb) {
  gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.dest + 'fonts/'));
});

// copy & compile scss
gulp.task('sass-copy', function() {
  return gulp
    .src(paths.styles)
    .pipe(gulp.dest(paths.tmp + 'stylesheets/'));
});
gulp.task('sass', ['iconfont'], function() {
  gulp
    .src(paths.tmp + 'stylesheets/**/*.scss')
    .pipe(plugins.rubySass({
      loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
    }))
    .on('error', function (err) { console.log(err.message); })
    .pipe(gulp.dest(paths.dest + 'stylesheets/'));
});

// optimise images
gulp.task('images', function() {
  gulp
    .src(paths.images)
    .pipe(plugins.imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.dest + 'images'));
});

// static vendor files
gulp.task('vendor', function() {
  gulp
    .src(paths.vendor_static)
    .pipe(gulp.dest(paths.dest + 'javascripts/vendor/'));
});

// convert django cla_common constants into angular constants
gulp.task('ng-constants', function () {
  return gulp
    .src(paths.src + 'javascripts/app/constants.json')
    .pipe(plugins.ngConstant({
      name: 'cla.constants'
    }))
    // Writes config.js to dist folder
    .pipe(gulp.dest(paths.tmp + 'javascripts/app/js/'));
});

// angular partials
gulp.task('ng-templates', function(){
  return gulp.src(paths.ng_partials)
    .pipe(plugins.angularTemplates({module: 'cla.templates'}))
    .pipe(gulp.dest(paths.tmp + 'javascripts/app/partials/'));
});

// concat js files
gulp.task('js-concat', ['ng-constants', 'ng-templates'], function() {
  var concat = paths.scripts.vendor
                  .concat(paths.scripts.app);

  return gulp
    .src(concat)
    .pipe(plugins.concat('cla.main.js'))
    .pipe(gulp.dest(paths.dest + 'javascripts/'));
});

gulp.task('js-compile', ['js-concat'], function(){
  var src_path = paths.dest + 'javascripts/cla.main.js';

  return gulp.src(src_path)
    .pipe(plugins.closureCompiler({
      compilerPath: 'node_modules/closurecompiler/compiler/compiler.jar',
      fileName: 'cla.main.min.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5',
        warning_level: 'QUIET',
        compilation_level: 'WHITESPACE_ONLY',
      }
    }))
    .pipe(gulp.dest(paths.dest + 'javascripts/'));
});

// jshint js code
gulp.task('lint', function() {
  var lint = paths.scripts.app
                  .concat(['!' + paths.tmp + 'javascripts/app/partials/**/*']);

  gulp
    .src(lint)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

gulp.task('guidance-build', function() {
  var lunr = require('lunr'),
      gutil = require('gulp-util'),
      path = require('path'),
      through2 = require('through2'),
      fs = require('fs'),
      S = require('string'),
      index;

  index = lunr(function () {
    this.field('title', {boost: 10});
    this.field('tags', {boost: 8});
    this.field('body');
    this.ref('id');
  })
  index._claTitles = {};

  gulp.src(paths.guidance)
    .pipe(plugins.markdownToJson())
    .pipe(through2.obj(function (file, enc, callback) {
        // adding to index
      var jsonFile = JSON.parse(file.contents.toString()),
          fileName = path.basename(file.path, '.json');
      
      index.add({
        id: fileName,
        title: jsonFile.title,
        tags: jsonFile.tags,
        body: S(jsonFile.body).stripTags()
      });

      // non-standard thing
      index._claTitles[fileName] = jsonFile.title;

      // creating output file
      outputFile = new gutil.File({
        base: path.dirname(file.path),
        path: path.join(path.dirname(file.path), fileName+'.html'),
        contents: new Buffer(jsonFile.body)
      });

      this.push(outputFile);
      callback();
    }))
    .pipe(gulp.dest(paths.dest + 'guidance'))
    .pipe(gutil.buffer())
    .pipe(through2.obj(function (input, enc, callback) {
      var outputFile = fs.openSync(paths.dest + 'javascripts/guidance_index.json', 'w+'),
          indexJSON = index.toJSON();

      // non-standard thing
      indexJSON['_claTitles'] = index._claTitles;

      fs.writeSync(outputFile, JSON.stringify(indexJSON));
      fs.closeSync(outputFile);
    }));
});

// setup watches
gulp.task('watch', function() {
  var lr = require('gulp-livereload');
  lr.listen();

  gulp.watch(paths.fonts, ['fonts']);
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.icons, ['sass']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.vendor_static, ['vendor']);
  gulp.watch(paths.src + 'javascripts/**/*', ['lint', 'js-concat']);
  gulp.watch(paths.guidance, ['guidance-build']);
  // watch built files and send reload event
  gulp.watch(paths.dest + '**/*').on('change', lr.changed);
});

// setup default task
gulp.task('default', ['build']);
// run build
gulp.task('build', function() {
  runSequence('clean-pre', ['sass', 'fonts', 'images', 'vendor', 'guidance-build', 'lint', 'js-compile']);
});
