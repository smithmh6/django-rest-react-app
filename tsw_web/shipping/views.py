"""
Views used in shipping app.
"""

import copy
import traceback as tb
import datetime
from functools import reduce
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .models import Customer, Warehouse, Status, Shipment
from .serializers import (CustomerSerializer,
                          WarehouseSerializer,
                          StatusSerializer,
                          ShipmentSerializer,
                          TARPartSerializer)
from texturedar.models import Part as TARPart
from reticle.models import Part as RTTPart
from reticle.serializers import ShipPartSerializer

class CustomerListView(ModelViewSet):
    """
    Customer API List View.
    """
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()


class WarehouseListView(ModelViewSet):
    """
    Warehouse API List View.
    """
    serializer_class = WarehouseSerializer
    queryset = Warehouse.objects.all()

class StatusListView(ModelViewSet):
    """
    Status API List View.
    """
    serializer_class = StatusSerializer
    queryset = Status.objects.all()

class ShipmentListView(ModelViewSet):
    """
    Shipment API List View.
    """
    serializer_class = ShipmentSerializer
    queryset = Shipment.objects.all()

    def create(self, request):

        try:
            data = copy.deepcopy(request.data)

            # Set user and initial step, and SKU content type
            data['user'] = request.user

            if data.get('parts') is None:
                    return Response({
                        'message': "(ShipmentListView.create) Unable to create new shipment. No part IDs provided in data.",
                    }, status=status.HTTP_400_BAD_REQUEST)

            parts = data.pop('parts')

            with transaction.atomic():

                # Validate data and create new shipment
                shipment_serializer = self.get_serializer(data=data)

                if not shipment_serializer.is_valid():
                    return Response({
                        'message': "(ShipmentListView.create) Unable to create new shipment.\n" + str(shipment_serializer.errors),
                        'errors': shipment_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                shipment_serializer.save()
                new_shipment = shipment_serializer.data
                
                part_qs = []
                
                # Determine which part model to update according to item_content_type
                item_content_type = int(data.get('item_content_type'))
                
                tar_oc_id = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku").id
                tar_fp_id = ContentType.objects.get(app_label="texturedar", model="finalproductsku").id
                rtt_fp_id = ContentType.objects.get(app_label="reticle", model="finalproductsku").id
                
                if (item_content_type == tar_oc_id or 
                    item_content_type == tar_fp_id):
                    part_qs = TARPart.objects.filter(id__in=parts)
                elif (item_content_type == rtt_fp_id):
                    part_qs = RTTPart.objects.filter(id__in=parts)

                # Case: couldn't find correct parts
                if len(parts) != len(part_qs):
                    return Response({
                        'message': "(ShipmentListView.create) Unable to create new shipment. At least one part ID could not be found.",
                        'errors': shipment_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                shipment_id = new_shipment['id']

                shipment_content_type = ContentType.objects.get(app_label="shipping", model="shipment")

                for part in part_qs:
                    part.shipment_object_id = shipment_id
                    part.shipment_content_type = shipment_content_type
                    if (item_content_type == rtt_fp_id): 
                        part.step_object_id = 31 # Move RTT from WIP3 to Transfer
                        part.wip3_out = timezone.now()
                    part.save()

                return Response(shipment_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as err:
            return Response({
                        'message': "(ShipmentListView.create) Exception occured.\n" + str(err) + '\n' + str(tb.format_exc()),
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):

        if 'status' in request.data and request.data['status'] == 'DELIVERED':
            shipment = self.get_object()
            shipment_parts = []
            
            item_type = ContentType.objects.get(id=shipment.item_content_type_id)
            
            # TODO: Simplify by mapping app labels to item models
            # Access through dict structure, instead of conditional logic.
            if (item_type.app_label == "texturedar"):
                shipment_parts = TARPart.objects.filter(shipment_object_id=shipment.id)
            elif (item_type.app_label == "reticle"):
                shipment_parts = RTTPart.objects.filter(shipment_object_id=shipment.id)
            else:
                raise Exception(f"Unknown content type ID: {shipment.item_content_type_id}")
            
                
            oc_sku_content_type = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku")
            fp_sku_content_type = ContentType.objects.get(app_label="texturedar", model="finalproductsku")
            reticle_fp_content_type = ContentType.objects.get(app_label="reticle", model="finalproductsku")

            def get_value_from_item(content_type_id, id):
                content_type = ContentType.objects.get_for_id(content_type_id)
                # TODO: Simplify by mapping SKU content types to fields to access
                # Use dict structure instead of conditional logic
                obj = content_type.get_object_for_this_type(id=id)
                if content_type_id == oc_sku_content_type.id:
                    return obj.cost
                if content_type_id == fp_sku_content_type.id:
                    return obj.price
                if content_type_id == reticle_fp_content_type.id:
                    return obj.price
                raise Exception(f"Unknown content type ID: {content_type_id}")

            # On OC SKU, only allow closing if all corresponding batches are also closed
            if (shipment.item_content_type_id == oc_sku_content_type.id):

                open_batches = set()

                for part in shipment_parts:
                    if not part.batch.closed:
                        open_batches.add(part.batch.name)

                if len(open_batches) > 0:
                    return Response({
                        'status': 'Bad Request',
                        'message': f"Cannot close shipment when corresponding batch is still open. \nOpen Batches: {open_batches}",
                        }, status=status.HTTP_400_BAD_REQUEST)

            value = request.data.get('value', shipment.value)

            if value is None:
                item_content_type_id = request.data.get('item_content_type', shipment.item_content_type.id)
                item_object_id = request.data.get('item_object_id', shipment.item_object_id)
                shipment_unit_value = get_value_from_item(item_content_type_id, item_object_id)
                # TODO: Update logic here to be more efficient.
                # Currently filtering twice to check for None OR for first fail 1
                # Also relies on the fact that currently TAR parts have no failcode of 1
                # Ideally, reticle needs to default no fails to `null`.
                request.data['value'] = shipment_unit_value * len(shipment_parts.filter(fail1_object_id=None) | shipment_parts.filter(fail1_object_id=1))

        return super().partial_update(request, *args, **kwargs)

class OpenShipmentListView(ModelViewSet):
    """
    View for queryset restricted to only non-completed shipments
    """

    serializer_class = ShipmentSerializer
    queryset = Shipment.objects.exclude(status='DELIVERED')

    def patch(self, request, *args, **kwargs):
        try:

            with transaction.atomic():

                ret = []

                for shipment_data in request.data:
                    shipment_id = shipment_data.pop('id')
                    shipment_instance = Shipment.objects.get(id=shipment_id)
                    shipment_serializer = self.serializer_class(instance=shipment_instance, data=shipment_data, partial=True)
                    if (not shipment_serializer.is_valid()):
                        return Response({
                                    'status': 'Bad Request',
                                    'message': "Unable to update shipment parts",
                                    'errors': shipment_serializer.errors
                                }, status=status.HTTP_400_BAD_REQUEST)

                    shipment_serializer.save()
                    ret.append(shipment_serializer.data)

                return Response(ret, status=status.HTTP_200_OK)

        except Exception as err:
            return Response({
                        'status': 'Internal Server Error',
                        'message': '(ShipmentPartsView.patch) Serializer error occured: ',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ShipmentPartsView(ModelViewSet):

    def get_serializer_class(self):
        
        oc_sku_content_type = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku")
        fp_sku_content_type = ContentType.objects.get(app_label="texturedar", model="finalproductsku")
        reticle_fp_content_type = ContentType.objects.get(app_label="reticle", model="finalproductsku")
        
        shipment_id = self.kwargs['id']
        shipment = Shipment.objects.get(id=shipment_id)
        # TODO: Simplify to dict mapping IDs to part serializers
        if (shipment.item_content_type == oc_sku_content_type or 
            shipment.item_content_type == fp_sku_content_type):
            return TARPartSerializer
        if (shipment.item_content_type == reticle_fp_content_type):
            return ShipPartSerializer
        raise Exception(f'No corresponding serializer for shipment content type with ID {shipment.item_content_type}')

    def get_queryset(self):
        
        oc_sku_content_type = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku")
        fp_sku_content_type = ContentType.objects.get(app_label="texturedar", model="finalproductsku")
        reticle_fp_content_type = ContentType.objects.get(app_label="reticle", model="finalproductsku")
        
        shipment_id = self.kwargs['id']
        shipment = Shipment.objects.get(id=shipment_id)
        # TODO: Simplify to dict mapping IDs to part classes
        if (shipment.item_content_type == oc_sku_content_type or 
            shipment.item_content_type == fp_sku_content_type):
            return TARPart.objects.filter(shipment_object_id=self.kwargs['id'])
        if (shipment.item_content_type == reticle_fp_content_type):
            return RTTPart.objects.filter(shipment_object_id=self.kwargs['id'])
        raise Exception(f'No corresponding queryset for shipment content type with ID {shipment.item_content_type}')

    def patch(self, request, *args, **kwargs):
        try:
            serializer_class = self.get_serializer_class()
            part_serializer = serializer_class(instance=self.get_queryset(), data=request.data, many=True, partial=True)

            if (not part_serializer.is_valid()):
                return Response({
                            'status': 'Bad Request',
                            'message': "Unable to update shipment parts",
                            'errors': part_serializer.errors
                        }, status=status.HTTP_400_BAD_REQUEST)

            part_serializer.save()
            return Response(part_serializer.data, status=status.HTTP_200_OK)

        except Exception as err:
            return Response({
                        'status': 'Internal Server Error',
                        'message': '(ShipmentPartsView.patch) Serializer error occured: ',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
