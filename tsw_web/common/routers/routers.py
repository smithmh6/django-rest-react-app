"""
Common database router for all apps
"""

from django.conf import settings

# TODO: Remove all references to 'facility_db'

class CommonRouter(object):
    """
    Custom router class to route traffic according to app and to test
    or production database
    """

    def db_for_read(self, model, **hints):
        """
        Point facility operations to facility database, and all other traffic
        to either test or production according to debug
        """
        if model._meta.app_label == 'facility_app':
            return 'facility_db'
        return None

    def db_for_write(self, model, **hints):
        """
        Point facility operations to facility database, and all other traffic
        to either test or production according to debug
        """
        if model._meta.app_label == 'facility_app':
            return 'facility_db'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations only if app labels match.
        """
        if obj1._meta.app_label == obj2._meta.app_label:
            return True

        return None
