"""
Base serializer classes for reticle.
"""

# import dependencies
from rest_framework import serializers
from ..models import *

class DynamicFieldSerializer(serializers.ModelSerializer):
    """
    Takes an additional 'fields' argument that controls
    which fields to be used during serialization. Inherits
    from 'ModelSerializer' base class.
    """

    def __init__(self, *args, **kwargs):
        """
        Instantiate the serializer.
        """
        # don't pass 'fields' arg up to superclass
        fields = kwargs.pop('fields', None)

        # instantiate superclass
        super(DynamicFieldSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # drop fields not specified in 'fields' argument
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class StepSerializer(DynamicFieldSerializer):

    next_step = serializers.SlugRelatedField(slug_field="name", read_only=True)
    previous_step = serializers.SlugRelatedField(slug_field="name", read_only=True)

    class Meta:
        model = Step
        fields = '__all__'


class FailCodeSerializer(DynamicFieldSerializer):
    class Meta:
        model = Fail
        fields = '__all__'
