"""
Abstract model class GenericAddress provides common fields for
models that include address data like Customers, Vendors, Warehouses, etc.
"""

from django.db.models import CharField
from .abcmodel import AbstractNamedItemModel

class GenericAddress(AbstractNamedItemModel):
    """
    GenericAddress model definition.
    """
    name = CharField(max_length=250, unique=False)  # override default name with unique=False
    street1 = CharField(max_length=250, null=True)
    street2 = CharField(max_length=250, null=True)
    city = CharField(max_length=250, null=True)
    state = CharField(max_length=250, null=True)
    zip_code = CharField(max_length=250, null=True)
    country = CharField(max_length=250, null=True)
    email = CharField(max_length=250, null=True)
    contact = CharField(max_length=250, null=True)
    phone = CharField(max_length=250, null=True)

    class Meta:
        abstract = True
