'use strict';

//ROUTES
angular.module('cla.app')
  .config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    var states = angular.module('cla.states');
    $stateProvider
      .state('case_list', states.CaseListState)
      .state('case_detail', states.CaseDetailState)
      .state('case_detail.edit', states.CaseEditDetailState);
  });

