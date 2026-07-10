# -*- coding: utf-8 -*-
"""Genera reporte PDF: MARTIN Company — Antes vs Ahora"""
from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).resolve().parent / "Reporte_MARTIN_Antes_vs_Ahora.pdf"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

AZUL = (0, 59, 115)
AZUL_CLARO = (0, 85, 165)
VERDE = (26, 157, 92)
GRIS = (100, 116, 139)
NEGRO = (30, 41, 59)


class PDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.add_font("ArialUni", "", FONT)
        self.add_font("ArialUni", "B", FONT)
        self.add_font("ArialUni", "I", FONT)
        self.add_font("ArialUni", "BI", FONT)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("ArialUni", "B", 9)
        self.set_text_color(*AZUL)
        self.cell(0, 8, "MARTIN Company  |  Informe de evolución del sistema", align="L", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*AZUL_CLARO)
        self.set_line_width(0.3)
        self.line(15, 14, 195, 14)
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("ArialUni", "I", 8)
        self.set_text_color(*GRIS)
        self.cell(0, 10, f"Página {self.page_no()}/{{nb}}  ·  Tesis CAMI Salesiana  ·  Julio 2026", align="C")

    def h1(self, text):
        self.set_font("ArialUni", "B", 16)
        self.set_text_color(*AZUL)
        self.multi_cell(0, 9, text)
        self.ln(2)

    def h2(self, text):
        self.set_font("ArialUni", "B", 13)
        self.set_text_color(*AZUL_CLARO)
        self.multi_cell(0, 8, text)
        self.ln(1)

    def h3(self, text):
        self.set_font("ArialUni", "B", 11)
        self.set_text_color(*AZUL)
        self.multi_cell(0, 7, text)
        self.ln(1)

    def body(self, text):
        self.set_font("ArialUni", "", 10)
        self.set_text_color(*NEGRO)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.set_font("ArialUni", "", 10)
        self.set_text_color(*NEGRO)
        self.cell(6, 5.5, "•")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)

    def box(self, title, lines, color=AZUL):
        self.set_x(self.l_margin)
        y0 = self.get_y()
        self.set_font("ArialUni", "B", 10)
        self.set_text_color(*color)
        self.multi_cell(0, 7, title)
        self.set_font("ArialUni", "", 9)
        self.set_text_color(*NEGRO)
        for line in lines:
            self.set_x(self.l_margin + 3)
            self.multi_cell(self.epw - 3, 5, line)
        y1 = self.get_y()
        self.set_draw_color(*color)
        self.set_line_width(1.2)
        self.line(self.l_margin, y0, self.l_margin, y1)
        self.set_line_width(0.2)
        self.set_x(self.l_margin)
        self.ln(3)

    def table_row(self, cols, widths, header=False):
        max_h = 7
        for i, c in enumerate(cols):
            lines = self.multi_cell(widths[i], 7, str(c), dry_run=True, output="LINES")
            max_h = max(max_h, len(lines) * 4.8)
        x0, y0 = self.get_x(), self.get_y()
        if y0 + max_h > 270:
            self.add_page()
            x0, y0 = self.get_x(), self.get_y()
        for i, c in enumerate(cols):
            self.set_xy(x0 + sum(widths[:i]), y0)
            self.set_draw_color(200, 200, 200)
            if header:
                self.set_fill_color(*AZUL)
                self.set_text_color(255, 255, 255)
                self.set_font("ArialUni", "B", 8.5)
            else:
                self.set_fill_color(248, 250, 252)
                self.set_text_color(*NEGRO)
                self.set_font("ArialUni", "", 8.5)
            self.rect(x0 + sum(widths[:i]), y0, widths[i], max_h, style="DF" if header else "D")
            self.set_xy(x0 + sum(widths[:i]) + 1, y0 + 1.2)
            self.multi_cell(widths[i] - 2, 4.5, str(c))
        self.set_y(y0 + max_h)

    def draw_arch_box(self, x, y, w, h, title, subtitle="", fill=(232, 244, 252)):
        self.set_fill_color(*fill)
        self.set_draw_color(*AZUL)
        self.set_line_width(0.4)
        self.rect(x, y, w, h, style="DF")
        self.set_xy(x + 2, y + 3)
        self.set_font("ArialUni", "B", 8)
        self.set_text_color(*AZUL)
        self.cell(w - 4, 4, title, align="C")
        if subtitle:
            self.set_xy(x + 2, y + 8)
            self.set_font("ArialUni", "", 7)
            self.set_text_color(*GRIS)
            self.multi_cell(w - 4, 3.5, subtitle, align="C")

    def arrow_down(self, x, y1, y2):
        self.set_draw_color(*AZUL_CLARO)
        self.set_line_width(0.5)
        self.line(x, y1, x, y2)
        self.line(x, y2, x - 2, y2 - 3)
        self.line(x, y2, x + 2, y2 - 3)


