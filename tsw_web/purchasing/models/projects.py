"""
Database models used for project management tasks in
purchasing.
"""

from django.db.models import ForeignKey, PROTECT
from common.models import GenericProject, AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin, TimestampsMixin
from .status import ProjectStatus

class Group(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """"""

class Category(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """"""

class Project(GenericProject):
    """"""
    group = ForeignKey(Group, to_field='code', on_delete=PROTECT, null=True)
    status = ForeignKey(ProjectStatus, on_delete=PROTECT, to_field='code', default='Pending')
