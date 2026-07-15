# -*- coding: utf-8 -*-
"""Guía de inicio de sesión — MARTIN Company"""
from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).resolve().parent / "Guia_Inicio_Sesion_MARTIN.pdf"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
AZUL = (11, 58, 102)
GRIS = (100, 116, 139)
NEGRO = (30, 41, 59)


class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("ArialUni", "", FONT)
        self.add_font("ArialUni", "B", FONT)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("ArialUni", "B", 9)
        self.set_text_color(*AZUL)
        self.cell(0, 8, "MARTIN Company — Guía de acceso", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("ArialUni", "", 8)
        self.set_text_color(*GRIS)
        self.cell(0, 10, f"Página {self.page_no()}  ·  Documento interno de pruebas", align="C")


def build():
    pdf = PDF()
    pdf.set_auto_page_break(True, 18)
    pdf.add_page()

    pdf.set_fill_color(*AZUL)
    pdf.rect(0, 0, 210, 42, "F")
    pdf.set_y(14)
    pdf.set_font("ArialUni", "B", 18)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, "Guía de inicio de sesión", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 11)
    pdf.cell(0, 7, "MARTIN Company — Sistema de producción", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(52)
    pdf.set_text_color(*NEGRO)
    pdf.set_font("ArialUni", "B", 13)
    pdf.cell(0, 8, "1. Cómo ingresar", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 10)
    for line in [
        "1. Abra la página login.html del sistema.",
        "2. Ingrese el correo electrónico del perfil.",
        "3. Ingrese la contraseña correspondiente.",
        "4. Pulse «Iniciar sesión».",
        "5. Según el rol, será dirigid@ a Inicio (supervisora) o a Producción (maquiladora).",
    ]:
        pdf.cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("ArialUni", "B", 13)
    pdf.cell(0, 8, "2. Credenciales de prueba", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 10)
    pdf.multi_cell(0, 5.5, "Use estas cuentas para probar el sistema. Cada una tiene un rol distinto.")
    pdf.ln(2)

    # Table header
    cols = [42, 58, 32, 38]
    headers = ["Nombre", "Correo", "Contraseña", "Rol"]
    pdf.set_font("ArialUni", "B", 9)
    pdf.set_fill_color(*AZUL)
    pdf.set_text_color(255, 255, 255)
    x0 = pdf.get_x()
    for i, h in enumerate(headers):
        pdf.cell(cols[i], 8, h, border=1, fill=True, align="C")
    pdf.ln()

    rows = [
        ["Ana Supervisora", "supervisora@martin.com", "Ana2026", "Supervisora"],
        ["Carlos Maquilador", "maquiladora@martin.com", "Carlos2026", "Maquiladora"],
        ["María Maquiladora Norte", "maria.maquila@martin.com", "Maria2026", "Maquiladora"],
    ]
    pdf.set_font("ArialUni", "", 8.5)
    pdf.set_text_color(*NEGRO)
    for r in rows:
        for i, cell in enumerate(r):
            pdf.cell(cols[i], 9, cell, border=1, align="C" if i > 0 else "L")
        pdf.ln()

    pdf.ln(6)
    pdf.set_x(15)
    pdf.set_font("ArialUni", "B", 13)
    pdf.cell(0, 8, "3. Permisos por rol", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 10)
    pdf.set_x(15)
    pdf.multi_cell(180, 5.5, "Supervisora: Inicio, Inventario, Pedidos, Produccion, Calidad y Reportes.")
    pdf.set_x(15)
    pdf.multi_cell(180, 5.5, "Maquiladora: solo modulo de Produccion (registrar avances de sus ordenes).")

    pdf.ln(4)
    pdf.set_x(15)
    pdf.set_font("ArialUni", "B", 13)
    pdf.cell(0, 8, "4. Notas", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 10)
    pdf.set_x(15)
    pdf.multi_cell(180, 5.5, "- El numero de pedido (PED-001, PED-002...) se genera automaticamente.")
    pdf.set_x(15)
    pdf.multi_cell(180, 5.5, "- No comparta estas contrasenas fuera del entorno de pruebas.")
    pdf.set_x(15)
    pdf.multi_cell(180, 5.5, "- Si cambia el esquema SQL en Supabase, vuelva a cargar martin_company.sql.")

    pdf.output(str(OUT))
    print("OK", OUT)


if __name__ == "__main__":
    build()
