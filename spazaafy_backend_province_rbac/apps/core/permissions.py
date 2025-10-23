from rest_framework import permissions

class ProvinceScopedMixin:
    def scope_by_province(self, qs, user):
        # Global Admin: ADMIN + is_staff + no province
        if getattr(user,'role',None)=='ADMIN' and user.is_staff and getattr(user,'province_id',None) is None:
            return qs
        # Province Admin: ADMIN + is_staff + province set
        if getattr(user,'role',None)=='ADMIN' and user.is_staff and getattr(user,'province_id',None):
            pid = user.province_id
            if hasattr(qs.model,'province_id'): return qs.filter(province_id=pid)
            if hasattr(qs.model,'shop'): return qs.filter(shop__province_id=pid)
            return qs.none()
        # Owner scope fallback
        if getattr(user,'role',None)=='OWNER':
            if hasattr(qs.model,'owner_id'): return qs.filter(owner=user)
            if hasattr(qs.model,'shop'): return qs.filter(shop__owner=user)
        return qs.none()
