# tesis-cami-salesiana

Sistema de gestión de producción de uniformes médicos — **MARTIN Company**.

## Sitio en vivo

https://alejandro-llanganate.github.io/tesis-cami-salesiana/

## Despliegue automático (2 pasos)

Cada push a `main` ejecuta el workflow con **2 jobs**:

| Paso | Job | Qué hace |
|------|-----|----------|
| 1 | **Build** | Prepara los archivos HTML, CSS, JS e imagen |
| 2 | **Deploy** | Publica el sitio en GitHub Pages |

### Configuración obligatoria en GitHub (solo una vez)

1. Ve a **Settings → Pages**
2. En **Build and deployment → Source** selecciona: **GitHub Actions**
3. Guarda

> Si está en "Deploy from a branch", el sitio no funcionará con este workflow.

### Subir cambios

```bash
git add .
git commit -m "describe tu cambio"
git push origin main
```

Luego ve a **Actions** y verifica que los 2 jobs (Build y Deploy) estén en verde.

## Base de datos (Supabase)

Ejecuta `supabase/martin_company.sql` en el SQL Editor de Supabase.
