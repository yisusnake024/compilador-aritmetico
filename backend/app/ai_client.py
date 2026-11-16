"""
Envoltorio del SDK oficial de Google Gemini (google-genai).

Es el ÚNICO módulo del backend que importa el SDK de IA.
Aplica el timeout y el máximo de tokens configurados.
"""

import os
import concurrent.futures
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()


def generar(system: str, user: str) -> str:
    """
    Genera contenido a partir de los prompts del sistema y usuario.

    Args:
        system: Instrucciones del sistema para el modelo.
        user: Contenido de entrada del usuario.

    Returns:
        str: Texto plano generado por el modelo.

    Raises:
        TimeoutError: Si la petición supera AI_TIMEOUT_SECONDS.
        Exception: Si ocurre un error en el proveedor.
    """
    # Importación aislada dentro del módulo oficial
    from google import genai
    from google.genai import types

    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()

    try:
        timeout = float(os.getenv("AI_TIMEOUT_SECONDS", "30"))
    except ValueError:
        timeout = 30.0

    try:
        max_tokens = int(os.getenv("AI_MAX_TOKENS", "800"))
    except ValueError:
        max_tokens = 800

    def _invocar():
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=max_tokens,
        )
        response = client.models.generate_content(
            model=model,
            contents=user,
            config=config,
        )
        return (response.text or "").strip()

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_invocar)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            raise TimeoutError("Tiempo de espera agotado al consultar la IA.")
        except Exception as e:
            if "timeout" in type(e).__name__.lower():
                raise TimeoutError("Tiempo de espera agotado al consultar la IA.")
            raise

