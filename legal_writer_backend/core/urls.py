from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'resources', views.ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:project_id>/document/', views.project_document, name='project-document'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/', include('rest_framework.urls')),
]
