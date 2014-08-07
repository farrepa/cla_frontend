/* jshint undef:false, unused:false */
/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
(function(){
  'use strict';

  var protractor = require('protractor'),
      utils = require('./_utils');

  xdescribe('operatorApp', function() {
    // logs the user in before each test
    beforeEach(utils.setUp);

    afterEach(function() {
      browser.manage().logs().get('browser').then(function(browserLog) {
        //expect(browserLog.length).toEqual(0);
        console.log('log: ' + require('util').inspect(browserLog));
      });
    });
    
    describe('Suspend a case', function () {
      it('should suspend a case', function () {

        utils.createCase().then(function(_case) {
          var caseNum = _case;

          browser.findElement(by.cssContainingText('.CaseDetails-actions button', 'Close')).click();

          var suspend_link = by.cssContainingText('.CaseDetails-actions a', 'Suspend');
          expect(browser.isElementPresent(suspend_link)).toBe(true);
          browser.findElement(suspend_link).click();

          var modalEl = browser.findElement(by.css('div.modal'));
          modalEl.findElement(by.css('input[type="radio"][value="TERM"]')).click();
          modalEl.findElement(by.css('textarea[name="notes"]')).sendKeys('This case was suspended.');
          modalEl.findElement(by.css('button[type="submit"]')).click();
          expect(browser.isElementPresent(by.css('div.modal'))).toBe(false);

          utils.getCase(caseNum);

          checkOutcomeCode('TERM');
        });
      });

      function checkOutcomeCode(code) {
        var codeSpan = element.all(by.binding('log.code'));
        expect(codeSpan.get(0).getText()).toEqual(code);
      }
    });
  });
})();
