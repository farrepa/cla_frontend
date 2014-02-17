# -*- coding: utf-8 -*-
from django import forms
from django.core.exceptions import ValidationError
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext as _

from core.forms import MultipleFormsForm
from api.client import connection

from django.forms.formsets import formset_factory

from .fields import RadioBooleanField

OWNED_BY_CHOICES = [
    (1, 'Owned by me'),
    (0, 'Joint names')
]

class CheckerWizardMixin(object):

    # extra_kwargs = ['has_partner',
    #                 'has_property',
    #                 'more_property',
    #                 'has_children']

    def __init__(self, *args, **kwargs):

        self.reference = kwargs.pop('reference', None)

        # remove kwargs not needed by other forms
        # for ekw in self.extra_kwargs:
        #     if ekw in kwargs:
        #         del kwargs[ekw]

        super(CheckerWizardMixin, self).__init__(*args, **kwargs)

    def save(self):
        raise NotImplementedError()

    def get_context_data(self):
        return {}


class YourProblemForm(CheckerWizardMixin, forms.Form):
    """
    Gets the problem choices from the backend API.
    """
    category = forms.ChoiceField(
        label=_(u'Is your problem about?'),
        choices=(), widget=forms.RadioSelect()
    )
    notes = forms.CharField(
        required=False, max_length=500,
        label=_(u'You can also provide additional details about your case in the text box below.'),
        widget=forms.Textarea(attrs={'rows': 5, 'cols': 80})
    )

    def __init__(self, *args, **kwargs):
        super(YourProblemForm, self).__init__(*args, **kwargs)

        self._categories = connection.category.get()

        def get_category_choice(category):
            id = category['id']
            label = category['name']
            if category['description']:
                label = mark_safe(u'%s <br> <p class="bs-callout bs-callout-warning">%s</p>' % (label, category['description']))
            return (id, label)
        self.fields['category'].choices = [get_category_choice(cat) for cat in self._categories]

    def _get_category_by_id(self, id):
        for cat in self._categories:
            if id == str(cat['id']):
                return cat
        return None

    def clean(self, *args, **kwargs):
        cleaned_data = super(YourProblemForm, self).clean(*args, **kwargs)

        if self._errors: # skip immediately
            return cleaned_data

        category = cleaned_data.get('category')
        if category:
            categoryData = self._get_category_by_id(category)
            cleaned_data['category_name'] = categoryData['name']

        return cleaned_data

    def save(self):
        data = {
            'category': self.cleaned_data.get('category'),
            'notes': self.cleaned_data.get('notes', '')
        }

        if not self.reference:
            return connection.eligibility_check.post(data)

        return connection.eligibility_check(self.reference).patch(data)


class YourDetailsForm(CheckerWizardMixin, forms.Form):
    has_partner = RadioBooleanField(required=True,
                                     label='Do you have a partner?'
    )

    has_benefits = RadioBooleanField(required=True,
                                     label='Are you or your partner on any benefits?'
    )


    has_children = RadioBooleanField(required=True,
                                     label='Do you have children?'
    )


    caring_responsibilities = RadioBooleanField(required=True,
                                         label='Do you any other caring responsibilities??'
    )

    own_property = RadioBooleanField(required=True,
                                         label='Do you or your partner own a property?'
    )

    risk_homeless = RadioBooleanField(required=True,
                                         label='Are you or your partner aged 60 or over?'
    )

    older_than_sixty = RadioBooleanField(required=True,
                                         label='Do you have a partner?'
    )

    def save(self, *args, **kwargs):
        return {
            'reference': self.reference
        }

class YourFinancesOtherPropertyForm(CheckerWizardMixin, forms.Form):
    other_properties = RadioBooleanField(required=True,
                                         label='Do you own another property?'
    )

    def clean_other_properties(self):
        other_properties = self.cleaned_data['other_properties']
        return bool(other_properties)

    def clean(self):
        if self.cleaned_data.get('other_properties'):
            raise ValidationError('Please fill in details of your other properties.')
        return self.cleaned_data

class YourFinancesPropertyForm(CheckerWizardMixin, forms.Form):
    worth = forms.IntegerField(label=u"How much is it worth?", min_value=0)
    mortgage_left = forms.IntegerField(
        label=u"How much is left to pay on the mortgage?", min_value=0
    )
    owner = RadioBooleanField(
        label=u"Is the property owned by you or is it in joint names?",
        choices=OWNED_BY_CHOICES,
    )
    share = forms.IntegerField(
        label=u'What is your share of the property?',
        min_value=0, max_value=100
    )


    def clean_owner(self):
        data = self.cleaned_data['owner']
        return bool(data)


    def clean(self):
        data = self.cleaned_data
        data['equity'] = max(data.get('worth',0) - data.get('mortgage_left',0), 0)
        return data


