"""
API views for Part objects in reticle.
"""


# import dependencies
from django.contrib.contenttypes.models import ContentType
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
import traceback as tb
from ..models import Part
from ..serializers import (SheetPartSerializer,
                           DicePartSerializer,
                           ShipPartSerializer)

class PartsListView(ModelViewSet):

    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """

        batch_type = self.kwargs['batch_type']

        if batch_type == 'sheet':
            return SheetPartSerializer
        elif batch_type == 'dice':
            return DicePartSerializer
        elif batch_type == 'ship':
            return ShipPartSerializer
        else:
            return None

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """
        return Part.objects.filter(plate=self.kwargs['plate_id'])

    def patch(self, request, *args, **kwargs):
        """
        Handles PATCH request for partial updates.
        """

        try:
            serializer = self.get_serializer(
                instance=self.get_queryset(), data=request.data, many=True, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "Serializer error in reticle/views/parts.py: ",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': 'Exception occured in reticle/views/parts.py: ',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)


class PartsBatchView(ModelViewSet):

    def get_serializer_class(self):
        """
        Dynamically choose the serializer class.
        """

        batch_type = self.kwargs['batch_type']

        if batch_type == 'dice':
            return DicePartSerializer
        elif batch_type == 'ship':
            return ShipPartSerializer
        else:
            return None

    def get_queryset(self):
        """
        Dynamically choose the queryset.
        """

        batch_type = self.kwargs['batch_type']
        batch_id = self.kwargs['batch_id']

        if batch_type == 'dice':
            dice_batch_content_type = ContentType.objects.get(app_label="reticle", model="dicebatch")
            return Part.objects.filter(batch_object_id=batch_id, batch_content_type=dice_batch_content_type.id)

        return Part.objects.none()

    def patch(self, request, *args, **kwargs):
        """
        Handles PATCH request for partial updates.
        """

        try:

            serializer = self.get_serializer(
                instance=self.get_queryset(), data=request.data, many=True, partial=True)

            if serializer.is_valid():
                serializer.save()


                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "Unable to update batch.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': 'Exception occured: ' + str(err),
                        'errors': ''
                    }, status=status.HTTP_400_BAD_REQUEST)



