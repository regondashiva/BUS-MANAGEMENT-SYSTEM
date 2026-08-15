import os
import urllib.parse
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Configure PyMySQL as a fallback driver for MySQL if mysqlclient is not available
try:
    import mysqlclient
except ImportError:
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass


# ==============================================================================
# PATHS & ENV CONFIGURATION
# ==============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent
# Load environment variables from the parent of travels/ (backend root)
load_dotenv(BASE_DIR.parent / ".env")



# ==============================================================================
# SECURITY CONFIGURATION
# ==============================================================================
DEBUG = os.environ.get("DEBUG", "False") == "True"

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-u!x%7#q!+b$8$(vma2bxw#*b!*@2w!c$n$3w_9ok8-1jp_)_3h"
    else:
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("The SECRET_KEY environment variable must be set in production.")


# Configure ALLOWED_HOSTS using environment variables with development defaults
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
env_hosts = os.environ.get("ALLOWED_HOSTS")
if env_hosts:
    ALLOWED_HOSTS.extend([h.strip() for h in env_hosts.split(",") if h.strip()])

# Secure proxy SSL header for Render deployment
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Production-specific security settings (only active when DEBUG=False)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True



# ==============================================================================
# APPLICATION & MIDDLEWARE DEFINITION
# ==============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'bookings.apps.BookingsConfig',
    'rest_framework.authtoken',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Immediately after SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'travels.urls'
WSGI_APPLICATION = 'travels.wsgi.application'


# ==============================================================================
# DJANGO CHANNELS & REDIS CONFIGURATION
# ==============================================================================
ASGI_APPLICATION = 'travels.asgi.application'

REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')

# Parse Redis URL to check for SSL and configure compatibly with Render Redis
if REDIS_URL.startswith("rediss://"):
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [{
                    "address": REDIS_URL,
                    "ssl_cert_reqs": None,
                }],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [REDIS_URL],
            },
        },
    }


# ==============================================================================
# REST FRAMEWORK & CORS / CSRF CONFIGURATION
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# CORS setup with local dev and Vercel/Render frontend via environment variable
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
env_cors = os.environ.get("CORS_ALLOWED_ORIGINS")
if env_cors:
    CORS_ALLOWED_ORIGINS.extend([origin.strip() for origin in env_cors.split(",") if origin.strip()])

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins from environment variables
CSRF_TRUSTED_ORIGINS = os.environ.get(
    "CSRF_TRUSTED_ORIGINS",
    ""
).split(",") if os.environ.get("CSRF_TRUSTED_ORIGINS") else []

# Razorpay Credentials (Free Test Credentials for Sandbox / Test Mode)
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_5Wq2c0L0zQv23P")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "test_secret_1234567890")


# ==============================================================================
# DATABASE CONFIGURATION (MYSQL)
# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
db_url = os.environ.get("DATABASE_URL")
if db_url:
    DATABASES = {
        "default": dj_database_url.config(default=db_url, conn_max_age=600)
    }
else:
    # Use MySQL if DB_PASSWORD or non-local DB_HOST is specified, otherwise fallback to SQLite3
    if os.environ.get("DB_PASSWORD") or (os.environ.get("DB_HOST") and os.environ.get("DB_HOST") not in ["localhost", "127.0.0.1"]):
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.mysql",
                "NAME": os.environ.get("DB_NAME", "travels_db"),
                "USER": os.environ.get("DB_USER", "root"),
                "PASSWORD": os.environ.get("DB_PASSWORD", ""),
                "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
                "PORT": os.environ.get("DB_PORT", "3306"),
                "OPTIONS": {
                    "charset": "utf8mb4",
                },
            }
        }
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }



# ==============================================================================
# TEMPLATES & AUTHENTICATION
# ==============================================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==============================================================================
# INTERNATIONALIZATION & STATIC FILES
# ==============================================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==============================================================================
# LOGGING CONFIGURATION FOR PRODUCTION (RENDER)
# ==============================================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if not DEBUG else 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.environ.get('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}