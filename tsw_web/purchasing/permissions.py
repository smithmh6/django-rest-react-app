"""
Specify custom permissions for transactions and approvals.
"""

from rest_framework.permissions import BasePermission


class HasApprovalPermission(BasePermission):
    """
    Determines which users can edit purchase approvals.
    """

    message = "You do not have permission to edit approvals!"

    def has_permission(self, request, view):
        """
        Validate if user is allowed to access approvals.
        """
        allowed_users = getattr(view, "allowed_users", [])

        return request.user.username in allowed_users

class HasTransactionPermission(BasePermission):
    """
    Determines which users can edit transactions.
    """

    message = "You do not have permission to edit transactions!"

    def has_permission(self, request, view):
        """
        Validate if user is allowed to access transactions.
        """
        allowed_users = getattr(view, "allowed_users", [])

        return request.user.username in allowed_users

class HasAuthorizationPermission(BasePermission):
    """
    Determines which users can authorize purchases.
    """

    message = "You do not have permission to authorize purchases!"

    def has_permission(self, request, view):
        """
        Validate if user is allowed to access transactions.
        """
        allowed_users = getattr(view, "allowed_users", [])

        return request.user.username in allowed_users

class HasInventoryPermission(BasePermission):
    """
    Determine users allowed to change inventory information.
    """

    message = "You do not have permission to update inventory!"

    def has_permission(self, request, view):
        """
        Validate if user is allowed to access transactions.
        """
        allowed_users = getattr(view, "allowed_users", [])

        return request.user.username in allowed_users
