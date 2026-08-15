import os

DJANGO_ENV = os.getenv("DJANGO_ENV", "development")

if DJANGO_ENV == "production":
    from .prod import *  # noqa: F401,F403
elif DJANGO_ENV == "testing":
    from .test import *  # noqa: F401,F403
else:
    from .dev import *  # noqa: F401,F403
