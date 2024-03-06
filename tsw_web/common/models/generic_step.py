"""
Abstract model class AbstractBatch provides common fields for
production batch children models.
"""

from django.db.models import PROTECT
from django.db.models import CharField, ForeignKey
from .abcmodel import AbstractNamedItemModel
from .mixins import DescriptionMixin

class GenericStep(AbstractNamedItemModel, DescriptionMixin):
    """
    GenericStep model definition.
    """
    # override name to shorted length
    name = CharField(max_length=50, unique=True)
    location = CharField(max_length=100, null=True)
    previous_step = ForeignKey('self',
                               on_delete=PROTECT,
                               to_field='name',
                               null=True,
                               related_name='%(app_label)s_%(class)s_prev_related_steps',
                               db_column="previous_step_name")
    next_step = ForeignKey('self',
                           on_delete=PROTECT,
                           to_field='name',
                           null=True,
                           related_name='%(app_label)s_%(class)s_next_related_steps',
                           db_column="next_step_name")

    class Meta:
        abstract = True
