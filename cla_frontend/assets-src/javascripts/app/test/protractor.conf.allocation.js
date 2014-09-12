(function () {
  'use strict';
  var extend = require('extend'),
      defaults = require('./protractor.conf');

  exports.config = extend(defaults.config, {
    // --- uncomment to use mac mini's ---
    // seleniumAddress: 'http://clas-mac-mini.local:4444/wd/hub',
    // baseUrl: 'http://Marcos-MacBook-Pro-2.local:8001/',

    jasmineNodeOpts: {
      defaultTimeoutInterval: 3000000
    },

    multiCapabilities: [
      {
        browserName: 'chrome'
      }
    ],

    specs: [
      'e2e/_allocation.js'
    ]
  });
})();