"""
Abstract Base Class model definition.
"""

from abc import ABCMeta
from django.db import models

class AbstractModelMeta(ABCMeta, type(models.Model)):
    "Abstract Model Meta definition."
    pass

class AbstractBaseModel(models.Model, metaclass=AbstractModelMeta):
    """Abstract base model definition."""

    class Meta:
        abstract = True

class AbstractNamedItemModel(models.Model, metaclass=AbstractModelMeta):
    """
    Abstract Named Item Model definition. Includes a 'name' field
    and custom __str__ method that returns the name of the item.
    """
    name = models.CharField(max_length=250, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
            """
            Overide __str__ to display sku name.
            """
            return f"{self.name}"
