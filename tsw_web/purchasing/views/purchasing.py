#!user/bin/python
# -*- coding: utf-8 -*-
"""
'views.py' contains view controllers for
the 'purchasing' pages.
"""

# import dependencies
import copy
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from django.db import transaction
import traceback as tb
from ..models import PurchaseRequest, PurchaseItem, Vendor
from ..serializers import (PurchaseRequestSerializer,
                           PurchaseItemSerializer,
                           VendorSerializer)
from ..permissions import (HasApprovalPermission,
                           HasAuthorizationPermission,
                           HasTransactionPermission)

class VendorListView(ModelViewSet):
    """
    """
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all().order_by('name')

class PurchaseRequestDetailView(ModelViewSet):
    """
    Gets a single PurchaseRequest object by id.
    """
    serializer_class = PurchaseRequestSerializer

    def get_queryset(self):
        request_id = self.kwargs.get('request_id', None)

        return PurchaseRequest.objects.filter(pk=request_id)

    def patch(self, request, *args, **kwargs):
        """
        Partial update of a single record.
        """
        data = copy.deepcopy(request.data)

        qs = self.get_queryset()

        serializer = self.get_serializer(
            instance=qs, data=data, many=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({
                    'status': 'Bad Request',
                    'message': "(purchasing/views.py) Unable to update purchase requests.",
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

class PurchaseRequestListView(ModelViewSet):
    """
    List API view for PurchaseRequest object.
    """
    serializer_class = PurchaseRequestSerializer

    def get_queryset(self):
        """
        Overrides get_queryset() with PurchaseRequest items for
        currently logged in user.
        """
        return PurchaseRequest.objects.filter(
            user=self.request.user).order_by('-created')[:25]

    def create(self, request, *args, **kwargs):
        """
        POST new PurchaseRequest data to the backend.
        """

        # deep copy request data
        data = copy.deepcopy(request.data)

        # add currently logged in user to data
        data['user'] = request.user

        _new_obj = PurchaseRequest.objects.create(**data)

        serializer = self.get_serializer(
                instance=self.get_queryset(), many=True)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        """
        Handles partial updates to multiple PurchaseRequest objects.
        """

        # deep copy request data for mutation
        data = copy.deepcopy(request.data)

        qs = self.get_queryset()

        serializer = self.get_serializer(
            instance=qs, data=data, many=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({
                    'status': 'Bad Request',
                    'message': "(purchasing/views.py) Unable to update purchase requests.",
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

class PurchaseItemListView(ModelViewSet):
    """
    PurchaseView handles the view for managing purchases.
    """

    serializer_class = PurchaseItemSerializer

    def get_queryset(self):
        """
        custom queryset based on logged in user.
        """

        request_id = self.kwargs.get('request_id', None)

        return PurchaseItem.objects.filter(purchase__id=request_id).order_by('id')

    def create(self, request, *args, **kwargs):
        """
        Creates a PurchaseItem and add PK to PurchaseRequest on creation.
        """
        try:

            # deep copy request data for mutation
            _item_data = copy.deepcopy(request.data)

            # add PurchaseRequest id to data
            if self.kwargs.get('request_id') is None:
                return Response({
                    'message': 'No request ID found.',
                    'errors': 'Request ID is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            _item_data['purchase'] = get_object_or_404(PurchaseRequest, pk=self.kwargs.get('request_id')).pk

            with transaction.atomic():

                _item_serializer = self.get_serializer(data=_item_data)

                if _item_serializer.is_valid():

                    _item_serializer.save()

                    serializer = self.get_serializer(instance=self.get_queryset(), many=True)

                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                else:
                    return Response({
                        'message': 'Failed to serialize items.',
                        'errors': _item_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'message': 'Exception occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, *args, **kwargs):
        """
        Handles partial updates of PurchaseItem objects.
        """

        # deep copy request data for mutation
        data = copy.deepcopy(request.data)

        qs = self.get_queryset()

        serializer = self.get_serializer(
            instance=qs, data=data, many=True, partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({
                    'status': 'Bad Request',
                    'message': "(purchasing/views.py) Unable to update purchase items.",
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

class AuthorizedItemsListView(ModelViewSet):
    """
    Retrieves the queryset of authorized items for a PurchaseRequest.
    """

    serializer_class = PurchaseItemSerializer

    def get_queryset(self):
        """
        custom queryset based on logged in user.
        """

        request_id = self.kwargs.get('request_id', None)

        return PurchaseItem.objects.filter(
            purchase__id=request_id,
            authorized='APPR').order_by('id')

    def create(self, request, *args, **kwargs):
        """
        Creates a PurchaseItem and add PK to PurchaseRequest on creation.
        """
        try:

            # deep copy request data for mutation
            _item_data = copy.deepcopy(request.data)

            # add PurchaseRequest id to data
            if self.kwargs.get('request_id') is None:
                return Response({
                    'message': 'No request ID found.',
                    'errors': 'Request ID is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            _item_data['purchase'] = get_object_or_404(PurchaseRequest, pk=self.kwargs.get('request_id')).pk

            with transaction.atomic():

                _item_serializer = self.get_serializer(data=_item_data)

                if _item_serializer.is_valid():

                    _item_serializer.save()

                    serializer = self.get_serializer(instance=self.get_queryset(), many=True)

                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                else:
                    return Response({
                        'message': 'Failed to serialize items.',
                        'errors': _item_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'message': 'Exception occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, *args, **kwargs):
        """
        Handles partial updates of PurchaseItem objects.
        """

        # deep copy request data for mutation
        data = copy.deepcopy(request.data)

        qs = self.get_queryset()

        serializer = self.get_serializer(
            instance=qs, data=data, many=True, partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({
                    'status': 'Bad Request',
                    'message': "(purchasing/views.py) Unable to update purchase items.",
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

class AuthorizationListView(ModelViewSet):
    """
    ModelViewSet retreives PurchaseRequest object available
    for authorization.
    """
    serializer_class = PurchaseRequestSerializer
    queryset = PurchaseRequest.objects.filter(status='AUTH')
    allowed_users = settings.AUTHORIZATION_ALLOWED_USERS
    permission_classes = [HasAuthorizationPermission]

    def patch(self, request, *args, **kwargs):
        """
        When a PATCH is requested, partial_update is
        called.
        """

        try:
            with transaction.atomic():
                qs = self.get_queryset()

                data = copy.deepcopy(request.data)

                serializer = self.get_serializer(
                    instance=qs, data=data, many=True, partial=True)

                if serializer.is_valid():

                    serializer.save()

                    return Response(data, status=status.HTTP_200_OK)

                else:
                    return Response({
                            'status': 'Bad Request',
                            'message': "(purchasing/views.py) Unable to authorize purchase request.",
                            'errors': serializer.errors
                        }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': '(purchasing/views.py) Serializer error occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)

class AuthorizationDetailView(ModelViewSet):
    """
    Gets a single PurchaseRequest object by id.
    """
    serializer_class = PurchaseRequestSerializer
    allowed_users = settings.AUTHORIZATION_ALLOWED_USERS
    permission_classes = [HasAuthorizationPermission]

    def get_queryset(self):
        request_id = self.kwargs.get('request_id', None)

        return PurchaseRequest.objects.filter(pk=request_id)

    def patch(self, request, *args, **kwargs):
        """
        Partial update of a single record.
        """
        data = copy.deepcopy(request.data)

        qs = self.get_queryset()

        serializer = self.get_serializer(
            instance=qs, data=data, many=True)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({
                    'status': 'Bad Request',
                    'message': "(purchasing/views.py) Unable to update purchase requests.",
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

class ApprovalListView(ModelViewSet):
    """
    ModelViewSet retrieve PurchaseRequest object available
    for Approval by business manager.
    """
    serializer_class = PurchaseRequestSerializer
    queryset = PurchaseRequest.objects.filter(status='APPR')
    allowed_users = settings.APPROVAL_ALLOWED_USERS
    permission_classes = [HasApprovalPermission]

    def patch(self, request, *args, **kwargs):
        """
        Performs partial updates to multiple PurchaseRequest
        objects on PATCH request.
        """

        try:
            qs = self.get_queryset()

            data = copy.deepcopy(request.data)

            serializer = self.get_serializer(
                instance=qs, data=data, many=True, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response(serializer.data, status=status.HTTP_200_OK)

            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "(purchasing/views.py) Unable to update approval items.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': '(purchasing/views.py) Serializer error occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)

class ApprovedItemsListView(ModelViewSet):
    """
    Retrieves items that have been approved for purchase with status
    not in 'Created' or 'Received'.
    """
    serializer_class = PurchaseItemSerializer
    queryset = PurchaseItem.objects.filter(
        approved='APPR',
        authorized='APPR',
        status__in=['REQ'])
    allowed_users = settings.TRANSACTION_ALLOWED_USERS
    permission_classes = [HasTransactionPermission]

    def patch(self, request, *args, **kwargs):
        """
        Updates a list of items on PATCH request.
        """

        try:
            qs = self.get_queryset()

            data = copy.deepcopy(request.data)

            serializer = self.get_serializer(
                instance=qs, data=data, many=True, partial=True)

            if serializer.is_valid():
                serializer.save()

                update_serializer = self.get_serializer(instance=self.get_queryset(), many=True)

                return Response(update_serializer.data, status=status.HTTP_200_OK)

            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "(purchasing/views.py) Unable to update approval items.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': '(purchasing/views.py) Serializer error occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)

class PurchasedItemsListView(ModelViewSet):
    """
    Retrieves and updates purchased items.
    """
    serializer_class = PurchaseItemSerializer
    queryset = PurchaseItem.objects.filter(
        approved='APPR',
        authorized='APPR',
        status__in=['PUR','SHIP','PREC'])
    allowed_users = settings.TRANSACTION_ALLOWED_USERS
    permission_classes = [HasTransactionPermission]

    def patch(self, request, *args, **kwargs):
        """
        Updates a list of items on PATCH request.
        """

        try:
            qs = self.get_queryset()

            data = copy.deepcopy(request.data)

            serializer = self.get_serializer(
                instance=qs, data=data, many=True, partial=True)

            if serializer.is_valid():
                serializer.save()

                update_serializer = self.get_serializer(instance=self.get_queryset(), many=True)

                return Response(update_serializer.data, status=status.HTTP_200_OK)

            else:
                return Response({
                        'status': 'Bad Request',
                        'message': "(purchasing/views.py) Unable to update approval items.",
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as err:
            return Response({
                        'status': 'Bad Request',
                        'message': '(purchasing/views.py) Serializer error occured.',
                        'errors': str(err) + '\n' + str(tb.format_exc())
                    }, status=status.HTTP_400_BAD_REQUEST)