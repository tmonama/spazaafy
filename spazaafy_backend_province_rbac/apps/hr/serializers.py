from rest_framework import serializers
from .models import HiringRequest, JobApplication, Employee, TrainingSession, TrainingSignup, HRComplaint, Announcement
from apps.accounts.models import AdminVerificationCode
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

User = get_user_model()

ALLOWED_EMPLOYEE_EXCEPTIONS = [
    'spazaafy@gmail.com',
    'tappdevelops@gmail.com',
    'thakgalangmonama@gmail.com',
]

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
    cv_url = serializers.SerializerMethodField()
    class Meta:
        model = Employee
        fields = '__all__'

    def get_photo_url(self, obj):
        try:
            if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
                return obj.profile_picture.url
        except: return None

    # ✅ Safe CV URL getter
    def get_cv_url(self, obj):
        try:
            if obj.cv_file and hasattr(obj.cv_file, 'url'):
                return obj.cv_file.url
        except: return None

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
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Announcement
        fields = '__all__'

class EmployeeRegisterRequestSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower().strip()
        
        # ✅ Check Whitelist first
        if email in ALLOWED_EMPLOYEE_EXCEPTIONS:
            return email
            
        # Then check Domain
        if not email.endswith('@spazaafy.co.za'):
            raise serializers.ValidationError("Email must belong to the @spazaafy.co.za domain or be on the exception list.")
        
        return email

class EmployeeRegisterConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField() # Added to ensure we can link correct employee
    last_name = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email').lower().strip()
        code = attrs.get('code')
        
        # Verify Code
        try:
            record = AdminVerificationCode.objects.get(email=email)
            if record.code != code:
                raise serializers.ValidationError("Invalid verification code.")
        except AdminVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No verification code found. Please restart.")
            
        validate_password(attrs.get('password'))
        return attrs