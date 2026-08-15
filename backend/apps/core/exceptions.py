import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def _normalise_field_errors(detail):
    """Convert DRF error detail into a flat field->messages mapping."""
    field_errors = {}
    errors = []

    if isinstance(detail, dict):
        for field, value in detail.items():
            if isinstance(value, list):
                messages = [str(item) for item in value]
            else:
                messages = [str(value)]
            field_errors[field] = messages
            errors.extend(
                {"field": field, "code": "invalid", "message": msg} for msg in messages
            )
    elif isinstance(detail, list):
        for item in detail:
            nested_field_errors, nested_errors = _normalise_field_errors(item)
            field_errors.update(nested_field_errors)
            errors.extend(nested_errors)
    else:
        errors.append({"field": None, "code": "invalid", "message": str(detail)})

    return field_errors, errors


def api_exception_handler(exc, context):
    """Return a consistent error envelope for all API errors."""
    response = drf_exception_handler(exc, context)

    if response is None:
        if isinstance(exc, DjangoPermissionDenied):
            return Response(
                {
                    "code": "permission_denied",
                    "message": "You do not have permission to perform this action.",
                    "fieldErrors": {},
                    "errors": [],
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        if isinstance(exc, Http404):
            return Response(
                {
                    "code": "not_found",
                    "message": "The requested resource was not found.",
                    "fieldErrors": {},
                    "errors": [],
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        logger.exception("Unhandled exception in API view", exc_info=exc)
        return Response(
            {
                "code": "server_error",
                "message": "An unexpected error occurred. Please try again.",
                "fieldErrors": {},
                "errors": [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data

    if isinstance(exc, exceptions.ValidationError):
        field_errors, errors = _normalise_field_errors(detail)
        response.data = {
            "code": "validation_error",
            "message": "Please fix the highlighted fields and try again.",
            "fieldErrors": field_errors,
            "errors": errors,
        }
        return response

    if isinstance(exc, exceptions.AuthenticationFailed):
        response.data = {
            "code": "invalid_credentials",
            "message": str(detail),
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.NotAuthenticated):
        response.data = {
            "code": "unauthenticated",
            "message": "Authentication credentials were not provided.",
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.PermissionDenied):
        response.data = {
            "code": "permission_denied",
            "message": str(detail),
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.NotFound):
        response.data = {
            "code": "not_found",
            "message": str(detail),
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.Throttled):
        wait = exc.wait
        message = f"Too many requests. Please try again in {wait} seconds." if wait else "Too many requests."
        response.data = {
            "code": "rate_limited",
            "message": message,
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.MethodNotAllowed):
        response.data = {
            "code": "method_not_allowed",
            "message": str(detail),
            "fieldErrors": {},
            "errors": [],
        }
        return response

    if isinstance(exc, exceptions.APIException):
        response.data = {
            "code": getattr(exc, "default_code", "error"),
            "message": str(detail),
            "fieldErrors": {},
            "errors": [],
        }
        return response

    return response
