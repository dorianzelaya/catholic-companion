"""
Thin wrapper around Resend for sending the password reset email.
Requires RESEND_API_KEY in the environment (Railway → backend service →
Variables). Sign up at resend.com, create an API key, add it there.

resend's sandbox/test sending domain works without verifying a custom
domain — fine for this app's scale. If email delivery ever needs a
custom "from" domain (e.g. noreply@yourdomain.com), that requires
verifying the domain in the Resend dashboard first.
"""
import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

# Resend's default sending address works without domain verification.
# Swap this for a verified custom domain address later if you set one up.
FROM_ADDRESS = "Commune <onboarding@resend.dev>"


def send_password_reset_email(to_email: str, first_name: str, reset_url: str):
    """
    Sends the password reset email. Raises on failure — the caller
    decides whether to surface that to the user or swallow it (we
    swallow it, see the route, so as not to reveal whether an email
    exists in the system).
    """
    resend.Emails.send({
        "from": FROM_ADDRESS,
        "to": [to_email],
        "subject": "Reset your Commune password",
        "html": f"""
            <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #4a1420;">Reset your password</h2>
              <p>Hi {first_name},</p>
              <p>We received a request to reset your Commune password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
              <p style="margin: 32px 0;">
                <a href="{reset_url}"
                   style="background-color: #8b6914; color: #ffffff; padding: 12px 24px;
                          border-radius: 8px; text-decoration: none; font-weight: 500;">
                  Reset Password
                </a>
              </p>
              <p style="color: #666; font-size: 13px;">
                If you didn't request this, you can safely ignore this email —
                your password will not be changed.
              </p>
            </div>
        """,
    })