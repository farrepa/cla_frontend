# -*- encoding: utf-8 -*-
"""View for postcode lookups"""

# from django.contrib.auth.decorators import login_required

# import postcodeinfo
from django.conf import settings
from cla_common.address_lookup.ordnance_survey import FormattedAddressLookup


# @login_required
def postcode_lookup(request):
    print("REQUEST", request)
    postcode = request.GET.get('postcode')
    print(postcode)
    key = settings.OS_PLACES_API_KEY
    formatted_address = FormattedAddressLookup(key=key).by_postcode(postcode)
    print("formatted_address", formatted_address)
    response = [{'formatted_address': address } for address in formatted_address if address]
    return Response(response)


#     try:
#         return addresses_response(request)

#     except postcodeinfo.NoResults:
#         return no_results_response()

#     except postcodeinfo.PostcodeInfoException as e:
#         return error_response(e)


# def addresses_response(request):
#     return JsonResponse(
#         addresses_for_postcode_from_url_params(request),
#         safe=False
#     )


# def addresses_for_postcode_from_url_params(request):
#     postcode = request.GET.get('postcode')
#     addresses = postcodeinfo.Client().lookup_postcode(postcode).addresses
#     print("ADDRESSESS inside addresses_for_postcode_from_url_params", addresses)
#     re
    # return map(formatted_address_only, addresses)
    # return postcode_addresses(postcode_from_url_params(request))


# def postcode_from_url_params(request):
#     return request.GET.get('postcode')


# def postcode_addresses(postcode):
#     addresses = postcodeinfo.Client().lookup_postcode(postcode).addresses
#     return map(formatted_address_only, addresses)


# def formatted_address_only(address):
#     return dict(filter(formatted_address_item, address.iteritems()))


# def formatted_address_item(item):
#     key, val = item
#     return key == 'formatted_address'


# def no_results_response():
#     print("Calling no_results_response")
#     return JsonResponse([], safe=False, status=404)


# def error_response(exc):
#     print("Calling error_response")
#     return JsonResponse({'error': str(exc)}, status=500)