class YourFinancesSavingsForm(CheckerWizardMixin, forms.Form):
    bank = forms.IntegerField(
        label=u"Do you have any money saved in a bank or building society?",
        min_value=0
    )
    investments = forms.IntegerField(
        label=u"Do you have any investments, shares, ISAs?", min_value=0
    )
    valuable_items = forms.IntegerField(
        label=u"Do you have any valuable items over £££ each?", min_value=0
    )
    money_owed = forms.IntegerField(
        label=u"Do you have any money owed to you?", min_value=0
    )

class YourFinancesIncomeForm(CheckerWizardMixin, forms.Form):

    earnings_per_month = forms.IntegerField(
        label=u"Earnings per month",
        min_value=0
    )

    other_income_per_month = forms.IntegerField(
        label=u"Other income per month?",
        min_value=0
    )

    self_employed = RadioBooleanField(
        label=u"Are you self employed?",
        initial=0
    )


class YourFinancesDependentsForm(CheckerWizardMixin, forms.Form):
    dependants_old = forms.IntegerField(label='Children aged 16 and over',
                                        required=False,
                                        min_value=0)

    dependants_young = forms.IntegerField(label='Children aged 15 and under',
                                          required=False,
                                          min_value=0)


class YourFinancesForm(CheckerWizardMixin, MultipleFormsForm):

    YourFinancesPropertyFormSet = formset_factory(
        YourFinancesPropertyForm,
        extra=1,
        max_num=20,
        validate_max=True,
    )

    formset_list = (
        ('property', YourFinancesPropertyFormSet),
    )

    forms_list = (
        ('your_other_properties', YourFinancesOtherPropertyForm),
        ('your_savings', YourFinancesSavingsForm),
        ('partners_savings', YourFinancesSavingsForm),
        ('your_income', YourFinancesIncomeForm),
        ('partners_income', YourFinancesIncomeForm),
        ('dependants', YourFinancesDependentsForm)
    )

    def __init__(self, *args, **kwargs):
        # pop these from kwargs
        self.has_partner = kwargs.pop('has_partner', True)
        self.has_property = kwargs.pop('has_property', True)
        self.more_property = kwargs.pop('more_property', True)
        self.has_children = kwargs.pop('has_children', True)

        new_forms_list = dict(self.forms_list)
        new_formset_list = dict(self.formset_list)
        if not self.has_partner:
            del new_forms_list['partners_savings']
            del new_forms_list['partners_income']
        if not self.has_property:
            del new_formset_list['property']
            del new_forms_list['your_other_properties']

        self.forms_list = new_forms_list.items()
        self.formset_list = new_formset_list.items()

        super(YourFinancesForm, self).__init__(*args, **kwargs)

    def get_savings(self, key):
        data = self.cleaned_data
        return {
            'bank_balance': data[key].get('bank', 0),
            'asset_balance': data[key].get('valuable_items', 0),
            'credit_balance': data[key].get('money_owed', 0),
            'investment_balance': data[key].get('investments', 0),
        }

    def get_income(self, key):
        data = self.cleaned_data
        return {
            'earnings': data[key].get('earnings_per_month', 0),
            'other_income': data[key].get('other_income_per_month', 0)
        }


    def get_finances(self):
        your_finances = self.get_savings('your_savings')
        partner_finances = self.get_savings('partners_savings')
        your_finances.update(self.get_income('your_income'))
        partner_finances.update(self.get_income('partners_income'))
        return your_finances, partner_finances

    def get_properties(self):
        def _transform(property):
            return {
                'equity': property['equity'],
                'share': property['share'],
                'value': property['worth']
            }
        properties = self.cleaned_data.get('property', [])
        return map(_transform, properties)

    def save(self):
        data = self.cleaned_data
        your_finances, partner_finances = self.get_finances()
        post_data = {
            'your_finances': your_finances,
            'partner_finances': partner_finances,
            'dependants_young': data.get('dependant_young', 0),
            'dependants_old': data.get('dependant_old', 0),
            'property_set': self.get_properties()
        }
        if not self.reference:
            return connection.eligibility_check.post(post_data)

        return connection.eligibility_check(self.reference).patch(post_data)


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


class ResultForm(CheckerWizardMixin, MultipleFormsForm):
    forms_list = (
        ('contact_details', ContactDetailsForm),
    )

    def __init__(self, *args, **kwargs):
        super(ResultForm, self).__init__(*args, **kwargs)
        # assert self.reference

        new_forms_list = dict(self.forms_list)
        new_formset_list = dict(self.formset_list)
        if not self.is_eligible:
            del new_forms_list['contact_details']

        self.forms_list = new_forms_list.items()

    @property
    def is_eligible(self):
        # TODO should use the API to test if the user is eligible?
        return True

    def get_context_data(self):
        return {
            'is_eligible': self.is_eligible
        }

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

    def save(self):
        post_data = {
            'eligibility_check': self.reference,
            'personal_details': self.get_contact_details()
        }
        return connection.case.post(post_data)
