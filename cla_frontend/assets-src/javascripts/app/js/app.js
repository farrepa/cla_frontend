'use strict';
(function(){

  angular.module('cla.controllers',[]);
  angular.module('cla.services',['ngResource']);
  angular.module('cla.filters',[]);
  angular.module('cla.directives',[]);
  angular.module('cla.states',[]);
  angular.module('cla.utils',[]);
  angular.module('cla.templates',[]);
  angular.module('cla.states.provider',['cla.states']);
  angular.module('cla.states.operator',['cla.states']);
  angular.module('cla.routes', ['cla.states']);


  // Operator App

  angular.module('cla.operatorSettings', []).constant('AppSettings', {
    BASE_URL: '/call_centre/',
    timerEnabled: function() {
      return true;
    },
    statesModule: 'cla.states.operator'
  });

  angular.module('cla.operatorApp',
    [
      'cla.operatorSettings',
      'cla.states',
      'ngSanitize',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.services',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'sticky'
    ])
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    })
    .run(function ($rootScope, $state, $stateParams, Timer) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      Timer.install();
    });


  // Provider App

  angular.module('cla.providerSettings', []).constant('AppSettings', {
    BASE_URL: '/provider/',
    timerEnabled: function() {
      return false;
    },
    statesModule: 'cla.states.provider'
  });

  angular.module('cla.providerApp',
    [
      'cla.providerSettings',
      'cla.states',
      'ngSanitize',
      'angularMoment',
      'angular-blocks',
      'xeditable',
      'ui.router',
      'cla.constants',
      'cla.controllers',
      'cla.services',
      'cla.filters',
      'cla.directives',
      'cla.utils',
      'cla.templates',
      'cla.routes',
      'ui.bootstrap',
      'ui.select2',
      'sticky'
    ])
    .config(function($resourceProvider) {
      $resourceProvider.defaults.stripTrailingSlashes = false;
    })
    .run(function ($rootScope, $state, $stateParams, Timer) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      Timer.install();
    });

})();
