"""
Base shared models in reticle.
"""

# import dependencies
from common.models import GenericStep, GenericFail

class Step(GenericStep):
    """Model definition for reticle Steps."""

class Fail(GenericFail):
    """
    Model storing Reticle fail codes.
    """