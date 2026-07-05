-- =============================================================================
-- MARTIN Company — Base de datos completa (Supabase)
-- =============================================================================
--
-- INSTRUCCIONES:
--   1. Abre https://supabase.com/dashboard → tu proyecto
--   2. Ve a SQL Editor → New query
--   3. Copia y pega TODO este archivo
--   4. Pulsa Run
--
-- INCLUYE: tablas, índices, triggers, vistas, seguridad, datos de ejemplo
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIÓN
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLAS
-- ─────────────────────────────────────────────────────────────────────────────

-- Inventario: productos listos para entrega
CREATE TABLE IF NOT EXISTS productos_terminados (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto    TEXT NOT NULL,
    talla       TEXT NOT NULL,
    color       TEXT NOT NULL,
    cantidad    INTEGER NOT NULL CHECK (cantidad >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventario: productos en fabricación
CREATE TABLE IF NOT EXISTS productos_proceso (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto     TEXT NOT NULL,
    talla        TEXT NOT NULL,
    color        TEXT NOT NULL,
    cantidad     INTEGER NOT NULL CHECK (cantidad >= 0),
    maquiladora  TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventario: telas y materiales
CREATE TABLE IF NOT EXISTS materia_prima (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tela        TEXT NOT NULL,
    color       TEXT NOT NULL,
    cantidad    INTEGER NOT NULL CHECK (cantidad >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventario: botones, hilos, cierres, etc.
CREATE TABLE IF NOT EXISTS suministros (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    color       TEXT NOT NULL,
    cantidad    INTEGER NOT NULL CHECK (cantidad >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedidos: stock para atención inmediata
CREATE TABLE IF NOT EXISTS stock_disponible (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto    TEXT NOT NULL,
    talla       TEXT NOT NULL,
    color       TEXT NOT NULL,
    cantidad    INTEGER NOT NULL CHECK (cantidad >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedidos: órdenes por producir (campo "numero" = N° de pedido en el formulario)
CREATE TABLE IF NOT EXISTS pedidos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero      TEXT NOT NULL,
    cliente     TEXT NOT NULL,
    producto    TEXT NOT NULL,
    talla       TEXT NOT NULL,
    cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
    fecha       DATE NOT NULL,
    estado      TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedidos: entregas realizadas
CREATE TABLE IF NOT EXISTS entregas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido   TEXT NOT NULL,
    cliente         TEXT NOT NULL,
    fecha_entrega   DATE NOT NULL,
    responsable     TEXT NOT NULL,
    estado          TEXT NOT NULL DEFAULT 'entregado'
                      CHECK (estado IN ('en_ruta', 'entregado')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reportes: historial de reportes generados
CREATE TABLE IF NOT EXISTS reportes_generados (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo         TEXT NOT NULL
                   CHECK (tipo IN ('resumen', 'inventario', 'pedidos', 'produccion', 'completo')),
    titulo       TEXT NOT NULL,
    datos        JSONB NOT NULL DEFAULT '{}',
    generado_por TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ÍNDICES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_productos_terminados_producto ON productos_terminados (producto);
CREATE INDEX IF NOT EXISTS idx_productos_proceso_maquiladora ON productos_proceso (maquiladora);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente              ON pedidos (cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado               ON pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_entregas_fecha               ON entregas (fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo                ON reportes_generados (tipo);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TRIGGER: actualizar updated_at automáticamente
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$
DECLARE tabla TEXT;
BEGIN
    FOREACH tabla IN ARRAY ARRAY[
        'productos_terminados', 'productos_proceso', 'materia_prima',
        'suministros', 'stock_disponible', 'pedidos', 'entregas'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', tabla, tabla);
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at()',
            tabla, tabla
        );
    END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. VISTAS (para el módulo de Reportes)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW vista_resumen_operativo AS
SELECT
    (SELECT COALESCE(SUM(cantidad), 0) FROM productos_terminados)               AS total_terminados,
    (SELECT COALESCE(SUM(cantidad), 0) FROM productos_proceso)                AS total_proceso,
    (SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente')                  AS pedidos_pendientes,
    (SELECT COALESCE(SUM(cantidad), 0) FROM pedidos WHERE estado = 'pendiente') AS unidades_por_producir,
    (SELECT COUNT(*) FROM entregas WHERE estado = 'entregado')                 AS entregas_realizadas;

CREATE OR REPLACE VIEW vista_produccion_maquiladora AS
SELECT maquiladora, COUNT(*) AS productos, SUM(cantidad) AS unidades
FROM productos_proceso GROUP BY maquiladora ORDER BY unidades DESC;

CREATE OR REPLACE VIEW vista_pedidos_por_cliente AS
SELECT cliente, COUNT(*) AS total_pedidos, SUM(cantidad) AS unidades_totales
FROM pedidos GROUP BY cliente ORDER BY unidades_totales DESC;

CREATE OR REPLACE VIEW vista_alertas_stock AS
SELECT 'terminado' AS tipo, producto, talla, color, cantidad,
    CASE WHEN cantidad >= 30 THEN 'disponible' WHEN cantidad >= 10 THEN 'medio' ELSE 'bajo' END AS nivel_stock
FROM productos_terminados
UNION ALL
SELECT 'proceso', producto, talla, color, cantidad,
    CASE WHEN cantidad >= 30 THEN 'disponible' WHEN cantidad >= 10 THEN 'medio' ELSE 'bajo' END
FROM productos_proceso;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEGURIDAD (RLS + permisos para la API de Supabase)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE productos_terminados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_proceso    ENABLE ROW LEVEL SECURITY;
ALTER TABLE materia_prima        ENABLE ROW LEVEL SECURITY;
ALTER TABLE suministros          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_disponible     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_generados   ENABLE ROW LEVEL SECURITY;

-- Una política por tabla (FOR ALL evita el error de WITH CHECK en SELECT/DELETE)

DROP POLICY IF EXISTS "acceso_publico" ON productos_terminados;
CREATE POLICY "acceso_publico" ON productos_terminados FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON productos_proceso;
CREATE POLICY "acceso_publico" ON productos_proceso FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON materia_prima;
CREATE POLICY "acceso_publico" ON materia_prima FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON suministros;
CREATE POLICY "acceso_publico" ON suministros FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON stock_disponible;
CREATE POLICY "acceso_publico" ON stock_disponible FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON pedidos;
CREATE POLICY "acceso_publico" ON pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON entregas;
CREATE POLICY "acceso_publico" ON entregas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acceso_publico" ON reportes_generados;
CREATE POLICY "acceso_publico" ON reportes_generados FOR ALL USING (true) WITH CHECK (true);

-- Limpiar políticas viejas de ejecuciones anteriores (si existen)
DO $$
DECLARE t TEXT; op TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'productos_terminados','productos_proceso','materia_prima','suministros',
        'stock_disponible','pedidos','entregas','reportes_generados'
    ]
    LOOP
        FOREACH op IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE']
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'publico_'||op||'_'||t, t);
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Acceso público '||op||' '||t, t);
        END LOOP;
    END LOOP;
END;
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. DATOS DE EJEMPLO (solo si las tablas están vacías)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM productos_terminados LIMIT 1) THEN
        INSERT INTO productos_terminados (producto, talla, color, cantidad) VALUES
            ('Bata médica', 'M', 'Blanco', 45),
            ('Bata médica', 'L', 'Azul', 32),
            ('Scrubs', 'S', 'Verde', 18),
            ('Pantalón quirúrgico', 'M', 'Azul marino', 25);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM productos_proceso LIMIT 1) THEN
        INSERT INTO productos_proceso (producto, talla, color, cantidad, maquiladora) VALUES
            ('Bata médica', 'XL', 'Blanco', 20, 'Maquiladora Norte'),
            ('Scrubs', 'M', 'Gris', 15, 'Maquiladora Sur'),
            ('Gorro quirúrgico', 'Única', 'Azul', 50, 'Maquiladora Norte');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM materia_prima LIMIT 1) THEN
        INSERT INTO materia_prima (tela, color, cantidad) VALUES
            ('Algodón premium', 'Blanco', 120),
            ('Poliéster', 'Azul', 80),
            ('Mezcla algodón-poliéster', 'Verde', 35);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM suministros LIMIT 1) THEN
        INSERT INTO suministros (nombre, color, cantidad) VALUES
            ('Hilo poliéster', 'Blanco', 200),
            ('Cierre metálico', 'Plateado', 150),
            ('Botones', 'Blanco', 500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM stock_disponible LIMIT 1) THEN
        INSERT INTO stock_disponible (producto, talla, color, cantidad) VALUES
            ('Bata médica', 'M', 'Blanco', 12),
            ('Scrubs', 'L', 'Verde', 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pedidos LIMIT 1) THEN
        INSERT INTO pedidos (numero, cliente, producto, talla, cantidad, fecha, estado) VALUES
            ('PED-001', 'Clínica San Rafael', 'Bata médica', 'M', 30, '2026-07-01', 'pendiente'),
            ('PED-002', 'Hospital Central', 'Scrubs', 'L', 50, '2026-07-03', 'pendiente'),
            ('PED-003', 'Laboratorio BioMed', 'Pantalón quirúrgico', 'M', 20, '2026-06-28', 'en_proceso');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM entregas LIMIT 1) THEN
        INSERT INTO entregas (numero_pedido, cliente, fecha_entrega, responsable, estado) VALUES
            ('PED-000', 'Clínica del Valle', '2026-06-25', 'Carlos Méndez', 'entregado'),
            ('PED-000', 'Centro Médico Andes', '2026-06-30', 'Ana Torres', 'entregado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM reportes_generados LIMIT 1) THEN
        INSERT INTO reportes_generados (tipo, titulo, datos, generado_por) VALUES
            ('resumen', 'Resumen Operativo Julio 2026', '{"total_terminados":120,"total_proceso":85,"pedidos_pendientes":3}', 'Sistema'),
            ('inventario', 'Reporte de Inventario', '{"productos_terminados":4,"productos_proceso":3}', 'Sistema'),
            ('produccion', 'Carga por Maquiladora', '{"maquiladoras_activas":2,"unidades_en_produccion":85}', 'Sistema');
    END IF;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. VERIFICACIÓN (debe mostrar resultados sin errores)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT '✅ Base de datos MARTIN Company lista' AS estado;

SELECT * FROM vista_resumen_operativo;

SELECT tabla, total FROM (
    SELECT 'productos_terminados' AS tabla, COUNT(*)::int AS total FROM productos_terminados
    UNION ALL SELECT 'productos_proceso',  COUNT(*)::int FROM productos_proceso
    UNION ALL SELECT 'materia_prima',      COUNT(*)::int FROM materia_prima
    UNION ALL SELECT 'suministros',        COUNT(*)::int FROM suministros
    UNION ALL SELECT 'stock_disponible',   COUNT(*)::int FROM stock_disponible
    UNION ALL SELECT 'pedidos',            COUNT(*)::int FROM pedidos
    UNION ALL SELECT 'entregas',           COUNT(*)::int FROM entregas
    UNION ALL SELECT 'reportes_generados', COUNT(*)::int FROM reportes_generados
) AS conteo ORDER BY tabla;
