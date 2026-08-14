"""
Temporary diagnostic router for the password reset email problem.

Goes at backend/routers/debug_routes.py

Earlier version returned 404 on a bad token, which made "token is wrong"
indistinguishable from "route was never registered". This version answers
that question directly with /debug/ping, which needs no token.

DELETE THIS FILE, its import, and its include_router line in main.py once
the email issue is solved. It is a debugging tool, not a feature.
"""

import os
import traceback

from fastapi import APIRouter, HTTPException, Query

import email_service

router = APIRouter(prefix="/debug", tags=["debug"])


def _require_token(token):
    expected = os.getenv("DEBUG_TOKEN")

    if not expected:
        raise HTTPException(
            status_code=403,
            detail="DEBUG_TOKEN is not set in this process's environment. "
                   "Add it in Railway under the backend service Variables "
                   "tab and wait for the redeploy to finish.",
        )

    if token != expected:
        raise HTTPException(
            status_code=403,
            detail="Token does not match the DEBUG_TOKEN value this process "
                   "has loaded. Check for typos or a stale deploy.",
        )


@router.get("/ping")
def ping():
    """
    No token required. Reveals nothing sensitive. If this returns 404, the
    router is not registered or the deploy did not happen. If it returns
    JSON, the router is live and any 403 elsewhere is purely about the token.
    """
    return {
        "router": "registered",
        "debug_token_set": bool(os.getenv("DEBUG_TOKEN")),
        "resend_api_key_set": bool(os.getenv("RESEND_API_KEY")),
        "frontend_url_set": bool(os.getenv("FRONTEND_URL")),
    }


@router.get("/email-config")
def email_config(token: str = Query(...)):
    """
    Reports what the RUNNING process actually sees. A variable saved in the
    Railway dashboard but never picked up by a redeploy shows as absent here.

    Never returns the full API key, only its length and first few characters.
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
    exception, traceback included, so the error arrives in the browser
    instead of vanishing into buffered logs.
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