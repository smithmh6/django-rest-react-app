import copy
import traceback
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from .models import GeneralNote, MaintenanceRequest
from .serializers import GeneralNoteSerializer, MaintenanceRequestSerializer

class GeneralNoteListView(ModelViewSet):

    serializer_class = GeneralNoteSerializer
    queryset = GeneralNote.objects.all()

    def put(self, request):
        try:
            data = copy.deepcopy(request.data)
            obj = self.get_queryset().get()

            serializer = self.get_serializer(
                instance=obj, data=data, many=False, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "Unable to update note.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Internal Server Error',
                        'message': 'Serializer error occured: reporting/views.py: ',
                        'errors': str(err) + '\n' + str(traceback.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MaintenanceRequestViewSet(ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer