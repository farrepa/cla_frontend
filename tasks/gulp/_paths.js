(function(){
  'use strict';

  var paths = {
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
      paths.src + 'vendor/angular-messages/angular-messages.js',
      paths.src + 'vendor/angular-animate/angular-animate.js',
      paths.src + 'vendor/angular-sticky/sticky.js',
      paths.src + 'vendor/angular-resource/angular-resource.js',
      paths.src + 'vendor/angular-ui-router/release/angular-ui-router.js',
      paths.src + 'vendor/ui-router-extras/release/ct-ui-router-extras.js',
      paths.src + 'vendor/angular-ui-select2/src/select2.js',
      paths.src + 'vendor/angular-i18n/angular-locale_en-gb.js',
      paths.src + 'vendor/moment/moment.js',
      paths.src + 'vendor/angular-moment/angular-moment.js',
      paths.src + 'vendor/angular-blocks/dist/angular-blocks.js',
      paths.src + 'vendor/lunr.js/lunr.js',
      paths.src + 'vendor/rome/dist/rome.standalone.js', // datepicker
      paths.src + 'javascripts/vendor/xeditable.js',
      paths.src + 'javascripts/vendor/ui-bootstrap-custom-tpls-0.10.0.js',
      paths.src + 'vendor/conduitjs/lib/conduit.js',
      paths.src + 'vendor/postal.js/lib/postal.js',
      paths.src + 'vendor/angular-loading-bar/build/loading-bar.js',
      paths.src + 'vendor/socket.io-client/socket.io.js',
      paths.src + 'vendor/angular-socket-io/socket.js',
      paths.src + 'vendor/angulartics/src/angulartics.js',
      paths.src + 'vendor/angulartics/src/angulartics-piwik.js',
      paths.src + 'vendor/angular-hotkeys/build/hotkeys.js',
      paths.src + 'vendor/angular-local-storage/dist/angular-local-storage.js',
      paths.src + 'vendor/angular-diff-match-patch/angular-diff-match-patch.js',
      paths.src + 'vendor/google-diff-match-patch/diff_match_patch.js',
    ],
    app: [
      paths.src + 'javascripts/app/js/app.js',
      paths.tmp + 'javascripts/app/partials/**/*', // dynamically generated by gulp task (ng-templates)
      paths.src + 'javascripts/app/js/**/*.js',
      paths.tmp + 'javascripts/app/js/constants.js' // dynamically generated by gulp task (ng-constants)
    ]
  };
  paths.guidance.push(paths.src + 'guidance/**/*.md');

  module.exports = paths;
})();
