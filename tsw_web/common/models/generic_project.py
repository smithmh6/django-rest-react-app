"""
Abstract model class GenericProject provides common fields for
project management models.
"""

from django.db.models import CharField, DecimalField, DateField
from .abcmodel import AbstractNamedItemModel
from .mixins import DescriptionMixin, UniqueCodeMixin, TimestampsMixin

class GenericProject(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin, TimestampsMixin):
    """
    GenericProject model definition.
    """
    # override name, unique=False
    name = CharField(max_length=250, unique=False)
    budget = DecimalField(max_digits=12, decimal_places=2)
    spent = DecimalField(max_digits=12, decimal_places=2, null=True)
    started = DateField(null=True)
    completed = DateField(null=True)

    class Meta:
        abstract = True
