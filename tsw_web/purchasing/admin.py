"""
Register the 'purchasing' models in the
admin panel.
"""

from django.contrib import admin
from .models import (Group,
                     Category,
                     Project,
                     ProjectStatus,
                     ItemStatus,
                     ApprovalStatus,
                     AccountType,
                     PurchaseRequest,
                     PurchaseItem,
                     Vendor)

# projects
admin.site.register(Group)
admin.site.register(Category)
admin.site.register(Project)

# status items/account type
admin.site.register(ProjectStatus)
admin.site.register(ItemStatus)
admin.site.register(ApprovalStatus)
admin.site.register(AccountType)

# purchasing
admin.site.register(PurchaseRequest)
admin.site.register(PurchaseItem)
admin.site.register(Vendor)
