"""
API Views for batch objects in reticle.
"""

# import dependencies
import copy
from django.contrib.contenttypes.models import ContentType
from django.db.models import Max
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
import traceback as tb
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import status
from ..models import (CoatBatch, SheetBatch, DiceBatch, DiceSku, Plate)
from ..serializers import (CoatBatchSerializer,
                           SheetBatchSerializer,
                           DiceBatchSerializer,
                           CoatPlateSerializer)

class BatchListView(ModelViewSet):
    """
    RESTful View that dynamically chooses a the
    appropriate "Batch" model and serializer class.
    """
    
    serializer_class_dict = {
        'coat': CoatBatchSerializer,
        'sheet': SheetBatchSerializer,
        'dice': DiceBatchSerializer
    }
    
    batch_model_dict = {
        'coat': CoatBatch,
        'sheet': SheetBatch,
        'dice': DiceBatch
    }
    
    sku_model_dict = {
        'coat': 'CoatSku',
        'sheet': 'SheetSku',
        'dice': 'DiceSku'
    }
    
    starting_step_dict = {
        'coat': 1, # Serialize; should always be 1
        'sheet': 8, # INIT_PHOTO. May not always be 8, ideally pull by step name.
        'dice': 20  # INIT_Dice. Same as above; should instead reference step name
    }
    
    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """
        batch_type = self.kwargs.get('batch_type', None)
        return self.serializer_class_dict.get(batch_type, None)

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """
        batch_type = self.kwargs.get('batch_type', None)
        BatchModel = self.batch_model_dict.get(batch_type, None)
        if BatchModel is None:
            return CoatBatch.objects.none()
        else:
            return BatchModel.objects.filter(closed=False).order_by('-created')

    def create(self, request, *args, **kwargs):

        try:
            batch_type = self.kwargs.get('batch_type', None)
            sku_model_name = self.sku_model_dict[batch_type]
            starting_step_id = self.starting_step_dict[batch_type]

            # deep copy request data for mutation
            data = copy.deepcopy(request.data)
            
            # Common reticle batch field initialization
            data['user'] = request.user
            data['step_content_type'] = ContentType.objects.get(app_label="reticle", model="Step").id
            data['sku_content_type'] = ContentType.objects.get(app_label="reticle", model=sku_model_name).id
            data['step_object_id'] = starting_step_id
                
            if batch_type == 'dice':
                # Dice batch needs plate_qty manually set
                # according to number of parts assigned to it
                if 'sku_object_id' in data:
                    sku_part_qty = DiceSku.objects.get(id=data['sku_object_id']).part_qty
                    data['plate_qty'] = int(data['qty']) / sku_part_qty

            with transaction.atomic():

                # instantiate serialzier, validate data
                serializer = self.get_serializer(data=data)
                saved_batch = None

                if serializer.is_valid():
                    saved_batch = serializer.save()
                else:
                    return Response({
                        'message': "(reticle/views/batches.py) New batch was not created.\n" + str(serializer.errors),
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                # For coat, create coat batch plates
                ## if sku's don't have -RW, we should add a 'Rework' field
                ## to the COAT_Sku table and get the COAT_Sku object here
                sku_name = saved_batch.sku.name
                if batch_type == 'coat' and '-RW' not in sku_name:

                    # gather information to create new plate records
                    rm_sku = saved_batch.sku.rm_sku
                    
                    last_serial = 0
                    if Plate.objects.exists():
                        last_serial = int(Plate.objects.aggregate(Max('serial'))['serial__max'])
                    plate_qty = int(data.get('qty'))
                    
                    coat_batch_content_type_id = ContentType.objects.get(app_label="reticle", model="coatbatch").id
                    step_content_type_id = ContentType.objects.get(app_label="reticle", model="step").id
                    fail_content_type_id = ContentType.objects.get(app_label="reticle", model="fail").id

                    # create new Plate records
                    new_plates = [
                        {'serial': i+1, 
                         'batch_object_id': saved_batch.id,
                         'step_object_id': 1, # SER step 
                         'batch_content_type': coat_batch_content_type_id,
                         'step_content_type': step_content_type_id,
                         'fail1_content_type': fail_content_type_id,
                         'fail2_content_type': fail_content_type_id,
                         'fail3_content_type': fail_content_type_id,
                         'fail1_object_id': 1,
                         'fail2_object_id': 1,
                         'fail3_object_id': 1,
                         'rm_sku':rm_sku}
                        for i in range(last_serial, last_serial + plate_qty)]

                    # serialize the new plate records
                    plate_serializer = CoatPlateSerializer(data=new_plates, many=True)

                    # save the plate records
                    if plate_serializer.is_valid():
                        plate_serializer.save()
                    else:
                        return Response({
                        'status': 'Bad Request',
                        'message': "(reticle/views/batches.py) Unable to create new Plate records.",
                        'errors': plate_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as err:
            return Response({
                        'message': "(reticle/views/batches.py) Exception occured.\n" + str(err) + '\n' + str(tb.format_exc()),
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        request.data.pop('qrcode')
        return super().partial_update(request, *args, **kwargs)

class HighestBatchNumberView(ModelViewSet):
    """
    RESTful view that returns the current highest batch number
    for a specific batch type
    """
    
    serializer_class_dict = {
        'coat': CoatBatchSerializer,
        'sheet': SheetBatchSerializer,
        'dice': DiceBatchSerializer
    }

    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """
        batch_type = self.kwargs.get('batch_type', None)
        return self.serializer_class_dict.get(batch_type, None)

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """

        batch_type = self.kwargs.get('batch_type', None)

        queryset = CoatBatch.objects.none()

        if batch_type == 'coat':
            queryset = CoatBatch.objects.filter(name__startswith="CB").order_by('-name')
        elif batch_type == 'sheet':
            queryset = SheetBatch.objects.filter(name__startswith="SB").order_by('-name')
        elif batch_type == 'dice':
            queryset = DiceBatch.objects.filter(name__startswith="DB").order_by('-name')

        # If a batch exists, return first (as 1-item array)
        # Otherwise, return an empty queryset
        if queryset.count() > 1:
            return queryset[:1]
        return queryset