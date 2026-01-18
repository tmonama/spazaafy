from rest_framework import serializers
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup, HRComplaint, Announcement

class HiringRequestSerializer(serializers.ModelSerializer):
    application_count = serializers.IntegerField(source='applications.count', read_only=True)
    class Meta:
        model = HiringRequest
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField for safety
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = '__all__'

    def get_cv_url(self, obj):
        try:
            if obj.cv_file and hasattr(obj.cv_file, 'name') and obj.cv_file.name:
                return obj.cv_file.url
        except Exception:
            return None

class EmployeeSerializer(serializers.ModelSerializer):
    photo_url = serializers.ImageField(source='profile_picture', read_only=True)
    class Meta:
        model = Employee
        fields = '__all__'

class TrainingSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSignup
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    signup_count = serializers.IntegerField(source='signups.count', read_only=True)
    signups = TrainingSignupSerializer(many=True, read_only=True)
    class Meta:
        model = TrainingSession
        fields = '__all__'

class HRComplaintSerializer(serializers.ModelSerializer):
    # Using source with read_only=True allows getting names without crashing if fields are null
    complainant_name = serializers.CharField(source='complainant.first_name', read_only=True)
    respondent_name = serializers.CharField(source='respondent.first_name', read_only=True)

    class Meta:
        model = HRComplaint
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'