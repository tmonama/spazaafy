from rest_framework import serializers
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup

class HiringRequestSerializer(serializers.ModelSerializer):
    application_count = serializers.IntegerField(source='applications.count', read_only=True)
    class Meta:
        model = HiringRequest
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    cv_url = serializers.FileField(source='cv_file', read_only=True)
    class Meta:
        model = JobApplication
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    photo_url = serializers.ImageField(source='profile_picture', read_only=True)
    class Meta:
        model = Employee
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    signup_count = serializers.IntegerField(source='signups.count', read_only=True)
    class Meta:
        model = TrainingSession
        fields = '__all__'

class TrainingSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSignup
        fields = '__all__'