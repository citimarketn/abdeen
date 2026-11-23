# -*- coding: utf-8 -*-
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

from flask import Flask, request, jsonify

app = Flask(__name__)

GMAIL_USER = os.environ.get("GMAIL_USER", "")
GMAIL_APP_PASS = os.environ.get("GMAIL_APP_PASS", "")
MAIL_SECRET = os.environ.get("MAIL_SECRET", "abdeen-mail-secret")
FROM_NAME = "عابدين"


@app.route("/send", methods=["POST"])
def send():
    if request.headers.get("X-Abdeen-Key") != MAIL_SECRET:
        return jsonify(ok=False, error="unauthorized"), 401
    d = request.get_json(silent=True) or {}
    to = (d.get("to") or "").strip()
    subject = d.get("subject") or "رسالة من عابدين"
    html = d.get("html") or ""
    if not to or "@" not in to:
        return jsonify(ok=False, error="invalid recipient"), 400
    if not GMAIL_USER or not GMAIL_APP_PASS:
        return jsonify(ok=False, error="Gmail not configured"), 500

    msg = MIMEMultipart("alternative")
    msg["From"] = formataddr((FROM_NAME, GMAIL_USER))
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(GMAIL_USER, GMAIL_APP_PASS)
            s.sendmail(GMAIL_USER, [to], msg.as_string())
    except Exception as e:  # noqa: BLE001
        return jsonify(ok=False, error=str(e)), 502
    return jsonify(ok=True, to=to)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify(ok=True, service="abdeen-mail")