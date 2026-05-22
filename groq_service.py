"""
groq_service.py
Handles all communication with the Groq API.
"""

import os
import json
import time
from dotenv import load_dotenv

def get_groq_client():
    """Create Groq client lazily so startup never crashes on missing/bad key."""
    from groq import Groq
    load_dotenv(override=True)
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key or api_key == "your_groq_api_key_here":
        return None, "GROQ_API_KEY is not set in your .env file."
    try:
        client = Groq(api_key=api_key)
        return client, None
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, str(e)


def perform_swot_analysis(company_a, company_b):
    """Calls Groq API to perform the SWOT analysis and returns parsed JSON."""
    client, err = get_groq_client()
    if err:
        raise Exception(err)

    prompt = f"""You are an expert business analyst. Perform a detailed competitive SWOT analysis comparing "{company_a}" and "{company_b}".

Return ONLY a valid JSON object (no markdown, no extra text) with exactly this structure:
{{
  "company_a": "{company_a}",
  "company_b": "{company_b}",
  "strengths": {{
    "company_a": ["point 1", "point 2", "point 3", "point 4", "point 5"],
    "company_b": ["point 1", "point 2", "point 3", "point 4", "point 5"]
  }},
  "weaknesses": {{
    "company_a": ["point 1", "point 2", "point 3", "point 4"],
    "company_b": ["point 1", "point 2", "point 3", "point 4"]
  }},
  "opportunities": {{
    "company_a": ["point 1", "point 2", "point 3", "point 4"],
    "company_b": ["point 1", "point 2", "point 3", "point 4"]
  }},
  "threats": {{
    "company_a": ["point 1", "point 2", "point 3", "point 4"],
    "company_b": ["point 1", "point 2", "point 3", "point 4"]
  }},
  "verdict": "A 3-5 sentence strategic summary comparing both companies, highlighting which is stronger and why."
}}

Rules:
- Each point must be concrete, specific, and insightful — not generic.
- Reference real products, markets, technologies, or events where relevant.
- The verdict must be balanced, data-driven, and actionable.
- Return ONLY the raw JSON object — no markdown fences, no extra text.
"""

    start_time = time.time()
    
    completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert business strategy analyst. Always respond with valid JSON only, no markdown.",
            },
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.6,
        max_tokens=2048,
        response_format={"type": "json_object"},
    )

    elapsed = round(time.time() - start_time, 2)
    raw = completion.choices[0].message.content
    
    # Parse the response to ensure valid JSON before returning it to the route
    result = json.loads(raw)
    result["elapsed_seconds"] = elapsed
    result["model"] = "llama-3.3-70b-versatile"
    
    return result
