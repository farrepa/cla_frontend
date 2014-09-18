(function (){
  'use strict';

  var utils = require('../e2e/_utils'),
      CONSTANTS = require('../protractor.constants.js'),
      modelsRecipe = require('./_modelsRecipe');

  describe('Specialist Multiple Cases', function () {
    var case_ref1, case_ref2,
        createSplitBtn = element.all(by.name('split-case')).get(0),
        splitForm = element(by.name('split_case_frm')),
        submitBtn = splitForm.element(by.name('save-split-case')),
        cancelBtn = splitForm.element(by.cssContainingText('a', 'Cancel'));

    describe('As Operator', function () {
      beforeEach(utils.setUp);

      it('should create cases as operator and assign then to a provider', function () {
        modelsRecipe.Case.createAndAssign(1).then(function (reference) {
          case_ref1 = reference;
        });

        modelsRecipe.Case.createAndAssign(1).then(function (reference) {
          case_ref2 = reference;
        });
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });

    describe('As Provider', function () {
      beforeEach(utils.setUpAsProvider);

      function openSplitModal () {
        expect(createSplitBtn.isDisplayed()).toBe(true);
        createSplitBtn.click();
        expect(splitForm.isDisplayed()).toBe(true);
      }

      function fillInSplitForm (categoryVal, internal) {
        splitForm.element(by.css('[name="category"] option[value="' + categoryVal + '"]')).click();
        splitForm.element(by.css('[name="matter_type1"] option:last-child')).click();
        splitForm.element(by.css('[name="matter_type2"] option:last-child')).click();
        splitForm.element(by.css('[name=internal][value="' + internal + '"]')).click();
        splitForm.element(by.name('notes')).sendKeys('Notes');
        submitBtn.click();
      }

      function assertOutcomeCode (code) {
        expect(element.all(by.css('.CaseHistory-label:first-child')).get(0).getText()).toBe(code);
      }

      function assertError (error) {
        expect(
          splitForm.element(by.cssContainingText('.Error-message', error)).isDisplayed()
        ).toBe(true);
      }

      it('shouldnt\'t be able to split if the validation fails', function () {
        browser.get(CONSTANTS.providerBaseUrl + case_ref1 + '/');

        openSplitModal();

        // submit without filling in any data => validation error
        submitBtn.click();
        expect(splitForm.isDisplayed()).toBe(true);

        // choose same category of law and submit => validation error
        fillInSplitForm('family', true);
        expect(splitForm.isDisplayed()).toBe(true);

        // choose a category of law that the provider can't deal with and assign to same provider => validation error
        fillInSplitForm('benefits', true);
        expect(splitForm.isDisplayed()).toBe(true);
      });

      it('should be able to split a case and assign it to same provider if they can deal with that category of law', function () {
        // choose housing category
        fillInSplitForm('housing', true);

        // verify modal disappeared
        expect(splitForm.isPresent()).toBe(false);

        // verify outcome code REF-INT created
        assertOutcomeCode('REF-INT');

        // try to split again => validation error
        openSplitModal();
        fillInSplitForm('housing', true);
        expect(splitForm.isDisplayed()).toBe(true);
        assertError('This Case has already been split');
      });

      it('should be able to split a case and assign it back to an operator', function () {
        browser.get(CONSTANTS.providerBaseUrl + case_ref2 + '/');

        openSplitModal();

        // choose benefits category
        fillInSplitForm('benefits', false);

        // verify modal disappeared
        expect(splitForm.isPresent()).toBe(false);

        // verify outcome code REF-EXT created
        assertOutcomeCode('REF-EXT');

        // try to split again => validation error
        openSplitModal();
        fillInSplitForm('benefits', false);
        expect(splitForm.isDisplayed()).toBe(true);
        assertError('This Case has already been split');

        // dismiss the modal
        cancelBtn.click();
      });

      it('should logout', function () {
        this.after(function () {
          utils.logout();
        });
      });
    });
  });
})();