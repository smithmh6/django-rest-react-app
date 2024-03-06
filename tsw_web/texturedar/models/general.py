"""
General models used by the other models in the textured app.
"""

from common.models import GenericStep, GenericFail

class Fail(GenericFail):
    """
    Textured AR Failcode object model.
    """

class Step(GenericStep):
    """
    Textured AR Step object model.
    """
