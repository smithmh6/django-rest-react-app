"""
View classes used for dashboards app API endpoints.
"""

from django.conf import settings
from datetime import datetime as dt
from datetime import timedelta
import decimal
from functools import reduce
import json
import requests
from django.contrib.contenttypes.models import ContentType
from django.db.models import Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from moe.models import Project as MoeProject
from moe.models import Payment as MoePayment
from purchasing.models import PurchaseItem
from shipping.models import Shipment, Status

class SpendingYTD(APIView):
    """
    View for getting the sum of costs of all purchases
    for the current year.
    """
    def get(self, request, format=None):

        purchases = PurchaseItem.objects.filter(
            created__year = timezone.now().year,
            approved = "APPR",
            status__in = ['PUR', 'SHIP', 'PREC', 'RECV'])
        total_spending = reduce((lambda t, purchase: t + purchase.total), purchases, 0)

        today_minus_year = timezone.now() - timedelta(days=365)
        prev_year = PurchaseItem.objects.filter(
            created__year = timezone.now().year - 1,
            created__lte = today_minus_year,
            approved = "APPR",
            status__in = ['PUR', 'SHIP', 'PREC', 'RECV'])
        prev_total = reduce((lambda t, purchase: t + purchase.total), prev_year, 0)

        return Response({"current_year": total_spending, "prev_year": prev_total})

class MoeBookedYTD(APIView):
    """
    View for getting the sum of of all Moe payments
    for the current year.
    """
    def get(self, request, format=None):
        included_projects = MoeProject.objects.filter(delivery__year=timezone.now().year).exclude(purchase_order__isnull=True)
        booked_revenue = reduce((lambda t, project: t + project.quote_price), included_projects, 0)

        today_minus_year = timezone.now() - timedelta(days=365)
        prev_projects = MoeProject.objects.filter(
            delivery__year = timezone.now().year - 1,
            delivery__lte = today_minus_year).exclude(purchase_order__isnull=True)
        prev_booked = reduce((lambda t, project: t + project.quote_price), prev_projects, 0)

        return Response({"current_total": booked_revenue, "prev_total": prev_booked})

class CumulativeSpending(APIView):
    """
    View that returns a list that, for each purchase, contains the date
    requested, and the total spent at that point in time.
    """
    def get(self, request, format=None):
        daily_totals = PurchaseItem.objects.filter(approved="APPR").values('created').order_by('created').annotate(daily_total=Sum('total'))
        cumulative_fn = lambda array, item: array + [{'requested': item['created'], 'cumulative_total': item['daily_total'] + array[-1]['cumulative_total']}]
        cumulative_totals = reduce(cumulative_fn, daily_totals, [{'cumulative_total': 0}])[1:]

        predicted_vals = []
        predicted_dates = []
        predicted_totals = []

        # generate a 30 day prediction
        window = 30
        for i in range(window):
            xvals = cumulative_totals[-window:][i:]
            xvals = [round(point['cumulative_total'], 2) for point in xvals]

            # update xvals, insert new predictions at end
            for j in range(len(predicted_vals)):
                xvals.insert(-1, predicted_vals[j])

            # make prediction
            input_data = {"instances": [[[float(x) for x in xvals]]]}
            payload = json.dumps(input_data)
            url = settings.FORECAST_MODEL_HOST
            headers = {"content-type": "application/json"}

            model_response = requests.post(url, data=payload, headers=headers).json()

            # add to predicted values
            predicted_vals.append(model_response['predictions'][0][0])

        # generate future dates
        for n in range(window):
            predicted_dates.append(cumulative_totals[-1]['requested'] + timedelta(days=n))

        for m in range(window):
            predicted_totals.append({'requested': predicted_dates[m], 'cumulative_total': predicted_vals[m]})



        return Response({"cumulative_totals": cumulative_totals, "predicted_totals": predicted_totals})

class CumulativeRevenue(APIView):

    """
    View that returns a list that, for each value-adding object, contains the date
    created/shipped, and the total revenue generated at that time; including
    RTT ship batches, AR ship batches, and Moe payments made.
    """
    def get(self, request, format=None):
        
        tar_oc_sku_content_type = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku")
        tar_fp_sku_content_type = ContentType.objects.get(app_label="texturedar", model="finalproductsku")
        ar_shipment_content_types = [tar_oc_sku_content_type, tar_fp_sku_content_type]
        
        rtt_fp_sku_content_type = ContentType.objects.get(app_label='reticle', model='finalproductsku')
        
        delivered_status = Status.objects.get(code="DELIVERED")
        
        ar_shipments = Shipment.objects.filter(item_content_type__in=ar_shipment_content_types, status=delivered_status)
        rtt_shipped = Shipment.objects.filter( item_content_type=rtt_fp_sku_content_type, status=delivered_status,)
        
        moe_payments = MoePayment.objects.all()

        # Normalize querysets to a common format
        rtt_normalized = [{'date': dt.date(shipment.created), 'value': shipment.value} for shipment in rtt_shipped]
        ar_normalized = []
        for batch in ar_shipments:
            if batch.value is not None:
                ar_normalized.append({
                    'date': dt.date(batch.created),
                    'value': decimal.Decimal(batch.value)
                })
        moe_normalized = [{'date': payment.paid, 'value': payment.amount} for payment in moe_payments]

        # Merge querysets together and sort by date
        merged = rtt_normalized + ar_normalized + moe_normalized
        sorted_items = sorted(merged, key=lambda item: item['date'])

        # Use a reduce function to get the accumulated totals
        cumulative_fn = lambda array, item: array + [{'date': item['date'], 'cumulative_total': item['value'] + array[-1]['cumulative_total']}]
        cumulative_totals = reduce(cumulative_fn, sorted_items, [{'cumulative_total': 0}])[1:]
        return Response(cumulative_totals)

class ARValueYTD(APIView):
    """
    View that returns the summed value of all shipped AR batches
    created this year.
    """
    def get(self, request, format=None):
        oc_sku_content_type = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku")
        fp_sku_content_type = ContentType.objects.get(app_label="texturedar", model="finalproductsku")
        ar_shipment_content_types = [oc_sku_content_type, fp_sku_content_type]
        delivered_status = Status.objects.get(code="DELIVERED")
        ar_shipments = Shipment.objects.filter(item_content_type__in=ar_shipment_content_types, status=delivered_status)

        today_minus_year = timezone.now() - timedelta(days=365)

        ar_shipments_ytd = ar_shipments.filter(created__year=timezone.now().year)
        ar_shipments_last_year = ar_shipments.filter(created__year=timezone.now().year - 1, created__lte=today_minus_year)

        ytd_value = reduce((lambda total, shipment: total + shipment.value), ar_shipments_ytd, 0)
        prev_year_value = reduce((lambda total, shipment: total + shipment.value), ar_shipments_last_year, 0)

        return Response({'current_total': ytd_value, 'prev_total': prev_year_value})
