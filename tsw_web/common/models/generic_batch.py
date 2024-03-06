"""
Abstract model class GenericBatch provides common fields for
production batch children models.
"""

from abc import abstractmethod
import datetime
from django.conf import settings
from django.core.files import File
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import PROTECT
from django.db.models import (
    CharField,
    DateField,
    BooleanField,
    PositiveIntegerField,
    ForeignKey,
    FileField
)
from io import BytesIO
import pyqrcode
from pyqrcode.builder import _png
from PIL import Image, ImageDraw
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from .abcmodel import AbstractNamedItemModel
from .mixins import TimestampsMixin, NotesMixin, SteppableMixin

BATCH_TYPE_LIST = [
    ("PRODUCTION", "PRODUCTION"),
    ("DEVELOPMENT", "DEVELOPMENT"),
    ("TEST", "TEST"),
    ("CUSTOM", "CUSTOM")
]

def date_needed():
    """
    Callable passed to GenericBatch to set 'needed'
    to today + 7 days.
    """
    return datetime.date.today() + datetime.timedelta(days=7)

class GenericBatch(AbstractNamedItemModel, TimestampsMixin, NotesMixin, SteppableMixin):
    """
    GenericBatch model definition.
    """
    # override name to shorten field length
    name = CharField(max_length=50, unique=True)
    # NOTE: make Nullable for R&D batches
    order_no = CharField(max_length=50, null=True)
    qty = PositiveIntegerField()
    ordered = DateField(null=True)
    needed = DateField(default=date_needed)
    # NOTE: change to "status" -- Open, Completed, Failed
    closed = BooleanField(default=False)
    hold = BooleanField(default=False)
    qrcode = FileField(upload_to='qrcodes', null=True, blank=True)
    sku_object_id = PositiveIntegerField()
    sku_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_batch_skus')
    sku = GenericForeignKey('sku_content_type', 'sku_object_id')
    user = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT, to_field='username')
    batch_type = CharField(choices=BATCH_TYPE_LIST, default="PRODUCTION", max_length=25)

    class Meta:
        abstract = True

    @property
    @abstractmethod
    def pass_qty(self):
         """Read only property for pass quantity"""

    @property
    @abstractmethod
    def fail_qty(self):
         """Read only property for fail quantity"""

    def save(self, *args, **kwargs):
        """
        Override save method to create qr code on save.
        """
        
        if self.qrcode.name is None:
            skuName = self.sku.name
            batchName = self.name
            batchQty = self.qty
            batchQRcode = pyqrcode.create(str(batchName)
                                            + '\t' + str(skuName)
                                            + '\t' + str(batchQty))
            label = BytesIO()
            canv = Canvas(label, pagesize=(216, 72))
            canv.setFont('Helvetica', 22)
            canv.drawString(4, 50, str(batchName))
            canv.setFont('Helvetica', 14)
            canv.drawString(4, 30, str(skuName))
            canv.drawString(4, 10, str(batchQty) + "pcs")
            QRstream = BytesIO()
            batchQRcode.png(QRstream, scale=8)
            QRimg = Image.open(QRstream)
            canv.drawInlineImage(QRimg, 140, 0, 72, 72)
            canv.save()
            fname = f'qr_code-' + str(batchName) + '.pdf'
            self.qrcode.save(fname, File(label), save=False)

        super().save(*args, **kwargs)
