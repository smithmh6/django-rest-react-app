"""
API views for Plate objects in reticle.
"""

# import dependencies
import copy
from django.db import transaction
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
import traceback as tb
from ..models import Plate, Part
from ..serializers import (CoatPlateSerializer,
                           SheetPlateSerializer,
                           SheetPartSerializer)

class PlatesListView(ModelViewSet):

    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """

        batch_type = self.kwargs['batch_type']

        if batch_type == 'coat':
            return CoatPlateSerializer
        elif batch_type == 'sheet':
            return SheetPlateSerializer
        else:
            return None

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """
        

        batch_type = self.kwargs.get('batch_type', None)
        batch_id = self.kwargs.get('batch_id', None)

        if batch_type == 'coat':
            coat_batch_content_type = ContentType.objects.get(app_label="reticle", model="coatbatch")
            return Plate.objects.filter(batch_object_id=batch_id, batch_content_type=coat_batch_content_type.id)
        elif batch_type == 'sheet':
            sheet_batch_content_type = ContentType.objects.get(app_label="reticle", model="sheetbatch")
            return Plate.objects.filter(sheet_batch_object_id=batch_id, sheet_batch_content_type=sheet_batch_content_type.id)
        else:
            return Plate.objects.none()

    def patch(self, request, *args, **kwargs):
        """
        Handles PATCH request for partial updates.
        """
        try:

            queryset = self.get_queryset()
            batch_type = self.kwargs.get('batch_type', None)
            data = copy.deepcopy(request.data)

            if batch_type == 'coat':
                for plate in data:
                    if plate['step_object_id'] == 5: # SOFT_BAKE step
                        plate['coated'] = timezone.now()
            elif batch_type == 'sheet':
                for plate in data:
                    if plate['step_object_id'] == 15: # WET_DECK_1 step
                        plate['etched'] = timezone.now()
                    
                    # When updating plate step, also update part steps
                    part_queryset = Part.objects.filter(plate_id=plate['id'], fail1_object_id=1)
                    updated_parts = []
                    for part in part_queryset:
                        updated_parts.append({'id': part.id, 'step_object_id': plate['step_object_id']})
                    part_serializer = SheetPartSerializer(instance=part_queryset, data=updated_parts, many=True, partial=True)
                    if part_serializer.is_valid():
                        part_serializer.save()
                    else:
                        return Response({
                        'status': 'Bad Request',
                        'message': "Unable to update part records.",
                        'errors': part_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(
                instance=queryset, data=data, many=True, partial=True)

            if serializer.is_valid():

                with transaction.atomic():

                    # save the plate records
                    serializer.save()

                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "Unable to update plate records.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': 'Exception occured in reticle/views/plates.py: ',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)

