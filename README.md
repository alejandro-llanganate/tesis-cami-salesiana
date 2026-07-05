# tesis-cami-salesiana

Sistema de gestión de producción de uniformes médicos — **MARTIN Company**.

## Sitio en vivo

https://alejandro-llanganate.github.io/tesis-cami-salesiana/

## Despliegue automático (GitHub Actions)

Cada push a `main` despliega automáticamente el sitio con el workflow oficial de GitHub Pages.

### Cómo funciona

1. Haces cambios en el proyecto
2. Ejecutas:

```bash
git add .
git commit -m "tu mensaje"
git push
```

3. GitHub Actions construye y publica el sitio en ~30 segundos

### Ver el estado del despliegue

Repo → pestaña **Actions** → workflow **Deploy GitHub Pages**

> Si un despliegue falla con `deploy-pages`, el workflow usa `peaceiris/actions-gh-pages`
> que publica en la rama `gh-pages`. En Settings → Pages, la fuente debe ser
> **Deploy from a branch** → rama `gh-pages` → `/ (root)`.

## Base de datos (Supabase)

Ejecuta `supabase/martin_company.sql` en el SQL Editor de Supabase.

## Estructura

```
index.html        → Dashboard
inventario.html   → Inventario
pedidos.html      → Pedidos
reportes.html     → Reportes
js/               → Lógica + cliente Supabase
css/              → Estilos
supabase/         → SQL de la base de datos
```
