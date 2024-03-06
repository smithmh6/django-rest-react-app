import logging, json
from django.utils import timezone

def log_request_as_json(request, response, location=None):
    logger = logging.getLogger('json-logger')
    obj_to_log = {
        "timestamp": str(timezone.now()),
        "request": {
            "user": request.user.username,
            "method": request.method,
            "endpoint": request.path,
            "data": request.data,
        },
        "response": {
            "status": response.status_code,
            "data": response.data
        },
        "location": location
    }
    logger.warning(json.dumps(obj_to_log, indent=2))

def log_request_as_common(request, response):
    logger = logging.getLogger('common-logger')
    ip_addr = request.META.get('REMOTE_ADDR')
    user = request.user.username
    timestamp = timezone.now()
    method = request.method
    path = request.path
    protocol = request.META.get('SERVER_PROTOCOL')
    size = request.META.get('CONTENT_LENGTH')
    status = response.status_code
    logger.info(f"{ip_addr} - {user} [{timestamp}] \"{method} {path} {protocol}\" {status} {size}")

def logging_decorator(view_function):
    def log_wrapper(self, request, *args, **kwargs):
        response = view_function(self, request, *args, **kwargs)
        log_request_as_common(request, response)
        if (response.status_code >= 400):
            log_request_as_json(request, response, location=view_function.__qualname__)
        return response
    return log_wrapper