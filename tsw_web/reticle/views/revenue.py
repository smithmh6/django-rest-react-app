import functools, datetime, pytz
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework.views import APIView
from rest_framework.response import Response
from shipping.models import Shipment
import pytz
from datetime import datetime as dt

class RTTValueYTD(APIView):
    """
    View for getting the sum of all RTT ship batches' value
    for the current year.
    """
    def get(self, request, format=None):
        rtt_shipments = Shipment.objects.filter(status='DELIVERED', item_content_type=ContentType.objects.get(app_label='reticle', model='finalproductsku'))
        ytd_shipments = rtt_shipments.filter(created__year=timezone.now().year)
        total_value = functools.reduce((lambda t, shipment: t+shipment.value), ytd_shipments, 0)

        today_minus_year = timezone.now() - datetime.timedelta(days=365)
        prev_shipments = rtt_shipments.filter(created__year = timezone.now().year - 1, created__lte = today_minus_year)
        prev_value = functools.reduce((lambda t, shipment: t+shipment.value), prev_shipments, 0)

        return Response({"current_total": total_value, "prev_total": prev_value})