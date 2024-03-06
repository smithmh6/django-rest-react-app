"""
Imports url patterns for reticle.
"""

# import url patterns
from .batches import batch_url_patterns
from .initialize import init_url_patterns
from .general import general_url_patterns
from .plates import plate_url_patterns
from .parts import part_url_patterns
from .parts import part_url_patterns
from .skus import sku_url_patterns

# define the app name
app_name = 'reticle'

# create full url list
urlpatterns = (
        batch_url_patterns
    +   init_url_patterns
    +   general_url_patterns
    +   plate_url_patterns
    +   part_url_patterns
    +   sku_url_patterns
)
