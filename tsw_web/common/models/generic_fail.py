"""
Abstract model class GenericFail provides common fields for
production Fail models.
"""

from django.db.models import BooleanField, CharField
from .abcmodel import AbstractNamedItemModel
from .mixins import DescriptionMixin

class GenericFail(AbstractNamedItemModel, DescriptionMixin):
    """
    GenericFail model definition.
    """
    # override name to shorten field
    name = CharField(max_length=25, unique=True)
    active = BooleanField(default=True)

    class Meta:
        abstract = True
