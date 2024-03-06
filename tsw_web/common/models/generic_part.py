"""
Abstract model class GenericPart provides common fields for
production batch children models.
"""
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import PROTECT
from django.db.models import (
    CharField,
    PositiveIntegerField,
    ForeignKey
)
from .mixins import TimestampsMixin, NotesMixin, BatchableMixin, ShippableMixin, SteppableMixin

class GenericPart(TimestampsMixin, NotesMixin, BatchableMixin, ShippableMixin, SteppableMixin):
    """
    GenericPart model definition.
    """
    serial = CharField(max_length=50, null=True)
    index = PositiveIntegerField()
    fail1_object_id = PositiveIntegerField(null=True)
    fail1_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_fail1_parts', null=True)
    fail1 = GenericForeignKey('fail1_content_type', 'fail1_object_id')
    fail2_object_id = PositiveIntegerField(null=True)
    fail2_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_fail2_parts', null=True)
    fail2 = GenericForeignKey('fail2_content_type', 'fail2_object_id')
    fail3_object_id = PositiveIntegerField(null=True)
    fail3_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_fail3_parts', null=True)
    fail3 = GenericForeignKey('fail3_content_type', 'fail3_object_id')


    class Meta:
        abstract = True

    def __str__(self):
        """
        Override __str__ method to display part serial number.
        """
        return f"{self.serial}"

    @property
    def is_failed(self):
        """
        Returns true if part is failed, false otherwise.
        """
        return self.fail1 is not None
