import json
import logging
import re
import time
from typing import Dict, Any, Optional, Tuple
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Production-grade Generative AI Service for DiscoSynth AI.
    Integrates with Google GenAI SDK (google-genai) and Gemini Interactions / Models API.
    Configured for Gemini 3.8 Flash with resilient error handling and structured JSON output.
    """

    PRIMARY_MODEL = "gemini-3.8-flash"
    FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"]

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        self.model_name = settings.GEMINI_MODEL.strip() if settings.GEMINI_MODEL else self.PRIMARY_MODEL
        self._client = None
        self._last_active_model = self.model_name
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY is not configured in backend/.env.")
            self._client = None
            return

        try:
            from google import genai
            from google.genai import types
            self._client = genai.Client(
                api_key=self.api_key,
                http_options=types.HttpOptions(timeout=30000)
            )
            logger.info("Initialized Google GenAI Client with model: %s", self.model_name)
        except Exception as e:
            logger.error("Failed to initialize Google GenAI Client: %s", e)
            self._client = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key != "your_gemini_api_key_here")

    @property
    def active_model(self) -> str:
        return self._last_active_model

    def test_connection(self) -> Tuple[bool, str]:
        """Performs a live connectivity check against the Gemini API."""
        if not self.is_configured():
            return False, "GEMINI_API_KEY is missing or unconfigured in backend/.env"

        try:
            if self._client is None:
                self._init_client()
            if self._client is None:
                return False, "Failed to initialize Google GenAI Client"

            # Quick probe
            res, model_used = self._call_with_resilience(
                prompt='Respond strictly with JSON: {"status": "ok"}',
                system_instruction="You are a health check agent. Respond only with JSON."
            )
            self._last_active_model = model_used
            return True, f"Connected ({model_used})"
        except Exception as e:
            return False, str(e)

    def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes structured JSON generation using Gemini 3.8 Flash.
        Implements resilience against 503 capacity spikes and 429 rate limits.
        Raises descriptive exceptions on failure.
        """
        if not self.is_configured():
            raise ValueError(
                "Gemini API key is not configured. Please supply a valid GEMINI_API_KEY in backend/.env"
            )

        if self._client is None:
            self._init_client()
            if self._client is None:
                raise RuntimeError("Google GenAI client could not be initialized.")

        raw_text, used_model = self._call_with_resilience(prompt, system_instruction)
        self._last_active_model = used_model
        return self._extract_json(raw_text)

    def _call_with_resilience(self, prompt: str, system_instruction: Optional[str] = None) -> Tuple[str, str]:
        """
        Calls Gemini 3.8 Flash with fallback protection.
        Attempts primary model first. If 503 UNAVAILABLE (high demand spike) persists,
        intelligently falls back to active Gemini Flash models so generation never breaks.
        """
        from google.genai import types

        models_queue = [self.model_name]
        for m in self.FALLBACK_MODELS:
            if m not in models_queue:
                models_queue.append(m)

        last_error = None

        for model_candidate in models_queue:
            for attempt in range(2):
                try:
                    logger.info("Calling Gemini API with model: %s (attempt %d)", model_candidate, attempt + 1)
                    
                    config = types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                    )
                    if system_instruction:
                        config.system_instruction = system_instruction

                    response = self._client.models.generate_content(
                        model=model_candidate,
                        contents=prompt,
                        config=config
                    )
                    
                    if response and response.text:
                        logger.info("Successfully received generation from %s", model_candidate)
                        return response.text, model_candidate

                except Exception as e:
                    err_str = str(e)
                    last_error = e
                    logger.warning("Call to %s failed (attempt %d): %s", model_candidate, attempt + 1, err_str[:160])

                    # Handle 400 / 403 - Invalid Key (fatal, no retry)
                    if "400" in err_str and "API_KEY_INVALID" in err_str:
                        raise ValueError("Your GEMINI_API_KEY is invalid. Please verify the key in backend/.env")
                    if "403" in err_str or "PERMISSION_DENIED" in err_str:
                        raise PermissionError(f"Permission denied for Gemini API: {err_str}")

                    # Handle 429 - Rate limit (back off and retry)
                    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                        time.sleep(2.0 * (attempt + 1))
                        continue

                    # Handle 503 or Timeout - High demand spike on gemini-3.8-flash (retry once, then fall back)
                    if "503" in err_str or "UNAVAILABLE" in err_str or "time" in err_str.lower():
                        if attempt == 0:
                            time.sleep(1.0)
                            continue
                        else:
                            break

                    # If model not found (404), break to next candidate
                    if "404" in err_str:
                        break

        raise RuntimeError(
            f"All Gemini models failed to generate content. Last error: {str(last_error)}"
        )

    def _extract_json(self, text: str) -> Any:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as err:
            logger.warning("Standard json.loads failed. Attempting regex extract. Raw text: %s", text[:150])
            match = re.search(r"(\{|\[).+(\}|\])", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
            raise ValueError(f"Gemini output could not be parsed as valid JSON: {text[:200]}...")

gemini_service = GeminiService()
