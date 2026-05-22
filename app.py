"""
app.py
Main entry point for the Flask application.
"""

import sys
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf-16'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes import bp

# ── Setup ─────────────────────────────────────────────────────────────────────
# Load .env (override allows dynamic re-loading over existing OS variables)
load_dotenv(override=True)

app = Flask(__name__, static_folder=".", static_url_path="/_static_")
CORS(app)

# Register the routes blueprint
app.register_blueprint(bp)

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    key = os.environ.get("GROQ_API_KEY", "")
    if not key or key == "your_groq_api_key_here":
        print("\n" + "="*60)
        print("  [!] ACTION REQUIRED")
        print("  Open .env and replace 'your_groq_api_key_here'")
        print("  with your free Groq API key from:")
        print("  --> https://console.groq.com/keys")
        print("="*60 + "\n")
    else:
        print(f"\n[OK] Groq API key loaded (...{key[-6:]})")

    print("[*] CompeteIQ running --> http://127.0.0.1:5000\n")
    app.run(debug=True, host="127.0.0.1", port=5000)
