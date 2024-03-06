"""
Textured AR Batch model plus other model dependencies specifically
for batches.
"""

from django.db.models import CharField, DateField, BooleanField, FloatField, ForeignKey
from django.db.models import PROTECT
from django.contrib.contenttypes.fields import GenericRelation
from common.models import GenericBatch, AbstractNamedItemModel, UniqueCodeMixin, NotesMixin, TimestampsMixin, VendorSkuMixin, DescriptionMixin
from .skus import OpticalCoatSku
from .part import Part

# QR Code imports
from django.core.files import File
import pyqrcode
from io import BytesIO
from PIL import Image, ImageEnhance
from reportlab.pdfgen.canvas import Canvas

# Additional barcode imports
import barcode
from barcode import Code128
from barcode.writer import ImageWriter

class RieSystem(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin, NotesMixin, VendorSkuMixin):
    """
    Model representation of physical RIE systems in the lab.
    """
    name = CharField(max_length=250)
    serial = CharField(max_length=250, null=True)
    model = CharField(max_length=250, null=True)
    purchased = DateField(null=True)


class EtchRecipe(AbstractNamedItemModel, DescriptionMixin, TimestampsMixin, NotesMixin):
    """
    RIE Etch recipe used in manufacturing process.
    """
    # NOTE: change to db_column=rie_code
    name = CharField(max_length=250)
    rie = ForeignKey(RieSystem, on_delete=PROTECT, to_field='code')
    active = BooleanField(default=True)
    power_watt = FloatField(default=0.00)
    time_sec = FloatField(default=0.00)
    press_mtorr = FloatField(default=0.00)
    sf6_sccm = FloatField(default=0.00)
    c4f8_sccm = FloatField(default=0.00)
    chf3_sccm = FloatField(default=0.00)
    o2_sccm = FloatField(default=0.00)
    he_sccm = FloatField(default=0.00)
    # NOTE: change to db_column=oc_sku_name
    oc_sku = ForeignKey(OpticalCoatSku, on_delete=PROTECT, to_field='name')

class RieTooling(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """
    Tooling used to hold samples in RIE processing.
    """
    name = CharField(max_length=250)

class TarBatch(GenericBatch):
    """
    Texture AR Batch object model.
    """
    # NOTE: should change to 'code' for both of these
    # NOTE: add db_column ==> recipe_code, tooling_code
    recipe = ForeignKey(EtchRecipe, on_delete=PROTECT)
    tooling = ForeignKey(RieTooling, on_delete=PROTECT)
    parts = GenericRelation(Part, 'batch_object_id', 'batch_content_type')

    @property
    def fails(self):
        "Read-only property for the number of failing plates in the batch."
        return len(self.parts.exclude(fail1_object_id=None))

    # NOTE: use this to replace 'fails'
    @property
    def pass_qty(self):
         """Read only property for pass quantity"""
         return self.parts.filter(fail1_object_id=None).count()

    @property
    def fail_qty(self):
         """Read only property for fail quantity"""
         return self.parts.exclude(fail1_object_id=None).count()

    def save(self, *args, **kwargs):
        """
        Add qrcode field on save if it doesn't exist.
        """
        if self.qrcode == None:

            max_length = 37

            # Get info from batch/SKU
            batch_name = self.name
            qty = self.qty
            sku_name = self.sku.name
            sku_description = ''

            if (self.sku.description is not None):
                sku_description = self.sku.description
                if (len(sku_description) > max_length):
                    sku_description = sku_description[:max_length] + '\n'+ sku_description[max_length:]
            file_name = f'qrcode-{batch_name}.pdf'

            # TODO determine where INSP comes from
            INSP="INSP 892408"

            # Calculate Serial Nums
            starting_serial = 1 # Start at 1 by default
            if Part.objects.exists(): # or 1 plus the most recent part
                starting_serial = int(Part.objects.last().serial) + 1

            label = BytesIO()
            canvas = Canvas(label, pagesize=(216, 72))

            # First page: Batch QR Code
            canvas.setFont('Helvetica', 22)
            canvas.drawString(4, 50, str(batch_name))
            canvas.setFont('Helvetica', 14)
            canvas.drawString(4, 30, str(sku_name))
            canvas.drawString(4, 10, str(qty) + "pcs")
            QRstream = BytesIO()
            new_qrcode = pyqrcode.create(str(batch_name) + '\t' + str(sku_name) + '\t' + str(qty))
            new_qrcode.png(QRstream, scale=8)
            QRimg = Image.open(QRstream)
            canvas.drawInlineImage(QRimg, 140, 0, 72, 72)
            canvas.showPage()

            # Remaining pages: Part Barcodes
            canvas.setPageSize((144, 72))
            SKUBarcodeImg = BytesIO() # Barcode Stream

            for Serial in range(qty):

                barcode.base.Barcode.default_writer_options['write_text'] = False # Remove the text at the bottom
                Code128(str(sku_name), writer=ImageWriter()).write(SKUBarcodeImg) # Create the barcode image
                canvas.setFont("Courier-Bold", 9)
                canvas.drawString(36, 40, sku_name)
                canvas.setFont("Courier", 6)
                # TODO: figure out how to wrap SKU description
                text_obj = canvas.beginText()
                text_obj.setTextOrigin(6, 33)
                text_obj.textLines(sku_description)
                canvas.drawText(text_obj)
                canvas.setFont("Courier", 8)
                canvas.drawString(6, 10, batch_name)
                canvas.setFont("Courier-Bold", 8)
                canvas.drawString(54, 18, ('000000'+str(Serial+starting_serial))[-7:])
                canvas.setFont("Courier", 8)
                canvas.drawString(86, 10, INSP)
                barcodeImage = Image.open(SKUBarcodeImg) # Convert byte stream into an image object
                w, h = barcodeImage.size
                resizedImage=barcodeImage.resize((w*10,h*10),Image.NONE)
                enhancer = ImageEnhance.Sharpness(resizedImage)
                barcodeImage=enhancer.enhance(10)
                canvas.drawInlineImage(resizedImage, 0, 50, 144, 18 ) # Draw the image into the pdf
                canvas.showPage()

            canvas.save() # Save the PDF data into 'label'
            # Save the label as a file on field `qrcode`
            self.qrcode.save(file_name, File(label), save=False)

        super().save(*args, **kwargs)
