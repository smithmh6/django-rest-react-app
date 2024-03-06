"""
Initialization views for reticle. These are a special
case where plates/parts need to be selected at the beginning
of a production route.
"""

# import dependencies
import copy
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
import traceback as tb
from ..serializers import (CoatPlateSerializer,
                           SheetPlateSerializer,
                           DicePartSerializer,
                           DicePlateSerializer,
                           ShipPartSerializer,
                           SheetPartSerializer)
from ..models import (Plate, Step)
from ..models import (CoatBatch, SheetBatch, DiceBatch, Part)

class ReworkPlateListView(ModelViewSet):
    """
    ModelViewSet which filters Plate objects
    for initializing a Rework COAT Batch.
    """
    serializer_class = CoatPlateSerializer

    def get_queryset(self):
        """
        Returns a queryset of available rework plates.
        """

        # get the coat batch, coat sku, and rm_sku
        batch_id = self.kwargs.get('batch_id', None)
        coat_sku = CoatBatch.objects.get(id=batch_id).sku
        rm_sku = coat_sku.rm_sku

        # filter recycled plates on RM_SKU
        return Plate.objects.filter(recycled_in__isnull=False, recycled_out__isnull=True, rm_sku=rm_sku).order_by('serial')

    def patch(self, request, *args, **kwargs):
        """
        Handle PATCH method.
        """
        try:
            # copy the request data
            data = copy.deepcopy(request.data)

            # extract plates removed from queue
            recycled_plates = [row for row in data if row['in_queue'] == False]
            for row in recycled_plates:
                row.pop('in_queue') # remove property, cannot update
                row['recycled_out'] = timezone.now()

            # serialize the recycled plates
            recycled_serializer = self.get_serializer(
                instance=self.get_queryset(), data=recycled_plates, many=True, partial=True)

            # gather information to create new plate records
            batch_id = self.kwargs.get('batch_id')
            coat_batch = get_object_or_404(CoatBatch, id=batch_id)
            coat_sku = coat_batch.sku
            rm_sku = coat_sku.rm_sku
            
            batch_content_type = ContentType.objects.get(app_label="reticle", model="CoatBatch").id
            step_content_type = ContentType.objects.get(app_label="reticle", model="Step").id
            fail_content_type = ContentType.objects.get(app_label="reticle", model="Fail").id

            # create new Plate records
            # automatically set step SRD1 on rework plate selection
            new_plates = [
                {'serial':row['serial'], 
                 'batch_object_id': coat_batch.id, 
                 'step_object_id': 2, # SRD1 step
                 'fail1_object_id': 1,
                 'fail2_object_id': 1,
                 'fail3_object_id': 1,
                 'batch_content_type':batch_content_type,
                 'step_content_type': step_content_type,
                 'fail1_content_type': fail_content_type,
                 'fail2_content_type': fail_content_type,
                 'fail3_content_type': fail_content_type,
                 'rm_sku': rm_sku}
                for row in recycled_plates]

            # serialize the new plate records
            new_plate_serializer = CoatPlateSerializer(data=new_plates, many=True)

            # save the plate records
            if new_plate_serializer.is_valid() and recycled_serializer.is_valid():
                with transaction.atomic():
                    recycled_serializer.save()
                    new_plate_serializer.save()

                # return the recycled plates
                return Response(new_plate_serializer.data, status=status.HTTP_200_OK)

            return Response({
                        'status': 'Bad Request',
                        'message': "Unable process request.",
                        'errors': new_plate_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': str(err),
                        'errors': ''
                    }, status=status.HTTP_400_BAD_REQUEST)


