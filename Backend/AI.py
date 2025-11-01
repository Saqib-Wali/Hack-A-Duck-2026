# AI.py
import os
import json
from typing import Any, Dict, Optional, Callable

from dotenv import load_dotenv
import google.generativeai as genai

# ── Load .env and configure Gemini ──────────────────────────────
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing. Add it to your .env file.")

genai.configure(api_key=API_KEY)
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

model = genai.GenerativeModel(MODEL_NAME)

# ── Import function utilities ───────────────────────────────────
from Functions.GetDatabaseInfo import get_database_info


# ── TOOL REGISTRY ────────────────────────────────────────────────
TOOLS: Dict[str, Callable[..., Any]] = {
    "get_database_info": get_database_info,
}


def list_available_tools() -> Dict[str, Any]:
    """
    Returns a list of available tool names.
    """
    return {"tools": list(TOOLS.keys())}


# ── TEXT GENERATION ─────────────────────────────────────────────
def generate_text(
    prompt: str,
    *,
    temperature: float = 0.2,
    max_output_tokens: int = 1024,
    top_p: float = 0.95,
    top_k: int = 40,
    system_instruction: Optional[str] = None,
) -> str:
    """Simple text generation helper."""
    generation_config = genai.types.GenerationConfig(
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        max_output_tokens=max_output_tokens,
    )

    _model = model
    if system_instruction:
        _model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_instruction,
        )

    resp = _model.generate_content(prompt, generation_config=generation_config)
    return getattr(resp, "text", "") or ""


# ── JSON GENERATION ─────────────────────────────────────────────
def generate_json(
    prompt: str,
    *,
    schema_hint: Optional[Dict[str, Any]] = None,
    temperature: float = 0.1,
    max_output_tokens: int = 1024,
) -> Dict[str, Any]:
    """Ask Gemini to return valid JSON."""
    if schema_hint:
        prompt = (
            f"Return ONLY valid JSON matching this structure (no code fences):\n"
            f"{json.dumps(schema_hint)}\n\n"
            f"Task:\n{prompt}"
        )

    generation_config = genai.types.GenerationConfig(
        temperature=temperature,
        max_output_tokens=max_output_tokens,
        response_mime_type="application/json",
    )

    resp = model.generate_content(prompt, generation_config=generation_config)
    text = getattr(resp, "text", "") or "{}"

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise


# ── FUNCTION CALLING INTERFACE ──────────────────────────────────
def run_ai_tool(tool_name: str, *args, **kwargs) -> Any:
    """
    Executes a tool (function) from the TOOLS registry dynamically.
    Example: run_ai_tool("get_database_info", email="test@example.com")
    """
    if tool_name not in TOOLS:
        return {"error": f"Tool '{tool_name}' not found.", "available": list(TOOLS.keys())}

    try:
        result = TOOLS[tool_name](*args, **kwargs)
        return {"tool": tool_name, "result": result}
    except Exception as e:
        return {"error": str(e), "tool": tool_name}


# ── AI-AWARE DECISION ENGINE (for future) ───────────────────────
def ai_analyze_user(email: str) -> Dict[str, Any]:
    """
    Example of a higher-level AI call that uses Gemini + a backend function.
    Fetches the user's database info, then asks Gemini to summarize advice.
    """
    db_info = get_database_info(email)
    if "error" in db_info:
        return db_info

    # Compose intelligent prompt for Gemini
    prompt = (
        f"Here is a user's financial data:\n{json.dumps(db_info, indent=2)}\n\n"
        "Analyze this and return JSON with three personalized financial improvement tips. "
        "Each tip should have a 'title' and 'advice' field."
    )

    schema = {"tips": [{"title": "string", "advice": "string"}]}
    ai_response = generate_json(prompt, schema_hint=schema)
    return {"analysis": ai_response, "raw_data": db_info}


# ─── Optional: Direct test ──────────────────────────────────────
if __name__ == "__main__":
    print("🔧 Available tools:", list_available_tools())
    # Example usage:
    # print(run_ai_tool("get_database_info", email="test@example.com"))
    # print(ai_analyze_user("test@example.com"))
