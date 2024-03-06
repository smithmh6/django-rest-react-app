#!user/bin/python
# -*- coding: utf-8 -*-
"""
'urls.py' contains the url paths for the
purchasing.
"""
from django.urls import path, include
from rest_framework import routers
from .views import (PurchaseItemListView,
                    PurchaseRequestListView,
                    PurchaseRequestDetailView,
                    AuthorizationDetailView,
                    VendorListView,
                    GroupListView,
                    ProjectListView,
                    CategoryListView,
                    AccountTypeListView,
                    ProjectStatusListView,
                    ApprovalListView,
                    ApprovalStatusListView,
                    AuthorizationListView,
                    ApprovedItemsListView,
                    ItemStatusListView,
                    RequestStatusListView,
                    AuthorizedItemsListView,
                    PurchasedItemsListView)

# define app name
app_name = 'purchasing'

# set up router object
router = routers.DefaultRouter()

# vendors, groups, projects, categories
router.register(r'vendors', VendorListView, 'purchasing-vendors')
router.register(r'groups', GroupListView, 'purchasing-groups')
router.register(r'projects', ProjectListView, 'purchasing-projects')
router.register(r'categories', CategoryListView, 'purchasing-categories')

# status items / account types
router.register(r'account-types', AccountTypeListView, 'purchasing-account-types')
router.register(r'project-status', ProjectStatusListView, 'purchasing-project-status')
router.register(r'approval-status', ApprovalStatusListView, 'purchasing-approval-status')
router.register(r'item-status', ItemStatusListView, 'purchasing-item-status')
router.register(r'request-status', RequestStatusListView, 'purchasing-request-status')

# user purchase requests/items
router.register(r'user-requests', PurchaseRequestListView, 'purchasing-user-requests')
router.register(r'requests/(?P<request_id>\w+)', PurchaseRequestDetailView, 'purchasing-request-detail')
router.register(r'request/(?P<request_id>\w+)/items', PurchaseItemListView, 'purchasing-items')
## router.register(r'received-items', ReceivedItemsListView, 'purchasing-received-items')

# authorizations
router.register(r'authorization-requests', AuthorizationListView, 'purchasing-authorization-requests')
router.register(r'authorizations/(?P<request_id>\w+)', AuthorizationDetailView, 'purchasing-authorization-detail')

# approvals
router.register(r'approval-requests', ApprovalListView, 'purchasing-approval-requests')
router.register(r'request/(?P<request_id>\w+)/authorized-items', AuthorizedItemsListView, 'purchasing-authorized-items')

# purchasing
router.register(r'approved-items', ApprovedItemsListView, 'purchasing-approved-items')

# receiving
router.register(r'purchased-items', PurchasedItemsListView, 'purchasing-purchased-items')

# define list for url patterns
urlpatterns = [path('', include(router.urls))]
