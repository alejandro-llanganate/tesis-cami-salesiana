# -*- coding: utf-8 -*-
"""Guia para Camila: subir el proyecto MARTIN a GitHub (nivel junior)."""
from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).resolve().parent / "Guia_Subir_Proyecto_a_GitHub_Camila.pdf"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

AZUL = (11, 58, 102)
AZUL2 = (14, 77, 134)
VERDE = (22, 133, 88)
GRIS = (100, 116, 139)
NEGRO = (30, 41, 59)
FONDO = (232, 241, 250)


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
        self.set_x(15)
        self.cell(0, 8, "Guia GitHub para Camila  |  MARTIN Company", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*AZUL2)
        self.line(15, 12, 195, 12)
        self.ln(4)

    def footer(self):
        self.set_y(-14)
        self.set_font("ArialUni", "", 8)
        self.set_text_color(*GRIS)
        self.cell(0, 8, f"Pagina {self.page_no()}/{{nb}}  ·  Documento para tesis / practica", align="C")

    def h1(self, text):
        self.set_x(15)
        self.set_font("ArialUni", "B", 14)
        self.set_text_color(*AZUL)
        self.multi_cell(180, 8, text)
        self.ln(1)

    def h2(self, text):
        self.set_x(15)
        self.set_font("ArialUni", "B", 12)
        self.set_text_color(*AZUL2)
        self.multi_cell(180, 7, text)
        self.ln(1)

    def p(self, text):
        self.set_x(15)
        self.set_font("ArialUni", "", 10)
        self.set_text_color(*NEGRO)
        self.multi_cell(180, 5.5, text)
        self.ln(1.5)

    def bullet(self, text):
        self.set_x(15)
        self.set_font("ArialUni", "", 10)
        self.set_text_color(*NEGRO)
        self.cell(6, 5.5, "-")
        self.multi_cell(174, 5.5, text)
        self.ln(0.8)

    def step(self, num, title, lines):
        self.set_x(15)
        y = self.get_y()
        if y > 250:
            self.add_page()
        self.set_fill_color(*AZUL)
        self.set_text_color(255, 255, 255)
        self.set_font("ArialUni", "B", 10)
        self.cell(10, 7, str(num), align="C", fill=True)
        self.set_text_color(*AZUL)
        self.set_font("ArialUni", "B", 11)
        self.cell(0, 7, "  " + title, new_x="LMARGIN", new_y="NEXT")
        self.set_font("ArialUni", "", 10)
        self.set_text_color(*NEGRO)
        for line in lines:
            self.set_x(20)
            self.multi_cell(170, 5.4, line)
        self.ln(3)

    def tip(self, text):
        self.set_x(15)
        self.set_fill_color(*FONDO)
        self.set_draw_color(*AZUL2)
        self.set_font("ArialUni", "B", 9)
        self.set_text_color(*AZUL)
        y0 = self.get_y()
        self.rect(15, y0, 180, 1, style="")  # noop keep positions
        self.set_xy(15, y0)
        self.set_fill_color(232, 245, 233)
        # measure
        self.set_font("ArialUni", "", 9.5)
        self.set_text_color(*NEGRO)
        self.set_x(18)
        self.multi_cell(174, 5, "TIP: " + text)
        self.ln(3)

    def code(self, text):
        self.set_x(20)
        self.set_font("Courier", "", 9)
        self.set_fill_color(245, 247, 250)
        self.set_text_color(*NEGRO)
        self.multi_cell(170, 5.2, text, fill=True)
        self.ln(2)


