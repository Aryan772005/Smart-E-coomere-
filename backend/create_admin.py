import os
import django
import sys

# Try to use prod settings if it exists, otherwise dev
# In the Dockerfile, DJANGO_SETTINGS_MODULE might be set by Render, but we can default to dev just in case.
# But it's safer to let Django use the existing env var if present.
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email = 'admin@reloqa.com'

try:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password='adminpassword',
            first_name='Admin'
        )
        print(f"Admin user {email} created successfully.")
    else:
        print(f"Admin user {email} already exists.")
except Exception as e:
    print(f"Failed to create admin user: {e}")
    sys.exit(1)
