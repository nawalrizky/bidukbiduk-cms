# Backend CORS Configuration for Video Uploads

## Problem
Video uploads are failing with CORS error while image uploads work fine. This happens because:
1. Video files are larger and take longer to upload
2. Backend/Nginx timeout is too short for large files
3. CORS preflight (OPTIONS) request times out before upload completes

## Required Backend Fixes

### 1. Django CORS Settings (settings.py)

```python
# Install django-cors-headers if not installed
# pip install django-cors-headers

INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this at the TOP
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# File Upload Settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
```

### 2. Nginx Configuration

Add this to your Nginx config for `backend.bidukbiduk.com`:

```nginx
server {
    listen 80;
    server_name backend.bidukbiduk.com;

    # Increase timeout for large uploads
    client_max_body_size 100M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    # CORS headers for all requests
    add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;  # Your Django app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase buffer sizes for large uploads
        proxy_buffering off;
        proxy_request_buffering off;
    }

    location /media/ {
        alias /path/to/your/media/files/;
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    location /static/ {
        alias /path/to/your/static/files/;
    }
}
```

### 3. Gunicorn Configuration (if using Gunicorn)

Create/update `gunicorn.conf.py`:

```python
# gunicorn.conf.py
timeout = 300  # 5 minutes
graceful_timeout = 300
keepalive = 5
workers = 4
worker_class = 'sync'
max_requests = 1000
max_requests_jitter = 50
```

Run with:
```bash
gunicorn --config gunicorn.conf.py your_project.wsgi:application
```

### 4. Test Commands

After making changes:

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Django/Gunicorn
sudo systemctl restart gunicorn  # or your service name

# Check Nginx errors
sudo tail -f /var/log/nginx/error.log

# Check Django logs
tail -f /path/to/django/logs/error.log
```

### 5. Production CORS Settings

For production, update `CORS_ALLOWED_ORIGINS` to include your production domain:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-cms.bidukbiduk.com",  # Your production CMS domain
]
```

## Testing

1. Try uploading a small image (should work)
2. Try uploading a small video (< 5MB)
3. Try uploading a large video (10-20MB)
4. Check browser console for detailed error messages
5. Check Nginx/Django logs for backend errors

## Common Issues

### Issue: "413 Request Entity Too Large"
**Solution**: Increase `client_max_body_size` in Nginx

### Issue: "504 Gateway Timeout"
**Solution**: Increase timeout values in both Nginx and Gunicorn

### Issue: Still getting CORS errors after config
**Solution**: Clear browser cache, restart Nginx completely:
```bash
sudo nginx -t  # Test config
sudo systemctl stop nginx
sudo systemctl start nginx
```

### Issue: Video uploads fail but images work
**Solution**: This is likely a timeout issue. Videos take longer to upload. Check:
1. Nginx timeout settings
2. Gunicorn timeout settings
3. Browser console for exact error
