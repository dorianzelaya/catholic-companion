import os
import traceback

from fastapi import APIRouter, Query

import email_service

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/env")
def env():
    names = sorted(os.environ.keys())
    return {
        "total_variables": len(names),
        "variable_names": names,
        "resend_api_key_present": "RESEND_API_KEY" in os.environ,
        "frontend_url_present": "FRONTEND_URL" in os.environ,
    }


@router.get("/email-config")
def email_config():
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
        "resend_api_key_starts_with_re": bool(api_key) and api_key.startswith("re_"),
        "from_address": email_service.get_from_address(),
        "frontend_url": os.getenv("FRONTEND_URL"),
        "resend_importable": resend_importable,
        "resend_version": resend_version,
    }


@router.get("/email-test")
def email_test(to: str = Query(...)):
    try:
        response = email_service.send_email(
            to_email=to,
            subject="Commune test email",
            html="<p>Test send from Commune.</p>",
        )
        return {"ok": True, "sent_to": to,
                "from_address": email_service.get_from_address(),
                "response": str(response)}
    except Exception as e:
        return {"ok": False, "sent_to": to,
                "from_address": email_service.get_from_address(),
                "error_type": type(e).__name__,
                "error": str(e),
                "traceback": traceback.format_exc()}
