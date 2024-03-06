"""
Models used to track research and development
in the texturedar.
"""

# import dependencies
from django.conf import settings
from django.db import models

class ARSample(models.Model):
    """
    Model representing ARSample objects.
    """
    name = models.CharField(max_length=50, unique=True)
    created = models.DateTimeField(auto_now_add=True, blank=True)
    runtime = models.IntegerField(default=0)
    sem = models.BooleanField(default=False, blank=True)
    storage_types = [
        (0, "Air"),
        (1, "Nitrogen"),
        (2, "Vacuum")
    ]
    storage = models.IntegerField(default=0, choices=storage_types, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        to_field='username',
        null=True, blank=True
    )
    substrate = models.ForeignKey(
        "Substrate",
        on_delete=models.CASCADE,
        to_field='id',
        null=True
    )
    clean_recipe = models.ForeignKey(
        "CleanRecipe",
        on_delete=models.CASCADE,
        to_field='id',
        null=True
    )
    rie_recipe = models.ForeignKey(
        "RIERecipe",
        on_delete=models.CASCADE,
        to_field='id',
        null=True
    )
    tooling = models.ForeignKey(
        "Tooling",
        on_delete=models.CASCADE,
        to_field='id',
        null=True
    )

    def __str__(self):
        """
        Override __str__ to display sample name.
        """
        return str(self.name)

class CCSData(models.Model):
    """
    Model representing CCSData objects.
    """

    created = models.DateTimeField(auto_now_add=True, blank=True)
    etched_surface = models.IntegerField(default=1, blank=True)
    int_time = models.FloatField(default=0.00, blank=True)
    avgs = models.IntegerField(default=0, blank=True)
    data_file = models.FileField(
        upload_to='ar_data/research_development/ccs_data/',
        max_length=250
    )
    arsample = models.ForeignKey(
        ARSample,
        on_delete=models.CASCADE,
        to_field='name',
        null=True
    )
    measured_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        to_field='username',
        null=True, blank=True
    )
    measurement_id = models.CharField(max_length=50)

    def __str__(self):
        """
        Override __str__ to display measurement name.
        """

        # strip _CCS from file name
        fname = str(self.data_file).replace('_CCS', '')
        # remove .txt
        fname = fname.replace('.txt', '')
        # remove preceding path name
        fname = fname.replace('ar_data/research_development/ccs_data/', '')

        return fname

class FlameData(models.Model):
    """
    Model representing FlameData objects.
    """

    created = models.DateTimeField(auto_now_add=True, blank=True)
    etched_surface = models.IntegerField(default=1, blank=True)
    int_time = models.FloatField(default=0.00, blank=True)
    avgs = models.IntegerField(default=0, blank=True)
    nlc = models.IntegerField(default=0, blank=True)
    edc = models.IntegerField(default=0, blank=True)
    data_file = models.FileField(
        upload_to='ar_data/research_development/flame_data/',
        max_length=250
        )
    arsample = models.ForeignKey(
        ARSample,
        on_delete=models.CASCADE,
        to_field='name',
        null=True
    )
    measured_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        to_field='username',
        null=True, blank=True
    )
    measurement_id = models.CharField(max_length=50)

    def __str__(self):
        """
        Override __str__ to display file name.
        """
        return str(self.data_file)

class ImageData(models.Model):
    """
    Model representing ImageData objects.
    """
    created = models.DateTimeField(auto_now_add=True, blank=True)
    image_file = models.ImageField(
        upload_to='ar_data/research_development/image_data/',
        max_length=250
    )
    arsample = models.ForeignKey(
        ARSample,
        on_delete=models.CASCADE,
        to_field='name',
        null=True
    )
    measured_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        to_field='username',
        null=True, blank=True
    )
    notes = models.CharField(max_length=250, null=True, blank=True)

    def __str__(self):
        """
        Override __str__ to display file name.
        """
        return str(self.image_file)

class RIERecipe(models.Model):
    """
    Model representing RIERecipe objects.
    """
    name = models.CharField(max_length=100, unique=True)
    chf3 = models.FloatField(default=0.0, blank=True)
    sf6 = models.FloatField(default=0.0, blank=True)
    helium = models.FloatField(default=0.0, blank=True)
    o2 = models.FloatField(default=0.0, blank=True)
    c4f8 = models.FloatField(default=0.0, blank=True)
    rie_power = models.FloatField(default=0.0, blank=True)
    icp_power = models.FloatField(default=0.0, blank=True)
    pressure_mtorr = models.FloatField(default=0.0, blank=True)


    def __str__(self):
        """
        Override __str__ to display recipe name.
        """
        return str(self.name)

class CleanRecipe(models.Model):
    """
    Model representing CleanRecipe objects.
    """
    name = models.CharField(max_length=100, unique=True)
    cleaning_types = [
        (0, "Piranha"),
        (1, "O2 Plasma"),
        (2, "Solvent Mixture"),
        (3, "Ultrasonic"),
        (4, "Decon 90 Solution")
    ]
    type = models.IntegerField(default=0, choices=cleaning_types, blank=True)
    temp_c = models.FloatField(default=0.0, blank=True)

    def __str__(self):
        """
        Override __str__ to display recipe name.
        """
        return str(self.name)

class Substrate(models.Model):
    """
    Model representing Substrate objects.
    """
    name = models.CharField(max_length=100, unique=True)
    substrate_types = [
        (0, "Fused Silica"),
        (1, "BK7")
    ]
    type = models.IntegerField(default=0, choices=substrate_types)
    od_mm = models.FloatField(default=0.0)
    thickness_mm = models.FloatField(default=0.0)
    grade_list = [
        (0, "IR"),
        (1, "UV")
    ]
    grade = models.IntegerField(default=0, choices=grade_list)

    def __str__(self):
        """
        Override __str__ to display substrate name.
        """
        return str(self.name)

class Tooling(models.Model):
    """
    Model representing Tooling objects.
    """
    name = models.CharField(max_length=100, unique=True)
    tool_types = [
        (0, "Stainless Steel"),
        (1, "Aluminum")
    ]
    material = models.IntegerField(default=0, choices=tool_types)
    pockets = models.IntegerField(default=0)
    od_mm = models.FloatField(default=0.0)
    thickness_mm = models.FloatField(default=0.0)

    def __str__(self):
        """
        Override __str__ to display tooling name.
        """
        return str(self.name)