def build():
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(15, 18, 15)

    # PORTADA
    pdf.add_page()
    pdf.set_fill_color(*AZUL)
    pdf.rect(0, 0, 210, 55, style="F")
    pdf.set_y(18)
    pdf.set_font("ArialUni", "B", 22)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, "MARTIN Company", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 12)
    pdf.cell(0, 7, "Sistema de Gestión de Producción de Uniformes Médicos", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(28)
    pdf.set_text_color(*AZUL)
    pdf.set_font("ArialUni", "B", 18)
    pdf.cell(0, 10, "Informe técnico: Antes vs Ahora", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 11)
    pdf.set_text_color(*NEGRO)
    pdf.ln(4)
    pdf.multi_cell(
        0, 6,
        "Evolución del sistema: del modelo plano a un esquema relacional en PostgreSQL "
        "(Supabase), con API REST/RPC, flujo de producción completo, roles, calidad y "
        "capa de demostración mock.",
        align="C",
    )
    pdf.ln(16)
    pdf.set_font("ArialUni", "", 10)
    pdf.set_text_color(*GRIS)
    for line in [
        "Proyecto: tesis-cami-salesiana",
        "Fecha: Julio 2026",
        "Alcance: arquitectura, flujo operativo, base de datos y UX",
    ]:
        pdf.cell(0, 6, line, align="C", new_x="LMARGIN", new_y="NEXT")

    # 1
    pdf.add_page()
    pdf.h1("1. Resumen ejecutivo")
    pdf.body(
        "El sistema MARTIN Company pasó de un inventario/pedidos con tablas planas y estados "
        "básicos a una arquitectura v2 centrada en PostgreSQL hospedado en Supabase. La "
        "aplicación web (HTML/CSS/JS) consume la API de Supabase (PostgREST + RPC) para "
        "persistir y orquestar el flujo: pedido → verificación de stock → compra (si falta "
        "materia) → orden de producción → avances → control de calidad (10 criterios) → entrega."
    )
    pdf.body(
        "Además se incorporó un modo mock en JavaScript para demos sin depender del SQL, "
        "mensajes toast en lugar de alertas nativas, y botones de acción con diseño por contexto."
    )
    pdf.h3("Objetivos del rediseño")
    for t in [
        "Modelar el negocio real (variantes producto+color+talla, recetas, maquiladoras).",
        "Garantizar integridad referencial y reglas de negocio en la base de datos (funciones SQL).",
        "Separar roles: supervisora vs maquiladora.",
        "Cubrir el ciclo completo hasta calidad y entrega, con KPIs.",
        "Facilitar pruebas y presentación (seed SQL + mock JS).",
    ]:
        pdf.bullet(t)

    # 2
    pdf.h1("2. Qué se analizó")
    pdf.body("Antes de rediseñar se revisaron estos puntos del sistema anterior y del dominio:")
    for t in [
        "Tablas planas (producto/talla/color como texto libre) que generaban duplicados.",
        "Estados de pedido limitados (pendiente / en_proceso / completado), insuficientes.",
        "Ausencia de órdenes de producción, avances, alertas de retraso e inspección de calidad.",
        "Inventario sin receta (metros por talla) ni descuento automático de materia/suministros.",
        "Sin perfiles/roles: cualquier usuario veía todo el sistema.",
        "Documentación de negocio (Excel de stock/recetas y Word de criterios) no reflejada en el modelo.",
        "Dependencia de alert() nativo y botones sin semántica visual en tablas.",
    ]:
        pdf.bullet(t)

    pdf.h3("Fuentes de análisis")
    pdf.bullet("Esquema SQL v1: productos_terminados, productos_proceso, stock_disponible, pedidos planos.")
    pdf.bullet("Módulos JS previos: inventario, pedidos, reportes con CRUD básico vía Supabase.")
    pdf.bullet("Requisitos de flujo: stock insuficiente → compra; stock OK → OP; avance 100% → calidad; aprobado → entrega.")
    pdf.bullet("Criterios de calidad (10 parámetros con criticidad Alta/Media/Baja).")

    # 3
    pdf.add_page()
    pdf.h1("3. Cambios: antes vs ahora")
    pdf.h2("3.1 Comparación general")
    w = [45, 67, 68]
    pdf.table_row(["Aspecto", "ANTES (v1)", "AHORA (v2)"], w, header=True)
    for r in [
        ["Modelo de datos", "Tablas planas, textos libres", "Esquema relacional normalizado"],
        ["Producto", "Texto producto+talla+color", "producto_variantes (FK)"],
        ["Pedidos", "1 fila = 1 producto", "pedido + pedido_items (N ítems)"],
        ["Estados pedido", "4 estados básicos", "11 estados del flujo real"],
        ["Producción", "Sin OP formal", "órdenes + avances + alertas"],
        ["Calidad", "No existía", "10 criterios + inspección + RPC"],
        ["Stock materia", "Cantidad simple", "Receta por talla + descuento en OP"],
        ["Roles", "Sin login/roles", "perfiles: supervisora / maquiladora"],
        ["Reglas negocio", "Solo en JS", "Funciones PostgreSQL (RPC)"],
        ["KPIs", "Conteos básicos", "vista_kpis + dashboard"],
        ["Demo/pruebas", "Datos manuales", "seed SQL + mock JS + login demo"],
        ["UX mensajes", "alert() del navegador", "Toasts éxito/aviso/error"],
        ["Botones tabla", "Estilo genérico", "Colores por acción (OP, compra…)"],
    ]:
        pdf.table_row(r, w)

    pdf.ln(6)
    pdf.h2("3.2 Tablas eliminadas / reemplazadas")
    pdf.bullet("ANTES: productos_terminados, productos_proceso, stock_disponible (duplicaban el mismo concepto).")
    pdf.bullet("AHORA: producto_variantes.stock_terminado + ordenes_produccion + flujo de estados.")

    pdf.h2("3.3 Tablas y objetos nuevos (v2)")
    for t in [
        "perfiles, clientes, proveedores, productos, colores, tallas, producto_variantes",
        "materia_prima, suministros, receta_materia, receta_suministros",
        "pedidos, pedido_items, solicitudes_compra, solicitud_compra_items, ingresos_materia",
        "ordenes_produccion, consumo_produccion, avances_produccion, alertas_produccion",
        "criterios_calidad, inspecciones_calidad, inspeccion_items, entregas",
        "Vistas: vista_kpis, vista_pedidos_proceso",
        "RPC: verificar_stock_pedido, generar_orden_produccion, registrar_avance_produccion, aprobar_inspeccion_calidad, recibir_materia_compra",
    ]:
        pdf.bullet(t)

    # 4 Arquitectura
    pdf.add_page()
    pdf.h1("4. Arquitectura actual")
    pdf.body(
        "PostgreSQL es el motor de datos. Supabase lo expone como servicio: API REST automática "
        "(PostgREST) sobre las tablas, y llamadas RPC a funciones SQL. El frontend estático "
        "(GitHub Pages) usa el SDK @supabase/supabase-js."
    )

    pdf.h2("4.1 Diagrama de arquitectura")
    y = pdf.get_y() + 2
    pdf.draw_arch_box(25, y, 70, 18, "Usuario / Navegador", "Supervisora o Maquiladora", (255, 255, 255))
    pdf.draw_arch_box(115, y, 70, 18, "GitHub Pages", "HTML + CSS + JS estático", (255, 255, 255))
    pdf.arrow_down(60, y + 18, y + 28)
    pdf.arrow_down(150, y + 18, y + 28)

    y2 = y + 30
    pdf.draw_arch_box(
        40, y2, 130, 22, "Capa de aplicación (cliente)",
        "supabase-config.js  |  mock-data.js (opcional)  |  supabase-client.js  |  ui.js + módulos",
        (232, 244, 252),
    )
    pdf.arrow_down(105, y2 + 22, y2 + 32)

    y3 = y2 + 34
    pdf.draw_arch_box(
        40, y3, 130, 24, "Supabase API (HTTPS)",
        "PostgREST: CRUD tablas   |   RPC: funciones SQL   |   RLS: políticas de acceso",
        (220, 237, 247),
    )
    pdf.arrow_down(105, y3 + 24, y3 + 34)

    y4 = y3 + 36
    pdf.draw_arch_box(
        40, y4, 130, 26, "PostgreSQL (Supabase)",
        "Esquema martin_company.sql  |  Triggers updated_at  |  Vistas KPI  |  Integridad FK",
        (200, 230, 201),
    )

    pdf.set_y(y4 + 32)
    pdf.h3("Proceso de una operación típica (cómo se usa la API)")
    for t in [
        "1. La UI llama obtenerRegistros / insertarRegistro / llamarRPC (supabase-client.js).",
        "2. El SDK envía HTTP a https://<proyecto>.supabase.co/rest/v1/... o /rpc/...",
        "3. PostgREST traduce a SQL sobre PostgreSQL (SELECT/INSERT/UPDATE o CALL función).",
        "4. Las funciones SQL aplican reglas (stock, descuentos, estados) de forma atómica.",
        "5. La respuesta JSON actualiza tablas/KPIs; ui.js muestra toast de éxito o error.",
        "6. Si USE_MOCK_DATA=true, mock-data.js simula la misma API en localStorage (demo sin red).",
    ]:
        pdf.bullet(t)

    pdf.ln(2)
    pdf.h2("4.2 Diagrama del flujo de negocio")
    pdf.set_font("ArialUni", "", 8)
    pdf.set_text_color(*NEGRO)
    flujo = [
        "[Registrar pedido]",
        "        |",
        "        v",
        "[verificar_stock_pedido] ----stock OK----> [materia_recibida]",
        "        |                                        |",
        "   stock insuficiente                            v",
        "        v                              [generar_orden_produccion]",
        "[solicitud_compra]                               |",
        "        |                                        v",
        "[recibir_materia_compra] ---------------> [en_produccion / avances]",
        "                                                 |",
        "                                            avance 100%",
        "                                                 v",
        "                                      [control_calidad / inspección]",
        "                                                 |",
        "                                            aprobado",
        "                                                 v",
        "                                      [aprobado_calidad] -> [Entrega]",
    ]
    for line in flujo:
        pdf.cell(0, 4.2, line, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    pdf.set_font("ArialUni", "", 9)
    pdf.set_text_color(*GRIS)
    pdf.multi_cell(
        0, 5,
        "Las transiciones críticas viven en PostgreSQL (RPC), no solo en el navegador. "
        "Así se evita inconsistencia si hay varios usuarios.",
    )

    # 5
    pdf.add_page()
    pdf.h1("5. Mejoras del flujo operativo")
    pdf.h2("5.1 Qué mejoró en el proceso")
    mejoras = [
        ("Bifurcación por stock",
         "Al registrar un pedido se calcula la materia según receta (metros S/M/L). Si falta, se crea solicitud de compra; si alcanza, queda listo para OP."),
        ("Orden de producción",
         "Al generar OP se descuenta materia y suministros, se asigna maquiladora y fecha planeada."),
        ("Avances y retrasos",
         "La maquiladora registra %; si se pasa la fecha con avance < 100% se crea alerta."),
        ("Control de calidad",
         "10 criterios del documento Word; si falla un criterio no se aprueba ni se suma stock terminado."),
        ("Entrega",
         "Solo pedidos en aprobado_calidad pueden entregarse; el dashboard refleja entregas e inspecciones."),
        ("Roles",
         "Supervisora: inventario, pedidos, calidad, reportes. Maquiladora: producción de sus órdenes."),
    ]
    for titulo, desc in mejoras:
        pdf.h3(titulo)
        pdf.body(desc)

    pdf.h2("5.2 Capas de prueba")
    pdf.bullet("seed_flujo_mock.sql: 7 pedidos (PED-001…007) en estados distintos para recorrer el flujo en Supabase.")
    pdf.bullet("js/mock-data.js: misma narrativa sin SQL, con restauración desde el login.")

    # 6
    pdf.h1("6. Por qué ahora es mejor")
    w2 = [55, 60, 65]
    pdf.table_row(["Criterio", "Impacto", "Beneficio"], w2, header=True)
    for r in [
        ["Integridad de datos", "FK + UNIQUE variantes", "Menos duplicados y errores de tipeo"],
        ["Reglas en el servidor", "RPC PostgreSQL", "Lógica confiable aunque falle el JS"],
        ["Trazabilidad", "Avances, consumo, inspecciones", "Auditoría del pedido extremo a extremo"],
        ["Escalabilidad", "API REST + Postgres", "Varios usuarios / dispositivos a la vez"],
        ["Mantenibilidad", "Módulos por dominio", "Cambios localizados (pedidos, calidad…)"],
        ["Demostración", "Mock + seed", "Presentación de tesis sin fricción"],
        ["UX", "Toasts + botones semánticos", "Feedback claro sin alertas bloqueantes"],
        ["Despliegue", "GitHub Pages + Supabase", "Frontend gratis, backend gestionado"],
    ]:
        pdf.table_row(r, w2)

    pdf.ln(6)
    pdf.box(
        "Conclusión",
        [
            "El sistema dejó de ser un CRUD de tablas sueltas y pasó a ser un flujo de producción",
            "soportado por PostgreSQL en Supabase. La API REST/RPC conecta la UI con reglas de negocio",
            "centralizadas. Eso reduce inconsistencias, refleja el proceso real de MARTIN Company y",
            "facilita la evaluación académica y operativa del producto.",
        ],
        color=VERDE,
    )

    # 7
    pdf.h1("7. Entregables técnicos clave")
    for t in [
        "supabase/martin_company.sql — esquema v2 completo",
        "supabase/seed_flujo_mock.sql — datos de flujo de prueba",
        "js/supabase-client.js — cliente API (o mock)",
        "js/mock-data.js — demo offline",
        "js/ui.js — toasts y confirmaciones",
        "Módulos: pedidos, producción, calidad, inventario, reportes, login con roles",
    ]:
        pdf.bullet(t)

    pdf.ln(4)
    pdf.set_font("ArialUni", "I", 9)
    pdf.set_text_color(*GRIS)
    pdf.multi_cell(
        0, 5,
        "Documento generado a partir del estado del repositorio tesis-cami-salesiana "
        "(rediseño v2 + mejoras UX).",
    )

    pdf.output(str(OUT))
    print("OK:", OUT)


if __name__ == "__main__":
    build()
