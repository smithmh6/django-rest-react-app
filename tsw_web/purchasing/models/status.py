"""
Models definitions for status items and account type.
"""

from common.models import AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin

class ItemStatus(AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin):
    """
    Database model for item status options.
    """

class ApprovalStatus(AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin):
    """
    Database model for Approval status items.
    """

class AccountType(AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin):
    """
    Database model for Account Types.
    """

class ProjectStatus(AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin):
    """
    Database model for Project Status.
    """

class RequestStatus(AbstractNamedItemModel, UniqueCodeMixin, DescriptionMixin):
    """
    Database model for PurchaseRequest status.
    """
