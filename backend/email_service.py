"""
Email sending for Commune, via Resend.

Requires RESEND_API_KEY in the environment (Railway, backend service,
Variables tab). Optional: RESEND_FROM_ADDRESS to override the sender.

Two deliberate changes from the earlier version of this file:

1. The API key is read INSIDE the send call instead of at import time.
   At import time, if the environment is not fully populated yet, the key
   is permanently baked in as None and every send fails before any
   network request is made, which is why Resend showed no activity at all.

2. Every log line uses flush=True. Railway buffers stdout, so a plain
   print() from inside a request handler often never reaches Deploy Logs,
   which makes a real error look like silence.
"""

import os
import resend

# Resend's shared test sender. Works without verifying a domain, BUT on an
# unverified account Resend only delivers to the email address the Resend
# account itself was registered with. Any other recipient is rejected.
# Set RESEND_FROM_ADDRESS once a real domain is verified.
DEFAULT_FROM_ADDRESS = "Commune <onboarding@resend.dev>"


def _log(message):
    print(f"[email] {message}", flush=True)


def get_from_address():
    return os.getenv("RESEND_FROM_ADDRESS", DEFAULT_FROM_ADDRESS)


def send_email(to_email: str, subject: str, html: str):
    """
    Sends one email. Raises on any failure so the caller decides what to do
    with it.
    """
    api_key = os.getenv("RESEND_API_KEY")

    if not api_key:
        raise RuntimeError(
            "RESEND_API_KEY is not set in this process's environment. "
            "Add it in Railway under the backend service's Variables tab, "
            "then confirm a deploy finished after saving it."
        )

    resend.api_key = api_key

    params = {
        "from": get_from_address(),
        "to": [to_email],
        "subject": subject,
        "html": html,
    }

    _log(f"sending '{subject}' to {to_email} from {params['from']}")
    response = resend.Emails.send(params)
    _log(f"resend accepted the request, response: {response}")
    return response


def build_reset_html(first_name: str, reset_url: str) -> str:
    return f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4a1420;">Reset your password</h2>
          <p>Hi {first_name},</p>
          <p>
            We received a request to reset your Commune password. Use the
            button below to choose a new one. This link expires in 30 minutes.
          </p>
          <p style="margin: 32px 0;">
            <a href="{reset_url}"
               style="background-color: #8b6914; color: #ffffff; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 500;
                      display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666666; font-size: 13px;">
            If you did not request this, you can safely ignore this email.
            Your password will not be changed.
          </p>
          <p style="color: #999999; font-size: 12px; word-break: break-all;">
            If the button does not work, paste this into your browser:<br />
            {reset_url}
          </p>
        </div>
    """


def send_password_reset_email(to_email: str, first_name: str, reset_url: str):
    """
    Same name and signature as before, so auth_routes.py calls it unchanged.
    """
    return send_email(
        to_email=to_email,
        subject="Reset your Commune password",
        html=build_reset_html(first_name, reset_url),
    )