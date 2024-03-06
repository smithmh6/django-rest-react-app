"""
'views.py' renders the views for the texturedar.
"""

# import dependencies
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
import io
import numpy as np
import traceback as tb
import copy
from common.utils.log import logging_decorator
from scipy.signal import savgol_filter
from .models import *
from .serializers import *

class BatchListView(ModelViewSet):
    """
    API batch view for textured AR.
    """

    serializer_class = BatchSerializer
    queryset = TarBatch.objects.all()

    @logging_decorator
    def create(self, request):

        try:
            data = copy.deepcopy(request.data)

            # Set user and initial step, and SKU content type
            data['user'] = request.user
            data['sku_content_type'] = ContentType.objects.get(app_label="texturedar", model="opticalcoatsku").id
            data['step_content_type'] = ContentType.objects.get(app_label="texturedar", model="step").id
            data['step_object_id'] = 1 # Serialize; should always be 1

            with transaction.atomic():

                # Validate data and save new batch
                batch_serializer = self.get_serializer(data=data)

                if batch_serializer.is_valid():
                    batch_serializer.save()
                else:
                    return Response({
                        'message': "(BatchListView.create) Unable to create new batch.\n" + str(batch_serializer.errors),
                        'errors': batch_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                new_batch = TarBatch.objects.get(name=data['name'])

                # Create TAR parts
                last_serial = 0 # Start at 1 (from 0) if no plates

                if Part.objects.exists():
                    last_serial = int(Part.objects.last().serial)

                num_parts = int(data.get('qty', None))
                new_parts = [{'index': i + 1,
                              'pocket': i + 1,
                              'serial': last_serial + i + 1,
                              'batch_object_id': new_batch.id,
                              'batch_content_type': ContentType.objects.get(app_label="texturedar", model="tarbatch").id,
                              'step_content_type': new_batch.step_content_type_id,
                              'step_object_id': new_batch.step_object_id,
                              'fail1_content_type': ContentType.objects.get(app_label="texturedar", model="fail").id,
                              # Fail 1 object ID starts as null indicating no failcode
                } for i in range(num_parts)]

                part_serializer = PartSerializer(data=new_parts, many=True)

                if part_serializer.is_valid():
                    part_serializer.save()
                else:
                    return Response({
                        'message': "(BatchListView.create) Unable to create new part records.",
                        'errors': part_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response(batch_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as err:
            return Response({
                        'message': "(TAR BatchListView.create) Exception occured.\n" + str(err) + '\n' + str(tb.format_exc()),
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @logging_decorator
    def partial_update(self, request, *args, **kwargs):

        try:

            # If no part data is specified, update the batch
            if (not 'parts' in request.data):
                return super().partial_update(request, *args, **kwargs)


            # Otherwise, we also want to update parts.
            with transaction.atomic():

                # First update the part step; we're assuming
                # it's always sent in the data.
                # TODO: Check for step before attempting to change
                parts_data = request.data.pop('parts')
                if 'step_object_id' in request.data:
                    for part in parts_data:
                        if part['fail1_object_id'] is None:
                            part['step_object_id'] = request.data['step_object_id']

                # Create serializers with update data
                part_instances = self.get_object().parts.all()
                part_serializer = PartSerializer(instance=part_instances, data=parts_data, many=True, partial=True, context={"request": request})
                batch_serializer = BatchSerializer(instance=self.get_object(), data=request.data, partial=True)

                # Save serializers
                if (part_serializer.is_valid() and batch_serializer.is_valid()):
                    part_serializer.save()
                    batch_serializer.save()
                else:
                    return Response({
                            'status': 'Bad Request',
                            'message': "Unable to update batch and parts.",
                            'errors': batch_serializer.errors
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Append parts onto data
                data = batch_serializer.data
                data['parts'] = part_serializer.data

                return Response(data, status=status.HTTP_200_OK)

        except Exception as err:
            return Response({
                        'status': 'Internal Server Error',
                        'message': '(BatchListView.partial_update) Serializer error occured: ',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # def partial_update(self, request, *args, **kwargs):
    #     """
    #     When a PATCH is requested, partial_update is
    #     called.
    #     """
    #     pk = self.kwargs.pop('pk', None)
    #     tar_instance = TarBatch.objects.get(id=pk)
    #     serializer = BatchSerializer(instance=tar_instance)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

class OpenBatchListView(ModelViewSet):
    """
    API Batch view for only open TAR Batches
    """

    serializer_class = BatchSerializer
    queryset = TarBatch.objects.filter(closed=False)

class HighestBatchView(APIView):
    """
    View returning the single batch with the highest batch number/name.
    """
    @logging_decorator
    def get(self, request, format=None):
        highest_batch = TarBatch.objects.filter(name__startswith="TAR").order_by('-name').first()
        serializer = BatchSerializer(instance=highest_batch)
        return Response(serializer.data)

class PartListView(ModelViewSet):
    """"""

    serializer_class = PartSerializer

    def get_queryset(self):
        """
        Return queryset of parts for selected batch.
        """
        return Part.objects.filter(batch_object_id=self.kwargs['id'])

class PartPerformanceAPIView(APIView):
    """"""

    serializer_class = PartSerializer

    @logging_decorator
    def get(self, request, ar_batch_id=None, format=None):
        """
        GET method.
        """
        queryset = Part.objects.filter(ar_batch_id=ar_batch_id)

        data = []

        for result in queryset:
            col1 = []
            col2 = []
            col3 = []
            col4 = []
            f_uvvis = default_storage.open(result.uv_vis_data_post.name).read().decode('utf-8')
            f_ir = default_storage.open(result.ir_data_post.name).read().decode('utf-8')

            f_stream_uvvis = io.StringIO(f_uvvis)
            f_stream_ir = io.StringIO(f_ir)

            rows_uvvis = f_stream_uvvis.readlines()
            rows_uvvis = [r.strip('\n') for r in rows_uvvis]
            rows_uvvis = [r.split('\t') for r in rows_uvvis]

            rows_ir = f_stream_ir.readlines()
            rows_ir = [r.strip('\n') for r in rows_ir]
            rows_ir = [r.split('\t') for r in rows_ir]

            for row in rows_uvvis:
                try:
                    if 400.0 <= float(row[0]) < 1000.0:
                        col1.append(float(row[0]))
                        col2.append(float(row[1]))
                        col3.append(float(row[2]))
                        col4.append(float(row[3]))
                except:
                    pass

            for row in rows_ir:
                try:
                    if float(row[0]) >= 1000.0:
                        col1.append(float(row[0]))
                        col2.append(float(row[1]))
                        col3.append(float(row[2]))
                        col4.append(float(row[3]))
                except:
                    pass

            col1 = np.asarray(col1)
            col2 = np.asarray(col2)
            col3 = np.asarray(col3)
            col4 = np.asarray(col4)
            ydata = (col4 - col2) / (col3 - col2)
            ydata = savgol_filter(ydata, 100, 3)

            data.append({'id': result.id, 'serial': result.serial, 'xdata': col1, 'ydata': ydata})

        return Response(data, status=status.HTTP_200_OK)

class RieSystemView(APIView):
    """
    View returning a list of RIE Systems.
    """

    @logging_decorator
    def get(self, request, format=None):
        systems = RieSystem.objects.all()
        serializer = RieSystemSerializer(instance=systems, many=True)
        return Response(serializer.data)

class EtchRecipeView(APIView):
    """
    View returning a list of Etch Recipes.
    """

    @logging_decorator
    def get(self, request, format=None):
        recipes = EtchRecipe.objects.all()
        serializer = EtchRecipeSerializer(instance=recipes, many=True)
        return Response(serializer.data)

class RieToolingView(APIView):
    """
    View returning a list of RIE Toolings
    """

    @logging_decorator
    def get(self, request, format=None):
        toolings = RieTooling.objects.all()
        serializer = RieToolingSerializer(instance=toolings, many=True)
        return Response(serializer.data)

class ArFailcodeListView(ModelViewSet):
    """
    API batch view for textured AR.
    """

    serializer_class = FailSerializer
    queryset = Fail.objects.all()

class ArStepListView(ModelViewSet):
    """
    API batch view for textured AR.
    """

    serializer_class = StepSerializer
    queryset = Step.objects.all()

class VendorSkuListView(ModelViewSet):
    """
    API view for TAR Vendor SKUs.
    """

    serializer_class = VendorSkuSerializer
    queryset = VendorSku.objects.all()

class RawMaterialSkuListView(ModelViewSet):
    """
    API view for TAR RM SKUs.
    """

    serializer_class = RawMaterialSkuSerializer
    queryset = RawMaterialSku.objects.all()

class OpticalCoatSkuListView(ModelViewSet):
    """
    API view for TAR OC SKUs.
    """

    serializer_class = OpticalCoatSkuSerializer
    queryset = OpticalCoatSku.objects.all()

class ProductCategoryListView(ModelViewSet):
    """
    API View for TAR Product Categories.
    """

    serializer_class = ProductCategorySerializer
    queryset = ProductCategory.objects.all()

class FinalProductSkuListView(ModelViewSet):
    """
    API view for TAR FP SKUs.
    """

    serializer_class = FinalProductSkuSerailizer
    queryset = FinalProductSku.objects.all()

class OCSkuShippablePartsView(APIView):

    @logging_decorator
    def get(self, request, *args, **kwargs):
        batches = TarBatch.objects.filter(sku_content_type=ContentType.objects.get(app_label="texturedar", model="opticalcoatsku").id, sku_object_id=kwargs['id'], closed=False)

        valid_parts = []
        for batch in batches:
            parts = batch.parts.all()
            for part in parts:
                # Check for the following conditions:
                # - Not failed (fail1 ID is null)
                # - On Transfer step (step ID is 7)
                # - Not in a shipment (shipment ID is null)
                if part.fail1_object_id is None and part.step_object_id == 6 and part.shipment_object_id is None:
                    valid_parts.append(part)

        part_serializer = PartSerializer(instance=valid_parts, many=True)

        return Response(part_serializer.data, status=status.HTTP_200_OK)

class FPSkuShippablePartsView(APIView):

    @logging_decorator
    def get(self, request, *args, **kwargs):
        """GET Method"""

        # Filter batches by OC SKU for corresponding FP SKU
        fp_sku = FinalProductSku.objects.get(id=kwargs['id'])
        oc_sku = fp_sku.oc_sku
        batches = TarBatch.objects.filter(sku_content_type=ContentType.objects.get(app_label="texturedar", model="finalproductsku").id,
                                          sku_object_id=oc_sku.id,
                                          closed=True)

        valid_parts = []
        for batch in batches:
            parts = batch.parts.all()
            for part in parts:
                # Check for the following conditions:
                # - Not failed (fail1 ID is null)
                # - On Final QC step (step ID is 7)
                # - Not in a shipment (shipment ID is null)
                if part.fail1_object_id is None and part.step_object_id == 7 and part.shipment_object_id is None:
                    valid_parts.append(part)

        part_serializer = PartSerializer(instance=valid_parts, many=True)

        return Response(part_serializer.data, status=status.HTTP_200_OK)