class InitPhotoPlateListView(ModelViewSet):
    """
    ModelViewSet which filters coated plates
    used to initialize a SHEET batch.
    """
    serializer_class = SheetPlateSerializer

    def get_queryset(self):
        """
        Returns a queryset of coated Plate objects.
        """

        # get the sheet batch
        batch_id = self.kwargs.get('batch_id', None)
        sheet_sku = SheetBatch.objects.get(id=batch_id).sku
        coat_sku = sheet_sku.coat_sku
        rm_sku = coat_sku.rm_sku

        return Plate.objects.filter(wip1_in__isnull=False, wip1_out__isnull=True, rm_sku=rm_sku)

    def patch(self, request, *args, **kwargs):
        """
        Handle PATCH request for sheet plates.
        """
        try:
            # copy the request data
            data = copy.deepcopy(request.data)

            # get sheet batch id
            batch_id = self.kwargs.get('batch_id', None)
            sheet_batch = SheetBatch.objects.get(id=batch_id)
            sheet_sku = sheet_batch.sku
            num_parts = sheet_sku.part_qty
            
            sheet_batch_content_type = ContentType.objects.get(app_label="reticle", model="SheetBatch").id
            step_content_type = ContentType.objects.get(app_label="reticle", model="Step").id
            fail_content_type = ContentType.objects.get(app_label="reticle", model="Fail").id

            # store new part records
            new_parts = []

            # extract plates removed from wip1
            photo_plates = [row for row in data if row['wip1'] == False]
            sheet_idx = 0
            for row in photo_plates:
                sheet_idx += 1
                row['wip1_out'] = timezone.now()
                row['sheet_batch_object_id'] = sheet_batch.id
                row['sheet_batch_content_type'] = sheet_batch_content_type 
                row['index'] = sheet_idx
                row['part_qty'] = num_parts

                # generate new part records
                for i in range(int(num_parts)):
                    part_index = i + 1
                    part_serial = '0' + str(part_index) if part_index < 10 else part_index
                    new_parts.append(
                        {
                            'index': part_index,
                            'plate': row['id'],
                            'step_object_id': row['step_object_id'],
                            'step_content_type': step_content_type,
                            'fail1_object_id': 1,
                            'fail2_object_id': 1,
                            'fail3_object_id': 1,
                            'fail1_content_type': fail_content_type,
                            'fail2_content_type': fail_content_type,
                            'fail3_content_type': fail_content_type,
                            'serial': f"{row['serial']}-{part_serial}"
                        }
                    )

            # serialize the photo plates
            photo_serializer = self.get_serializer(
                instance=self.get_queryset(), data=photo_plates, many=True, partial=True)

            # serializer part records
            new_parts_serializer = SheetPartSerializer(data=new_parts, many=True)

            # save the plate records
            if photo_serializer.is_valid() and new_parts_serializer.is_valid():

                with transaction.atomic():
                    photo_serializer.save()
                    new_parts_serializer.save()

                # return the recycled plates
                return Response(photo_serializer.data, status=status.HTTP_200_OK)

            return Response({
                        'status': 'Bad Request',
                        'message': "Unable process request.",
                        'errors': {
                            'plates':photo_serializer.errors,
                            'parts':new_parts_serializer.errors
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': str(err),
                        'errors': ''
                    }, status=status.HTTP_400_BAD_REQUEST)


class InitDicePartListView(ModelViewSet):
    """
    Handle initializing a dice batch using available_parts
    from sheet plates in wip2.
    """

    serializer_class = DicePlateSerializer

    def get_queryset(self):
        """
        Custom queryset based on batch ID and batch SKU
        """

        # get the batch ID and sheet sku
        batch_id = self.kwargs.get('batch_id')
        dice_batch = DiceBatch.objects.get(id=batch_id)
        dice_sku = dice_batch.sku
        sheet_sku = dice_sku.sheet_sku

        min_idx = dice_sku.min_part_index
        max_idx =  dice_sku.max_part_index

        # filter batches by sheet sku
        # prefetch plate object and filter
        # on wip2, then get only distinct values
        batches = SheetBatch.objects.filter(
            sku_object_id=sheet_sku.id,
            closed=True
        ).prefetch_related(
            'sheet_plate_set'
        ).filter(
            sheet_plate_set__wip2_in__isnull=False,
            sheet_plate_set__wip2_out__isnull=True,
        ).distinct()

        valid_plate_ids = []

        # search batches for plates in WIP2 with valid parts (available & correct index)
        for batch in batches:

            # iterate related plate objects
            for plate in batch.sheet_plate_set.prefetch_related('part_set'):
                if plate.wip2 == True:
                    valid_parts = plate.part_set.filter(fail1_object_id=1, index__gte=min_idx, index__lte=max_idx, batch_object_id__isnull=True)
                    if valid_parts.count() > 0:
                        valid_plate_ids.append(plate.id)

        return Plate.objects.filter(id__in=valid_plate_ids)

    def patch(self, request, *args, **kwargs):
        """
        Handle PATCH request for dice initialization.
        """

        # get the batch ID and indices
        batch_id = self.kwargs.get('batch_id')
        dice_batch = DiceBatch.objects.get(id=batch_id)
        dice_sku = dice_batch.sku
        min_index = dice_sku.min_part_index
        max_index =  dice_sku.max_part_index


        # copy the request data
        data = copy.deepcopy(request.data)

        try:

            updated_parts = []

            with transaction.atomic():

                dice_batch_content_type = ContentType.objects.get(app_label="reticle", model="dicebatch")
                
                for plate in data:

                    plate_instance = Plate.objects.get(id=plate['id'])
                    parts = plate_instance.part_set.filter(fail1_object_id=1, index__gte=min_index, index__lte=max_index, batch_object_id__isnull=True)

                    # update each part with next step and batch_id
                    for part in parts:
                        part.batch_object_id = dice_batch.id
                        part.batch_content_type = dice_batch_content_type
                        part.step_object_id = Step.objects.get(name='DICE_COAT').id
                        part.save()
                        updated_parts.append(part)

                    # update step code for plate if available parts is now 0
                    if plate_instance.available_parts == 0:
                        plate_instance.step_object_id = Step.objects.get(name='INIT_DICE').id
                        plate_instance.wip2_out = timezone.now()
                        plate_instance.save()
                        
                    # update dice batch qty with actual number of selected parts
                    dice_batch.qty = parts.count()
                    dice_batch.save()

                part_serializer = DicePartSerializer(instance=updated_parts, many=True)

                # return the plates (should return parts)
                return Response(part_serializer.data, status=status.HTTP_200_OK)

        except Exception as err:
            return Response({
                'status': 'Internal Server Error',
                'message': str(err),
                'errors': ''
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)