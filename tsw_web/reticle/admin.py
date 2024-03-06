"""
Register database models for reticle.
"""

# import dependencies
from django.contrib import admin
from .models import *


# base models
admin.site.register(Fail)
admin.site.register(Step)

# batch models
admin.site.register(CoatBatch)
admin.site.register(SheetBatch)
admin.site.register(DiceBatch)

# part model
admin.site.register(Part)

# plate model
admin.site.register(Plate)

# sku models
admin.site.register(RawMaterialSku)
admin.site.register(CoatSku)
admin.site.register(SheetToPhotomask)
admin.site.register(PhotomaskSku)
admin.site.register(SheetSku)
admin.site.register(DiceRoute)
admin.site.register(DiceSku)
admin.site.register(ProductCategory)
admin.site.register(FinalProductSku)
