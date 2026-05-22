"""
routes.py
Registers the Flask routes and connects them with the Groq service.
"""

import os
import json
from flask import Blueprint, request, jsonify, send_from_directory
from groq_service import perform_swot_analysis

bp = Blueprint("main", __name__)

# ── Serve frontend ────────────────────────────────────────────────────────────
@bp.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@bp.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

# ── Health check ──────────────────────────────────────────────────────────────
@bp.route("/api/health", methods=["GET"])
def health():
    key = os.environ.get("GROQ_API_KEY", "")
    key_configured = bool(key) and key != "your_groq_api_key_here"
    return jsonify({"status": "ok", "key_configured": key_configured})

# ── Main Analysis Endpoint ────────────────────────────────────────────────────
@bp.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    company_a = (data.get("company_a") or "").strip()
    company_b = (data.get("company_b") or "").strip()

    if not company_a or not company_b:
        return jsonify({"error": "Both company names are required."}), 400

    try:
        # Call the service layer
        result = perform_swot_analysis(company_a, company_b)
        return jsonify(result)

    except json.JSONDecodeError as e:
        print("[!] JSON Decode Error:", str(e))
        return jsonify({"error": f"AI returned invalid JSON: {e}"}), 500
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        msg = str(e)
        if "401" in msg or "invalid_api_key" in msg.lower():
            return jsonify({"error": "Invalid Groq API key. Check your .env file."}), 401
        if "rate_limit" in msg.lower():
            return jsonify({"error": "Groq rate limit reached. Please wait a moment and retry."}), 429
        return jsonify({"error": f"Groq error: {msg}"}), 500