def build():
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.set_margins(15, 18, 15)
    pdf.set_auto_page_break(True, 18)

    # Portada
    pdf.add_page()
    pdf.set_fill_color(*AZUL)
    pdf.rect(0, 0, 210, 55, "F")
    pdf.set_y(18)
    pdf.set_font("ArialUni", "B", 20)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 10, "Como subir este proyecto a GitHub", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 12)
    pdf.cell(0, 8, "Guia practica para Camila (nivel junior)", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(70)
    pdf.set_text_color(*NEGRO)
    pdf.set_font("ArialUni", "", 11)
    pdf.multi_cell(180, 6.5,
        "Esta guia te explica, paso a paso y sin tecnicismos innecesarios, "
        "como subir el repositorio del sistema MARTIN Company a GitHub "
        "y como publicar cambios despues.")
    pdf.ln(4)
    pdf.set_font("ArialUni", "B", 11)
    pdf.cell(0, 7, "Proyecto: tesis-cami-salesiana (MARTIN Company)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("ArialUni", "", 10)
    pdf.set_text_color(*GRIS)
    pdf.cell(0, 6, "Para: Camila  ·  Objetivo: publicar el codigo en GitHub con seguridad", new_x="LMARGIN", new_y="NEXT")

    # Cap 1
    pdf.add_page()
    pdf.h1("1. Conceptos basicos (lee esto primero)")
    pdf.p("No necesitas ser experta. Solo entiende estas 3 ideas:")
    pdf.bullet("Git = herramienta en tu computador que guarda versiones de tus archivos.")
    pdf.bullet("GitHub = sitio web (github.com) donde se guarda una copia en internet.")
    pdf.bullet("Repositorio (repo) = la carpeta del proyecto con todo el historial de cambios.")
    pdf.ln(1)
    pdf.tip("Subir a GitHub no borra tus archivos locales. Solo crea una copia remota.")

    pdf.h2("Palabras que vas a ver")
    pdf.bullet("commit = guardar un paquete de cambios con un mensaje.")
    pdf.bullet("push = enviar esos cambios a GitHub.")
    pdf.bullet("pull = bajar cambios que estan en GitHub a tu PC.")
    pdf.bullet("branch / main = linea principal del proyecto (usa main).")
    pdf.bullet("clone = descargar un repo que ya existe en GitHub.")

    # Cap 2
    pdf.h1("2. Requisitos antes de empezar")
    pdf.bullet("Cuenta en GitHub (gratis): https://github.com/signup")
    pdf.bullet("Git instalado en tu Mac (Terminal: git --version). Si no aparece, instala Xcode Command Line Tools o Git.")
    pdf.bullet("Opcional y recomendado si te confunde la Terminal: GitHub Desktop (https://desktop.github.com).")
    pdf.bullet("La carpeta del proyecto en tu computador (ejemplo: Desktop/proyecto 2).")
    pdf.ln(1)
    pdf.tip("Si tu profesor o companero ya creo el repo, pideles el enlace y ve directo al paso 5 (clonar) o 6 (subir cambios).")

    # Cap 3 - crear repo
    pdf.add_page()
    pdf.h1("3. Crear el repositorio en GitHub (primera vez)")
    pdf.step(1, "Entra a GitHub", [
        "Abre https://github.com e inicia sesion con tu cuenta."
    ])
    pdf.step(2, "Crea un repositorio nuevo", [
        "Pulsa el boton verde New (o el signo + arriba a la derecha → New repository).",
        "Repository name: tesis-cami-salesiana (o el nombre que usen en la tesis).",
        "Description: Sistema MARTIN Company - gestion de produccion.",
        "Public (si deben verlo evaluadores) o Private (solo ustedes).",
        "NO marques 'Add a README' si la carpeta local ya tiene archivos (evita conflictos).",
        "Pulsa Create repository."
    ])
    pdf.step(3, "Copia la URL del repo", [
        "GitHub te mostrara una pagina con instrucciones.",
        "Copia la URL HTTPS, algo como:",
        "https://github.com/TU_USUARIO/tesis-cami-salesiana.git",
        "Guardala: la usaras en los siguientes pasos."
    ])

    # Cap 4 - primera subida
    pdf.h1("4. Subir el proyecto desde tu carpeta (primera subida)")
    pdf.p("Abre Terminal en Mac. Ve a la carpeta del proyecto. Si tu carpeta se llama 'proyecto 2' en el Escritorio:")
    pdf.code("cd \"/Users/TU_USUARIO/Desktop/proyecto 2\"")
    pdf.p("Revisa que estes dentro (debes ver archivos como index.html, login.html, js/, css/):")
    pdf.code("ls")

    pdf.step(4, "Inicializar Git (solo si aun no es un repo)", [
        "Si ya existe la carpeta .git, salta este bloque.",
        "Si no existe, ejecuta:"
    ])
    pdf.code("git init\ngit branch -M main")

    pdf.step(5, "Conectar con GitHub", [
        "Reemplaza la URL por la tuya:"
    ])
    pdf.code("git remote add origin https://github.com/TU_USUARIO/tesis-cami-salesiana.git")
    pdf.p("Si te dice que origin ya existe, usa:")
    pdf.code("git remote set-url origin https://github.com/TU_USUARIO/tesis-cami-salesiana.git")

    pdf.step(6, "Agregar, confirmar y subir", [
        "Estos 3 comandos son los que mas vas a repetir en el futuro:"
    ])
    pdf.code("git add .\ngit commit -m \"Primera version del sistema MARTIN\"\ngit push -u origin main")
    pdf.tip("Si pide usuario/contrasena: en GitHub ya no se usa la contrasena normal. Crea un Personal Access Token (Settings → Developer settings → Tokens) o inicia sesion con el navegador cuando te lo pida.")

    # Cap 5 - cambios diarios
    pdf.add_page()
    pdf.h1("5. Como subir cambios despues (dia a dia)")
    pdf.p("Cada vez que edites archivos y quieras publicarlos:")
    pdf.code("cd \"/Users/TU_USUARIO/Desktop/proyecto 2\"\ngit status\ngit add .\ngit commit -m \"Describe tu cambio en una frase\"\ngit push origin main")
    pdf.p("Ejemplos de buenos mensajes de commit:")
    pdf.bullet("Agrega login con correo y contraseña")
    pdf.bullet("Corrige menu lateral en movil")
    pdf.bullet("Actualiza guia de acceso")

    pdf.h2("Si git push falla")
    pdf.bullet("Primero baja lo nuevo: git pull origin main")
    pdf.bullet("Luego otra vez: git push origin main")
    pdf.bullet("Si hay conflictos, pide ayuda: no borres archivos a la fuerza.")

    # Cap 6 - GitHub Desktop
    pdf.h1("6. Alternativa facil: GitHub Desktop")
    pdf.p("Si la Terminal te intimida, usa GitHub Desktop:")
    pdf.bullet("Instala GitHub Desktop e inicia sesion con tu cuenta GitHub.")
    pdf.bullet("File → Add Local Repository → elige la carpeta del proyecto.")
    pdf.bullet("Si te dice que no es un repo: create repository / publish.")
    pdf.bullet("Para publicar cambios: escribe un Summary a la izquierda → Commit → Push origin.")
    pdf.tip("GitHub Desktop hace lo mismo que add + commit + push, pero con botones.")

    # Cap 7 - Pages (este proyecto)
    pdf.add_page()
    pdf.h1("7. Publicar el sitio web (GitHub Pages)")
    pdf.p("Este proyecto ya tiene un workflow de despliegue. Para que el sitio quede publico:")
    pdf.step(1, "Activa Pages una sola vez", [
        "En el repo de GitHub: Settings → Pages.",
        "En Source elige: GitHub Actions (no 'Deploy from a branch').",
        "Guarda."
    ])
    pdf.step(2, "Verifica el despliegue", [
        "Ve a la pestana Actions.",
        "Tras cada push a main deben salir verdes los jobs Build y Deploy.",
        "La URL típica queda asi:",
        "https://TU_USUARIO.github.io/tesis-cami-salesiana/"
    ])

    # Cap 8 - seguridad
    pdf.h1("8. Cosas que NO debes subir")
    pdf.bullet("Contrasenas reales o claves privadas.")
    pdf.bullet("Archivos .env con secretos (si los creas mas adelante).")
    pdf.bullet("Carpetas temporales tipo .venv o node_modules si no hacen falta en este proyecto.")
    pdf.p("En este proyecto de demostracion las claves de Supabase publicables pueden estar en el codigo; aun asi, no subas tokens personales de GitHub.")

    # Cap 9 - checklist
    pdf.h1("9. Checklist final para Camila")
    pdf.bullet("[ ] Tengo cuenta en GitHub")
    pdf.bullet("[ ] Cree el repositorio en github.com")
    pdf.bullet("[ ] Conecte mi carpeta local con origin")
    pdf.bullet("[ ] Hice git add / commit / push (o use GitHub Desktop)")
    pdf.bullet("[ ] Veo mis archivos en la web de GitHub")
    pdf.bullet("[ ] Active Pages en Settings → GitHub Actions")
    pdf.bullet("[ ] Actions esta en verde despues del push")

    pdf.ln(4)
    pdf.set_fill_color(*VERDE)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("ArialUni", "B", 11)
    pdf.set_x(15)
    pdf.cell(180, 10, "  Listo: tu proyecto ya esta en GitHub.", fill=True, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)
    pdf.set_text_color(*NEGRO)
    pdf.set_font("ArialUni", "", 10)
    pdf.p("Si te trabas en un paso, toma captura de la pantalla/error y pidela ayuda con esa imagen. No reinicies el proyecto borrando la carpeta.")

    # Comandos resumen
    pdf.add_page()
    pdf.h1("10. Hoja rapida de comandos")
    pdf.p("Primera vez (resumen):")
    pdf.code(
        "cd \"/Users/TU_USUARIO/Desktop/proyecto 2\"\n"
        "git init\n"
        "git branch -M main\n"
        "git remote add origin https://github.com/TU_USUARIO/tesis-cami-salesiana.git\n"
        "git add .\n"
        "git commit -m \"Primera version del sistema MARTIN\"\n"
        "git push -u origin main"
    )
    pdf.p("Cambios posteriores:")
    pdf.code(
        "cd \"/Users/TU_USUARIO/Desktop/proyecto 2\"\n"
        "git add .\n"
        "git commit -m \"tu mensaje\"\n"
        "git push origin main"
    )
    pdf.p("Ver en que estado estas:")
    pdf.code("git status\ngit remote -v\ngit log --oneline -5")

    pdf.ln(2)
    pdf.h2("Enlaces utiles")
    pdf.bullet("GitHub: https://github.com")
    pdf.bullet("GitHub Desktop: https://desktop.github.com")
    pdf.bullet("Docs oficiales (empezar): https://docs.github.com/es/get-started")

    pdf.output(str(OUT))
    print("OK:", OUT)


if __name__ == "__main__":
    build()
