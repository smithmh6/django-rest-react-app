"""
Register texturedar models here.
"""

# import dependencies
from django.contrib import admin
from .models import (ARSample,
                     CCSData,
                     FlameData,
                     ImageData,
                     RIERecipe,
                     CleanRecipe,
                     Substrate,
                     Tooling)
from .models import (VendorSku,
                     RawMaterialSku,
                     OpticalCoatSku,
                     FinalProductSku,
                     ProductCategory,
                     TarBatch,
                     RieSystem,
                     RieTooling,
                     EtchRecipe,
                     Part,
                     Fail,
                     Step)

# register research models
admin.site.register(ARSample)
admin.site.register(CCSData)
admin.site.register(FlameData)
admin.site.register(ImageData)
admin.site.register(RIERecipe)
admin.site.register(CleanRecipe)
admin.site.register(Substrate)
admin.site.register(Tooling)

# Register production models
admin.site.register(VendorSku)
admin.site.register(RawMaterialSku)
admin.site.register(OpticalCoatSku)
admin.site.register(FinalProductSku)
admin.site.register(ProductCategory)
admin.site.register(TarBatch)
admin.site.register(RieSystem)
admin.site.register(RieTooling)
admin.site.register(EtchRecipe)
admin.site.register(Part)
admin.site.register(Fail)
admin.site.register(Step)
