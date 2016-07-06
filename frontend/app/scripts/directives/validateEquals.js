'use strict';

angular.module('psJwtApp')
  .directive('validateEquals', function () {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl){
        function validateEquals(value){
          var valid = (value === scope.$eval(attrs.validateEquals));
          ngModelCtrl.$setValidity('equal', valid);
          return valid ? value: undefined;
        }

        ngModelCtrl.$parsers.push(validateEquals);
        ngModelCtrl.$formatters.push(validateEquals);

        scope.$watch(attrs.validateEquals, function(){
          ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue);
        });
      }
    };
  });
