# apps/accounts/permissions.py

from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS) are allowed to any authenticated user.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions (PATCH, PUT, DELETE) are only allowed to the owner of the
        # profile or an admin user.
        return obj == request.user or request.user.is_staff