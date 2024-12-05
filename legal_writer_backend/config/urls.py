"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from core.views import ProjectViewSet, DocumentViewSet, NoteViewSet, ResourceViewSet, ChatView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'resources', ResourceViewSet, basename='resource')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api-auth/", include("rest_framework.urls")),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/chat/', ChatView.as_view(), name='chat'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
