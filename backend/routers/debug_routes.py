"""
Temporary diagnostic router for the password reset email problem.

Goes at backend/routers/debug_routes.py

Gated behind a DEBUG_TOKEN environment variable. If DEBUG_TOKEN is not set,
or the supplied token does not match, both routes return 404 rather than 403
so the endpoints are not discoverable by probing.

DELETE THIS FILE and its include_router line once the email issue is solved.
It is a debugging tool, not a feature.
"""

import os
import traceback

from fastapi import APIRouter, HTTPException, Query

import email_service

router = APIRouter(prefix="/debug", tags=["debug"])


def _require_token(token):
    expected = os.getenv("DEBUG_TOKEN")
    if not expected or token != expected:
        raise HTTPException(status_code=404, detail="Not Found")


@router.get("/email-config")
def email_config(token: str = Query(...)):
    """
    Reports what the RUNNING process actually sees, which is the thing that
    matters. A variable saved in the Railway dashboard but never picked up
    by a redeploy will show as absent here.

    Never returns the full API key, only its length and first few characters,
    so this is safe to read on a screen or paste back into a chat.
    """
    _require_token(token)

    api_key = os.getenv("RESEND_API_KEY")

    try:
        import resend
        resend_version = getattr(resend, "__version__", "unknown")
        resend_importable = True
    except Exception as e:
        resend_version = f"import failed: {e}"
        resend_importable = False

    return {
        "resend_api_key_present": bool(api_key),
        "resend_api_key_length": len(api_key) if api_key else 0,
        "resend_api_key_prefix": (api_key[:5] + "...") if api_key else None,
        "resend_api_key_looks_valid": bool(api_key) and api_key.startswith("re_"),
        "from_address": email_service.get_from_address(),
        "frontend_url": os.getenv("FRONTEND_URL"),
        "resend_importable": resend_importable,
        "resend_version": resend_version,
    }


@router.get("/email-test")
def email_test(to: str = Query(...), token: str = Query(...)):
    """
    Attempts a real send and returns the actual result or the actual
    exception, including a traceback. This is the whole point: the error
    comes back in the browser instead of vanishing into buffered logs.
    """
    _require_token(token)

    try:
        response = email_service.send_email(
            to_email=to,
            subject="Commune test email",
            html="<p>This is a test send from Commune. If you are reading "
                 "this, the email pipeline works.</p>",
        )
        return {
            "ok": True,
            "sent_to": to,
            "from_address": email_service.get_from_address(),
            "response": str(response),
        }
    except Exception as e:
        return {
            "ok": False,
            "sent_to": to,
            "from_address": email_service.get_from_address(),
            "error_type": type(e).__name__,
            "error": str(e),
            "traceback": traceback.format_exc(),
        }
