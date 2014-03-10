from django import forms
from django.utils.translation import ugettext as _

from core.forms import MultipleFormsForm

from ..exceptions import InconsistentStateException

from .base import CheckerWizardMixin, EligibilityMixin


class ContactDetailsForm(forms.Form):
    title = forms.ChoiceField(
        label=_(u'Title'), choices=(
            ('mr', 'Mr'),
            ('mrs', 'Mrs'),
            ('miss', 'Miss'),
            ('ms', 'Ms'),
            ('dr', 'Dr')
        )
    )
    full_name = forms.CharField(label=_(u'Full name'), max_length=300)
    postcode = forms.CharField(label=_(u'Postcode'), max_length=10)
    street = forms.CharField(
        label=_(u'Street'), max_length=250,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 21})
    )
    town = forms.CharField(label=_(u'Town'), max_length=100)
    mobile_phone = forms.CharField(label=_(u'Mobile Phone'), max_length=20)
    home_phone = forms.CharField(label=_('Home Phone'), max_length=20)


class ResultForm(EligibilityMixin, CheckerWizardMixin, forms.Form):
    def get_context_data(self):
        # eligibility check reference should be set otherwise => error
        self.check_that_reference_exists()

        return {
            'is_eligible': self.is_eligible()
        }

    def save(self, *args, **kwargs):
        # user must be eligible (double-checking) otherwise => error
        if not self.is_eligible():
            raise InconsistentStateException('You must be eligible to apply')

        return {
            'eligibility_check': {
                'reference': self.reference
            }
        }


class AdditionalNotesForm(forms.Form):
    notes = forms.CharField(
        required=False, max_length=500,
        label=_(u'Additional details about your problem'),
        widget=forms.Textarea(attrs={'rows': 5, 'cols': 80})
    )


class ApplyForm(EligibilityMixin, CheckerWizardMixin, MultipleFormsForm):
    forms_list = (
        ('contact_details', ContactDetailsForm),
        ('extra', AdditionalNotesForm)
    )

    def get_contact_details(self):
        data = self.cleaned_data['contact_details']
        return {
            'title': data['title'],
            'full_name': data['full_name'],
            'postcode': data['postcode'],
            'street': data['street'],
            'town': data['town'],
            'mobile_phone': data['mobile_phone'],
            'home_phone': data['home_phone']
        }

    def get_extra(self):
        data = self.cleaned_data['extra']
        return {
            'notes': data['notes']
        }

    def save(self):
        # eligibility check reference should be set otherwise => error
        self.check_that_reference_exists()

        # user must be eligible (double-checking) otherwise => error
        if not self.is_eligible():
            raise InconsistentStateException('You must be eligible to apply')

        # saving eligibility check notes
        post_data = {
            'notes': self.get_extra()['notes']
        }
        response = self.connection.eligibility_check(self.reference).patch(post_data)

        # saving case
        post_data = {
            'eligibility_check': self.reference,
            'personal_details': self.get_contact_details()
        }

        response = self.connection.case.post(post_data)

        return {
            'case': response
        }