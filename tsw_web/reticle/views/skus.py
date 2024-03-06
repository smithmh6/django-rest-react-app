"""
SKU view classes for reticle.
"""

# import dependencies
import copy
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import status
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
import traceback as tb
from ..serializers import (RawMaterialSkuSerializer,
                           CoatSkuSerializer,
                           SheetSkuSerializer,
                           DiceSkuSerializer,
                           FinalProductSkuSerializer,
                           PhotoMaskSkuSerializer,
                           ShipPartSerializer)
from ..models import (RawMaterialSku,
                      CoatSku,
                      SheetSku,
                      DiceSku,
                      FinalProductSku,
                      PhotomaskSku,
                      DiceBatch,
                      Step)
from purchasing.models import Vendor

class SkuListView(ModelViewSet):
    """
    Retrieves the appropriate SKU objects according
    to the sku_type.
    """

    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """

        sku_type = self.kwargs.get('sku_type', None)

        serializers = {
            'rawmaterial': RawMaterialSkuSerializer,
            'coat': CoatSkuSerializer,
            'sheet': SheetSkuSerializer,
            'dice': DiceSkuSerializer,
            'finalproduct': FinalProductSkuSerializer,
            'photomask': PhotoMaskSkuSerializer
        }

        return serializers.get(sku_type, None)

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """

        sku_type = self.kwargs.get('sku_type', None)

        if sku_type == 'rawmaterial':
            return RawMaterialSku.objects.all().order_by('name')
        elif sku_type == 'coat':
            return CoatSku.objects.all().order_by('name')
        elif sku_type == 'sheet':
            return SheetSku.objects.all().order_by('-modified')
        elif sku_type == 'dice':
            return DiceSku.objects.all().order_by('-modified')
        elif sku_type == 'finalproduct':
            return FinalProductSku.objects.all().order_by('-modified')
        elif sku_type == 'photomask':
            return PhotomaskSku.objects.all().order_by('-started')
        else:
            return None

    def create(self, request, *args, **kwargs):

        try:
            
            sku_type = self.kwargs.get('sku_type', None)

            # deep copy request data for mutation
            data = copy.deepcopy(request.data)

            if (sku_type == 'photomask'):
                # Update vendor information
                vendor_name = data.get('vendor')
                vendor_id = Vendor.objects.get(name=vendor_name).id
                vendor_content_type_id = ContentType.objects.get(app_label='purchasing', model='vendor').id
                data['vendor_object_id'] = vendor_id
                data['vendor_content_type'] = vendor_content_type_id
                data['alternate_vendor_object_id'] = vendor_id
                data['alternate_vendor_content_type'] = vendor_content_type_id
                
                # Convert sheet_sku into a list
                sheet_skus = data.pop('sheet_sku')
                data['sheet_sku'] = sheet_skus.split()
                
            with transaction.atomic():

                # instantiate serializer, validate data
                serializer = self.get_serializer(data=data)

                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response({
                        'status': 'Bad Request',
                        'message': "(reticle/views/skus.py) New sku was not created.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': "Error occured in reticle/views/skus.py: ",
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    ## def partial_update(self, request, *args, **kwargs):
    ##     """
    ##     When a PATCH is requested, partial_update is
    ##     called.
    ##     """
    ##
    ##     try:
    ##         pk = self.kwargs.pop('pk', None)
    ##         qs = self.get_queryset().get(pk=pk)
    ##
    ##         # remove qr_code from the data
    ##         data = copy.deepcopy(request.data)
    ##
    ##         # remove read only fields from serializer
    ##         # data as these should not be passed to
    ##         # serializer
    ##         qr_code = data.pop('qr_code', None)
    ##         sheet_sku = data.pop('sheet_sku', None)
    ##
    ##         serializer = self.get_serializer(
    ##             instance=qs, data=data, many=False, partial=True)
    ##
    ##         if serializer.is_valid():
    ##             serializer.save()
    ##
    ##             # add fields back into response data
    ##             if qr_code is not None:
    ##                 serializer.data['qr_code'] = qr_code
    ##             if sheet_sku is not None:
    ##                 serializer.data['sheet_sku'] = sheet_sku
    ##
    ##             return Response(serializer.data, status=status.HTTP_200_OK)
    ##
    ##         else:
    ##             return Response({
    ##                     'status': 'Bad Request',
    ##                     'message': "Unable to update batch.",
    ##                     'errors': serializer.errors
    ##                 }, status=status.HTTP_400_BAD_REQUEST)
    ##
    ##     except Exception as err:
    ##         return Response({
    ##                     'status': 'Bad Request',
    ##                     'message': 'Serializer error occured: reticle/views/batches.py: ',
    ##                     'errors': str(err) + '\n' + str(tb.format_exc())
    ##                 }, status=status.HTTP_400_BAD_REQUEST)

class FPSkuShippablePartsView(APIView):

    def get(self, request, *args, **kwargs):
        fp_sku = FinalProductSku.objects.get(id=kwargs['id'])
        dice_sku_id = fp_sku.dice_sku.id
        valid_batches = DiceBatch.objects.filter(sku_object_id=dice_sku_id, closed=True)
        valid_parts = []
        
        wip3_step_id = Step.objects.get(name='WIP3').id
        
        for batch in valid_batches:
            # Check for the following conditions:
            # - WIP3 is True (alt: on Step WIP3 (ID 32))
            # - Not failed (fail is Fail with ID 1)
            # - Not in a shipment (ship_batch_id is None)
            parts = batch.dice_part_set.filter(step_object_id=wip3_step_id, fail1_object_id=1, shipment_object_id=None)
            for part in parts:
                valid_parts.append(part)

        part_serializer = ShipPartSerializer(instance=valid_parts, many=True)

        return Response(part_serializer.data, status=status.HTTP_200_OK)