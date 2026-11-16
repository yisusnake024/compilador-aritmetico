"""
API REST del Simulador de Compilador Aritmético.

Endpoints:
    GET  /api/health   — estado del servicio y disponibilidad de IA
    POST /api/compile  — compilar una fórmula aritmética
    POST /api/feedback — retroalimentación pedagógica con IA
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .compiler import compilar
from .ai_feedback import pedir_retroalimentacion

load_dotenv()

app = FastAPI(
    title="Simulador de Compilador Aritmético",
    description="API para el simulador de compilador de expresiones aritméticas.",
    version="1.0.0",
)

# CORS: permite que el frontend acceda a la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Modelos de entrada ----

class FormulaRequest(BaseModel):
    formula: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Fórmula aritmética a analizar (máximo 100 caracteres).",
    )


# ---- Endpoints ----

@app.get("/")
def root():
    """Ruta raíz amigable para verificar que el backend está activo."""
    return {
        "servicio": "Simulador de Compilador Aritmético API",
        "estado": "activo",
        "salud": "/api/health",
        "documentacion": "/docs",
    }


@app.get("/api/health")
def health():
    """Estado del servicio y disponibilidad de IA."""
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    ia_disponible = bool(api_key and model)

    return {
        "status": "ok",
        "ia_disponible": ia_disponible,
    }


@app.post("/api/compile")
def compile_formula(req: FormulaRequest):
    """Compila una fórmula aritmética y devuelve el resultado fase por fase."""
    return compilar(req.formula)


@app.post("/api/feedback")
def feedback(req: FormulaRequest, request: Request):
    """Genera una explicación pedagógica asistida por IA para la fórmula."""
    cliente_ip = request.client.host if request.client else "127.0.0.1"
    return pedir_retroalimentacion(req.formula, cliente_ip)
