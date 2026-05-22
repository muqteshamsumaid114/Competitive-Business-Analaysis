# CompeteIQ — AI-Powered Competitive Business Analysis

> Instantly generate side-by-side SWOT analyses for any two companies, powered by **Groq AI** (LLaMA 3.3 70B) and a lightweight **Flask** backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [License](#license)

---

## Overview

**CompeteIQ** is a full-stack web application that performs detailed competitive SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses by comparing any two companies. Enter two company names, hit **Analyze**, and get a structured, AI-generated strategic breakdown in seconds — complete with a strategic verdict and copy-to-clipboard export.

---

## Features

- ⚡ **Blazing-fast analysis** — Groq's inference engine delivers results in seconds
- 🧠 **LLaMA 3.3 70B model** — Concrete, specific insights (not generic AI filler)
- 📊 **Side-by-side SWOT layout** — Strengths, Weaknesses, Opportunities, and Threats for both companies
- 🏆 **Strategic Verdict** — A 3–5 sentence data-driven summary of which company holds the advantage
- 📋 **One-click copy** — Export the full analysis as formatted plain text
- 🔄 **Suggestion chips** — Pre-filled company pairs for quick demos
- 🟢 **Live server status indicator** — Shows whether Groq API key is configured and server is online

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3, Flask 3, Flask-CORS       |
| AI        | Groq API — LLaMA 3.3 70B Versatile  |
| Frontend  | Vanilla HTML / CSS / JavaScript     |
| Config    | python-dotenv                       |

---

## Project Structure

```
Competitive-Business-Analysis/
│
├── app.py              # Flask app entry point; registers blueprint, loads .env
├── routes.py           # URL routes: serves frontend, /api/health, /api/analyze
├── groq_service.py     # Groq API client & SWOT prompt logic
│
├── index.html          # Single-page frontend UI
├── styles.css          # Application styles
├── app.js              # Frontend logic (API calls, rendering, clipboard)
│
└── requirements.txt    # Python dependencies
```

---

## Getting Started

### Prerequisites

- Python **3.8+**
- A free **Groq API key** → [https://console.groq.com/keys](https://console.groq.com/keys)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/muqteshamsumaid114/Competitive-Business-Analaysis.git
cd Competitive-Business-Analaysis

# 2. (Recommended) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> Replace `your_groq_api_key_here` with your actual key from [console.groq.com/keys](https://console.groq.com/keys). The app will warn you on startup if the key is missing or placeholder.

### Running the App

```bash
python app.py
```

Open your browser at **http://127.0.0.1:5000**

The terminal will confirm:
```
[OK] Groq API key loaded (...xxxxxx)
[*] CompeteIQ running --> http://127.0.0.1:5000
```

---

## API Reference

### `GET /api/health`

Returns server and API key status.

**Response:**
```json
{
  "status": "ok",
  "key_configured": true
}
```

---

### `POST /api/analyze`

Runs a SWOT analysis comparing two companies.

**Request Body:**
```json
{
  "company_a": "Apple",
  "company_b": "Samsung"
}
```

**Success Response (200):**
```json
{
  "company_a": "Apple",
  "company_b": "Samsung",
  "strengths":     { "company_a": [...], "company_b": [...] },
  "weaknesses":    { "company_a": [...], "company_b": [...] },
  "opportunities": { "company_a": [...], "company_b": [...] },
  "threats":       { "company_a": [...], "company_b": [...] },
  "verdict": "Strategic summary...",
  "elapsed_seconds": 2.14,
  "model": "llama-3.3-70b-versatile"
}
```

**Error Responses:**

| Status | Cause                             |
|--------|-----------------------------------|
| 400    | Missing company name(s)           |
| 401    | Invalid Groq API key              |
| 429    | Groq rate limit reached           |
| 500    | AI returned invalid JSON or crash |

---

## How It Works

1. The user enters two company names in the browser.
2. The frontend (`app.js`) sends a `POST` request to `/api/analyze`.
3. `routes.py` validates the input and calls `groq_service.perform_swot_analysis()`.
4. `groq_service.py` builds a structured prompt and sends it to Groq's API using the **LLaMA 3.3 70B Versatile** model with `response_format: json_object` enforced.
5. The JSON response is parsed, enriched with timing metadata, and returned to the frontend.
6. `app.js` renders the SWOT grid and verdict with staggered animations.

---

## Usage

1. Type two company names (e.g., `Tesla` and `Rivian`) **or** click a suggestion chip.
2. Press **Analyze** or hit **Enter**.
3. Review the SWOT grid and strategic verdict.
4. Click **Copy Analysis** to export as formatted text.
5. Click **New Analysis** to reset and start over.

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

> Built with 🤖 Groq AI + 🐍 Flask + ❤️ by [muqteshamsumaid114](https://github.com/muqteshamsumaid114)