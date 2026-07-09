-- =============================================================================
-- MARTIN Company v2 — Esquema relacional completo
-- Ejecutar en Supabase SQL Editor (borra tablas anteriores)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── LIMPIAR ESQUEMA ANTERIOR ─────────────────────────────────────────────────
DROP VIEW IF EXISTS vista_kpis CASCADE;
DROP VIEW IF EXISTS vista_pedidos_proceso CASCADE;
DROP TABLE IF EXISTS inspeccion_items CASCADE;
DROP TABLE IF EXISTS inspecciones_calidad CASCADE;
DROP TABLE IF EXISTS alertas_produccion CASCADE;
DROP TABLE IF EXISTS avances_produccion CASCADE;
DROP TABLE IF EXISTS consumo_produccion CASCADE;
DROP TABLE IF EXISTS ordenes_produccion CASCADE;
DROP TABLE IF EXISTS ingresos_materia CASCADE;
DROP TABLE IF EXISTS solicitud_compra_items CASCADE;
DROP TABLE IF EXISTS solicitudes_compra CASCADE;
DROP TABLE IF EXISTS pedido_items CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS entregas CASCADE;
DROP TABLE IF EXISTS receta_suministros CASCADE;
DROP TABLE IF EXISTS receta_materia CASCADE;
DROP TABLE IF EXISTS producto_variantes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS colores CASCADE;
DROP TABLE IF EXISTS tallas CASCADE;
DROP TABLE IF EXISTS materia_prima CASCADE;
DROP TABLE IF EXISTS suministros CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS criterios_calidad CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS reportes_generados CASCADE;
DROP TABLE IF EXISTS productos_terminados CASCADE;
DROP TABLE IF EXISTS productos_proceso CASCADE;
DROP TABLE IF EXISTS stock_disponible CASCADE;

-- ── ROLES Y USUARIOS ───────────────────────────────────────────────────────
CREATE TABLE perfiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    rol         TEXT NOT NULL CHECK (rol IN ('supervisora', 'maquiladora')),
    activo      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CATÁLOGOS BASE ───────────────────────────────────────────────────────────
CREATE TABLE proveedores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL UNIQUE,
    correo      TEXT,
    telefono    TEXT,
    direccion   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE productos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL UNIQUE,
    precio_base NUMERIC(10,2) NOT NULL DEFAULT 0,
    activo      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE colores (
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE tallas (
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE
);

-- Variante única: producto + color + talla (sin duplicados)
CREATE TABLE producto_variantes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id      UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    color_id         UUID NOT NULL REFERENCES colores(id),
    talla_id         UUID NOT NULL REFERENCES tallas(id),
    precio           NUMERIC(10,2) NOT NULL,
    stock_terminado  INTEGER NOT NULL DEFAULT 0 CHECK (stock_terminado >= 0),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (producto_id, color_id, talla_id)
);

CREATE TABLE clientes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    contacto    TEXT,
    telefono    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INVENTARIO ───────────────────────────────────────────────────────────────
CREATE TABLE materia_prima (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id  UUID NOT NULL REFERENCES proveedores(id),
    nombre        TEXT NOT NULL,
    precio        NUMERIC(10,2) NOT NULL DEFAULT 0,
    unidad        TEXT NOT NULL DEFAULT 'metros',
    stock_actual  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suministros (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre       TEXT NOT NULL UNIQUE,
    tipo         TEXT NOT NULL DEFAULT 'insumo',
    precio       NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_actual NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Receta: consumo por unidad según talla (del Excel: S=2.10m, M=2.10m, L=2.30m)
CREATE TABLE receta_materia (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id      UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    talla_id         UUID NOT NULL REFERENCES tallas(id),
    materia_prima_id UUID NOT NULL REFERENCES materia_prima(id),
    cantidad_metros  NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    UNIQUE (producto_id, talla_id, materia_prima_id)
);

CREATE TABLE receta_suministros (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id     UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    suministro_id   UUID NOT NULL REFERENCES suministros(id),
    cantidad_unidad NUMERIC(10,2) NOT NULL CHECK (cantidad_unidad > 0),
    UNIQUE (producto_id, suministro_id)
);

-- ── PEDIDOS ──────────────────────────────────────────────────────────────────
CREATE TABLE pedidos (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero                TEXT NOT NULL UNIQUE,
    cliente_id            UUID NOT NULL REFERENCES clientes(id),
    fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_planeada DATE,
    estado                TEXT NOT NULL DEFAULT 'registrado' CHECK (estado IN (
        'registrado', 'stock_insuficiente', 'solicitud_compra',
        'materia_recibida', 'en_produccion', 'control_calidad',
        'aprobado_calidad', 'empaquetado', 'entregado', 'completado', 'cancelado'
    )),
    notas                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedido_items (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id            UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_variante_id UUID NOT NULL REFERENCES producto_variantes(id),
    cantidad             INTEGER NOT NULL CHECK (cantidad > 0),
    UNIQUE (pedido_id, producto_variante_id)
);

-- ── COMPRAS (rama stock insuficiente) ────────────────────────────────────────
CREATE TABLE solicitudes_compra (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id   UUID NOT NULL REFERENCES pedidos(id),
    estado      TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'cancelada')),
    fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE solicitud_compra_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id      UUID NOT NULL REFERENCES solicitudes_compra(id) ON DELETE CASCADE,
    materia_prima_id  UUID NOT NULL REFERENCES materia_prima(id),
    cantidad_necesaria NUMERIC(10,2) NOT NULL,
    cantidad_recibida  NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE ingresos_materia (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id     UUID REFERENCES solicitudes_compra(id),
    materia_prima_id UUID NOT NULL REFERENCES materia_prima(id),
    cantidad         NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    fecha            DATE NOT NULL DEFAULT CURRENT_DATE,
    registrado_por   UUID REFERENCES perfiles(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PRODUCCIÓN ───────────────────────────────────────────────────────────────
CREATE TABLE ordenes_produccion (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id            UUID NOT NULL REFERENCES pedidos(id),
    maquiladora_id       UUID NOT NULL REFERENCES perfiles(id),
    estado               TEXT NOT NULL DEFAULT 'corte' CHECK (estado IN (
        'corte', 'maquila', 'avance', 'control_calidad', 'completada', 'cancelada'
    )),
    fecha_inicio         DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin_planeada   DATE NOT NULL,
    fecha_fin_real       DATE,
    porcentaje_avance    INTEGER NOT NULL DEFAULT 0 CHECK (porcentaje_avance BETWEEN 0 AND 100),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consumo_produccion (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id         UUID NOT NULL REFERENCES ordenes_produccion(id) ON DELETE CASCADE,
    materia_prima_id UUID REFERENCES materia_prima(id),
    suministro_id    UUID REFERENCES suministros(id),
    cantidad         NUMERIC(10,2) NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (materia_prima_id IS NOT NULL OR suministro_id IS NOT NULL)
);

CREATE TABLE avances_produccion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id        UUID NOT NULL REFERENCES ordenes_produccion(id) ON DELETE CASCADE,
    porcentaje      INTEGER NOT NULL CHECK (porcentaje BETWEEN 0 AND 100),
    descripcion     TEXT,
    registrado_por  UUID NOT NULL REFERENCES perfiles(id),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alertas_produccion (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id    UUID NOT NULL REFERENCES ordenes_produccion(id) ON DELETE CASCADE,
    tipo        TEXT NOT NULL DEFAULT 'retraso',
    mensaje     TEXT NOT NULL,
    activa      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CALIDAD (criterios del documento Word) ───────────────────────────────────
CREATE TABLE criterios_calidad (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      INTEGER NOT NULL UNIQUE,
    parametro   TEXT NOT NULL,
    criterio    TEXT NOT NULL,
    metodo      TEXT NOT NULL,
    criticidad  TEXT NOT NULL CHECK (criticidad IN ('Alta', 'Media', 'Baja'))
);

CREATE TABLE inspecciones_calidad (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id        UUID NOT NULL REFERENCES ordenes_produccion(id),
    supervisor_id   UUID NOT NULL REFERENCES perfiles(id),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
    aprobada        BOOLEAN,
    observaciones   TEXT
);

CREATE TABLE inspeccion_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspeccion_id   UUID NOT NULL REFERENCES inspecciones_calidad(id) ON DELETE CASCADE,
    criterio_id     UUID NOT NULL REFERENCES criterios_calidad(id),
    cumple          BOOLEAN NOT NULL,
    observacion     TEXT,
    UNIQUE (inspeccion_id, criterio_id)
);

-- ── ENTREGAS ─────────────────────────────────────────────────────────────────
CREATE TABLE entregas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id       UUID NOT NULL REFERENCES pedidos(id),
    fecha_entrega   DATE NOT NULL DEFAULT CURRENT_DATE,
    responsable_id  UUID REFERENCES perfiles(id),
    estado          TEXT NOT NULL DEFAULT 'entregado' CHECK (estado IN ('en_ruta', 'entregado')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ÍNDICES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_variantes_producto ON producto_variantes(producto_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_ordenes_maquiladora ON ordenes_produccion(maquiladora_id);
CREATE INDEX idx_ordenes_pedido ON ordenes_produccion(pedido_id);

-- ── FUNCIÓN: actualizar updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_pedidos_updated BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trg_ordenes_updated BEFORE UPDATE ON ordenes_produccion
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trg_mp_updated BEFORE UPDATE ON materia_prima
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trg_sum_updated BEFORE UPDATE ON suministros
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- ── FUNCIÓN: calcular necesidades de materia prima para un pedido ────────────
CREATE OR REPLACE FUNCTION calcular_necesidades_pedido(p_pedido_id UUID)
RETURNS TABLE(materia_prima_id UUID, nombre_mp TEXT, cantidad_necesaria NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT mp.id, mp.nombre,
           SUM(rm.cantidad_metros * pi.cantidad)::NUMERIC AS cantidad_necesaria
    FROM pedido_items pi
    JOIN producto_variantes pv ON pv.id = pi.producto_variante_id
    JOIN receta_materia rm ON rm.producto_id = pv.producto_id AND rm.talla_id = pv.talla_id
    JOIN materia_prima mp ON mp.id = rm.materia_prima_id
    WHERE pi.pedido_id = p_pedido_id
    GROUP BY mp.id, mp.nombre;
END;
$$ LANGUAGE plpgsql;

-- ── FUNCIÓN: verificar stock y bifurcar proceso ──────────────────────────────
CREATE OR REPLACE FUNCTION verificar_stock_pedido(p_pedido_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_falta BOOLEAN := false;
    v_nec RECORD;
    v_sol_id UUID;
BEGIN
    FOR v_nec IN SELECT * FROM calcular_necesidades_pedido(p_pedido_id) LOOP
        IF (SELECT stock_actual FROM materia_prima WHERE id = v_nec.materia_prima_id) < v_nec.cantidad_necesaria THEN
            v_falta := true;
        END IF;
    END LOOP;

    IF v_falta THEN
        UPDATE pedidos SET estado = 'stock_insuficiente' WHERE id = p_pedido_id;
        INSERT INTO solicitudes_compra (pedido_id) VALUES (p_pedido_id) RETURNING id INTO v_sol_id;
        INSERT INTO solicitud_compra_items (solicitud_id, materia_prima_id, cantidad_necesaria)
        SELECT v_sol_id, materia_prima_id, cantidad_necesaria
        FROM calcular_necesidades_pedido(p_pedido_id);
        RETURN jsonb_build_object('stock_suficiente', false, 'solicitud_id', v_sol_id);
    ELSE
        UPDATE pedidos SET estado = 'materia_recibida' WHERE id = p_pedido_id;
        RETURN jsonb_build_object('stock_suficiente', true);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ── FUNCIÓN: generar orden de producción y descontar materia prima ───────────
CREATE OR REPLACE FUNCTION generar_orden_produccion(
    p_pedido_id UUID,
    p_maquiladora_id UUID,
    p_dias_plazo INTEGER DEFAULT 7
)
RETURNS UUID AS $$
DECLARE
    v_orden_id UUID;
    v_nec RECORD;
    v_sum RECORD;
    v_pi RECORD;
BEGIN
    IF (SELECT estado FROM pedidos WHERE id = p_pedido_id) NOT IN ('materia_recibida', 'stock_insuficiente') THEN
        RAISE EXCEPTION 'El pedido no está listo para producción';
    END IF;

    INSERT INTO ordenes_produccion (pedido_id, maquiladora_id, fecha_fin_planeada)
    VALUES (p_pedido_id, p_maquiladora_id, CURRENT_DATE + p_dias_plazo)
    RETURNING id INTO v_orden_id;

    -- Descontar materia prima según receta
    FOR v_nec IN SELECT * FROM calcular_necesidades_pedido(p_pedido_id) LOOP
        UPDATE materia_prima SET stock_actual = stock_actual - v_nec.cantidad_necesaria
        WHERE id = v_nec.materia_prima_id;
        INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
        VALUES (v_orden_id, v_nec.materia_prima_id, v_nec.cantidad_necesaria);
    END LOOP;

    -- Descontar suministros según receta
    FOR v_pi IN SELECT pi.*, pv.producto_id FROM pedido_items pi
                JOIN producto_variantes pv ON pv.id = pi.producto_variante_id
                WHERE pi.pedido_id = p_pedido_id LOOP
        FOR v_sum IN SELECT rs.suministro_id, rs.cantidad_unidad * v_pi.cantidad AS total
                     FROM receta_suministros rs WHERE rs.producto_id = v_pi.producto_id LOOP
            UPDATE suministros SET stock_actual = stock_actual - v_sum.total WHERE id = v_sum.suministro_id;
            INSERT INTO consumo_produccion (orden_id, suministro_id, cantidad)
            VALUES (v_orden_id, v_sum.suministro_id, v_sum.total);
        END LOOP;
    END LOOP;

    UPDATE pedidos SET estado = 'en_produccion' WHERE id = p_pedido_id;
    RETURN v_orden_id;
END;
$$ LANGUAGE plpgsql;

-- ── FUNCIÓN: registrar avance y detectar retraso ─────────────────────────────
CREATE OR REPLACE FUNCTION registrar_avance_produccion(
    p_orden_id UUID,
    p_porcentaje INTEGER,
    p_descripcion TEXT,
    p_registrado_por UUID
)
RETURNS JSONB AS $$
DECLARE
    v_orden RECORD;
    v_retraso BOOLEAN := false;
BEGIN
    SELECT * INTO v_orden FROM ordenes_produccion WHERE id = p_orden_id;

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por)
    VALUES (p_orden_id, p_porcentaje, p_descripcion, p_registrado_por);

    UPDATE ordenes_produccion SET porcentaje_avance = p_porcentaje, estado = 'avance'
    WHERE id = p_orden_id;

    IF CURRENT_DATE > v_orden.fecha_fin_planeada AND p_porcentaje < 100 THEN
        v_retraso := true;
        INSERT INTO alertas_produccion (orden_id, tipo, mensaje)
        VALUES (p_orden_id, 'retraso', 'La orden superó la fecha planeada con avance al ' || p_porcentaje || '%');
    END IF;

    IF p_porcentaje >= 100 THEN
        UPDATE ordenes_produccion SET estado = 'control_calidad' WHERE id = p_orden_id;
        UPDATE pedidos SET estado = 'control_calidad' WHERE id = v_orden.pedido_id;
    END IF;

    RETURN jsonb_build_object('retraso', v_retraso, 'porcentaje', p_porcentaje);
END;
$$ LANGUAGE plpgsql;

-- ── FUNCIÓN: aprobar calidad → sumar stock terminado ─────────────────────────
CREATE OR REPLACE FUNCTION aprobar_inspeccion_calidad(p_inspeccion_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_ins RECORD;
    v_orden RECORD;
    v_pi RECORD;
    v_todos_cumplen BOOLEAN;
    v_criticos_fallan BOOLEAN;
BEGIN
    SELECT * INTO v_ins FROM inspecciones_calidad WHERE id = p_inspeccion_id;
    SELECT * INTO v_orden FROM ordenes_produccion WHERE id = v_ins.orden_id;

    SELECT NOT EXISTS (
        SELECT 1 FROM inspeccion_items ii
        JOIN criterios_calidad cc ON cc.id = ii.criterio_id
        WHERE ii.inspeccion_id = p_inspeccion_id AND ii.cumple = false
    ) INTO v_todos_cumplen;

    SELECT EXISTS (
        SELECT 1 FROM inspeccion_items ii
        JOIN criterios_calidad cc ON cc.id = ii.criterio_id
        WHERE ii.inspeccion_id = p_inspeccion_id AND ii.cumple = false AND cc.criticidad = 'Alta'
    ) INTO v_criticos_fallan;

    IF v_criticos_fallan OR NOT v_todos_cumplen THEN
        UPDATE inspecciones_calidad SET aprobada = false WHERE id = p_inspeccion_id;
        RETURN jsonb_build_object('aprobada', false, 'mensaje', 'No cumple criterios de calidad');
    END IF;

    UPDATE inspecciones_calidad SET aprobada = true WHERE id = p_inspeccion_id;
    UPDATE ordenes_produccion SET estado = 'completada', fecha_fin_real = CURRENT_DATE WHERE id = v_orden.id;
    UPDATE pedidos SET estado = 'aprobado_calidad' WHERE id = v_orden.pedido_id;

    -- Sumar al stock terminado por cada ítem del pedido
    FOR v_pi IN SELECT * FROM pedido_items WHERE pedido_id = v_orden.pedido_id LOOP
        UPDATE producto_variantes
        SET stock_terminado = stock_terminado + v_pi.cantidad
        WHERE id = v_pi.producto_variante_id;
    END LOOP;

    RETURN jsonb_build_object('aprobada', true, 'mensaje', 'Calidad aprobada. Stock actualizado.');
END;
$$ LANGUAGE plpgsql;

-- ── FUNCIÓN: recibir materia prima (rama compra) ─────────────────────────────
CREATE OR REPLACE FUNCTION recibir_materia_compra(p_solicitud_id UUID)
RETURNS VOID AS $$
DECLARE
    v_item RECORD;
BEGIN
    FOR v_item IN SELECT * FROM solicitud_compra_items WHERE solicitud_id = p_solicitud_id LOOP
        UPDATE materia_prima SET stock_actual = stock_actual + v_item.cantidad_necesaria
        WHERE id = v_item.materia_prima_id;
        UPDATE solicitud_compra_items SET cantidad_recibida = v_item.cantidad_necesaria
        WHERE id = v_item.id;
        INSERT INTO ingresos_materia (solicitud_id, materia_prima_id, cantidad)
        VALUES (p_solicitud_id, v_item.materia_prima_id, v_item.cantidad_necesaria);
    END LOOP;
    UPDATE solicitudes_compra SET estado = 'recibida' WHERE id = p_solicitud_id;
    UPDATE pedidos SET estado = 'materia_recibida'
    WHERE id = (SELECT pedido_id FROM solicitudes_compra WHERE id = p_solicitud_id);
END;
$$ LANGUAGE plpgsql;

-- ── VISTAS KPI ───────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_kpis AS
SELECT
    (SELECT COUNT(*) FROM pedidos WHERE estado NOT IN ('completado', 'cancelado')) AS pedidos_activos,
    (SELECT COUNT(*) FROM ordenes_produccion WHERE estado NOT IN ('completada', 'cancelada')) AS ordenes_activas,
    (SELECT COUNT(*) FROM alertas_produccion WHERE activa = true) AS alertas_activas,
    (SELECT COALESCE(SUM(stock_terminado), 0) FROM producto_variantes) AS stock_total,
    (SELECT COUNT(*) FROM inspecciones_calidad WHERE aprobada = true) AS inspecciones_aprobadas,
    (SELECT COUNT(*) FROM entregas WHERE estado = 'entregado') AS entregas_realizadas,
    (SELECT ROUND(AVG(porcentaje_avance)::NUMERIC, 1) FROM ordenes_produccion WHERE estado = 'completada') AS eficiencia_promedio;

CREATE OR REPLACE VIEW vista_pedidos_proceso AS
SELECT p.id, p.numero, c.nombre AS cliente, p.fecha, p.estado, p.fecha_entrega_planeada,
       COUNT(pi.id) AS items
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
GROUP BY p.id, c.nombre;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE materia_prima ENABLE ROW LEVEL SECURITY;
ALTER TABLE suministros ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_materia ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_suministros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos_materia ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_calidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones_calidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspeccion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t TEXT; BEGIN
    FOREACH t IN ARRAY ARRAY[
        'perfiles','proveedores','productos','colores','tallas','producto_variantes',
        'clientes','materia_prima','suministros','receta_materia','receta_suministros',
        'pedidos','pedido_items','solicitudes_compra','solicitud_compra_items',
        'ingresos_materia','ordenes_produccion','consumo_produccion','avances_produccion',
        'alertas_produccion','criterios_calidad','inspecciones_calidad','inspeccion_items','entregas'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS acceso_publico ON %I', t);
        EXECUTE format('CREATE POLICY acceso_publico ON %I FOR ALL USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON vista_kpis TO anon, authenticated;
GRANT SELECT ON vista_pedidos_proceso TO anon, authenticated;

-- =============================================================================
-- DATOS INICIALES (Excel + Word)
-- =============================================================================

-- Roles / perfiles
INSERT INTO perfiles (nombre, email, rol) VALUES
    ('Ana Supervisora', 'supervisora@martin.com', 'supervisora'),
    ('Carlos Maquilador', 'maquiladora@martin.com', 'maquiladora'),
    ('María Maquiladora Norte', 'maria.maquila@martin.com', 'maquiladora');

-- Proveedores (Excel filas 2-8)
INSERT INTO proveedores (nombre, correo, telefono, direccion) VALUES
    ('TEXTILES ALMACENES PRUBELA', 'almacenespuebla@hotmail.com', '09294-77790', 'Centro Histórico'),
    ('TEXTILES BUENAÑO', 'textilbuenano15@gmail.com', '0992 739 586', 'Ambato'),
    ('Multitextil', 'multitextilinfo@gmail.com', '098 774 0325', 'Centro Histórico'),
    ('Eratex', 'eratex12@hotmail.com', '980539365', 'Parque de la Concepción'),
    ('Varitex', 'varitex45@hotmail.com', '982130396', 'Centro Histórico'),
    ('Neymatex', 'neymatex_r@gmail.com', '980229518', 'Centro Histórico'),
    ('Solutex', 'solutexrt@htomail.ec', '983585437', 'Ulloa');

-- Producto CAMILA
INSERT INTO productos (nombre, precio_base) VALUES ('CAMILA', 25.00);

-- Colores (Excel)
INSERT INTO colores (nombre) VALUES
    ('AZUL MARINO'), ('GRIS'), ('LILA'), ('NEGRO'), ('VINO'),
    ('BLANCO'), ('VERDE QUIRURGICO'), ('AZUL PETROLEO'), ('FUCSIA');

-- Tallas
INSERT INTO tallas (nombre) VALUES ('S'), ('M'), ('L');

-- Variantes CAMILA (Excel: stock 10 S, 15 M, 15 L por color)
DO $$
DECLARE
    v_prod UUID;
    v_color RECORD;
    v_talla RECORD;
    v_stock INTEGER;
BEGIN
    SELECT id INTO v_prod FROM productos WHERE nombre = 'CAMILA';
    FOR v_color IN SELECT id, nombre FROM colores LOOP
        FOR v_talla IN SELECT id, nombre FROM tallas LOOP
            v_stock := CASE v_talla.nombre WHEN 'S' THEN 10 ELSE 15 END;
            INSERT INTO producto_variantes (producto_id, color_id, talla_id, precio, stock_terminado)
            VALUES (v_prod, v_color.id, v_talla.id, 25.00, v_stock);
        END LOOP;
    END LOOP;
END $$;

-- Materia prima por proveedor (Excel)
DO $$
DECLARE
    v_prov RECORD;
    v_mp_id UUID;
BEGIN
    FOR v_prov IN SELECT id, nombre FROM proveedores LOOP
        INSERT INTO materia_prima (proveedor_id, nombre, precio, stock_actual)
        VALUES (v_prov.id,
            CASE v_prov.nombre
                WHEN 'TEXTILES ALMACENES PRUBELA' THEN '220 EL ROLLO 2.80x M'
                WHEN 'TEXTILES BUENAÑO' THEN '230 EL ROLLO 2.80M'
                WHEN 'Multitextil' THEN '220 EL ROLLO 2.80 M'
                WHEN 'Eratex' THEN '220 EL ROLLO 2.80'
                WHEN 'Varitex' THEN '220 EL ROLLO 2.80M'
                WHEN 'Neymatex' THEN '220 EL ROLLO 2.80M'
                ELSE '210 EL ROLLO'
            END,
            CASE v_prov.nombre WHEN 'Multitextil' THEN 2.30 ELSE 2.10 END,
            500
        ) RETURNING id INTO v_mp_id;
    END LOOP;
END $$;

-- Suministros
INSERT INTO suministros (nombre, tipo, precio, stock_actual) VALUES
    ('ELASTICO 6 SEMIREFORZADO', 'elastico', 2.10, 200),
    ('TELA REFUERZO', 'tela', 3.50, 150),
    ('HILO POLIESTER', 'hilo', 1.20, 500),
    ('BOTON', 'boton', 0.15, 1000),
    ('CIERRE METALICO', 'cierre', 0.80, 300),
    ('ETIQUETA', 'etiqueta', 0.10, 800);

-- Receta materia (metros por talla del Excel)
DO $$
DECLARE
    v_prod UUID;
    v_mp UUID;
    v_talla RECORD;
    v_metros NUMERIC;
BEGIN
    SELECT id INTO v_prod FROM productos WHERE nombre = 'CAMILA';
    SELECT id INTO v_mp FROM materia_prima LIMIT 1;
    FOR v_talla IN SELECT id, nombre FROM tallas LOOP
        v_metros := CASE v_talla.nombre WHEN 'L' THEN 2.30 ELSE 2.10 END;
        INSERT INTO receta_materia (producto_id, talla_id, materia_prima_id, cantidad_metros)
        VALUES (v_prod, v_talla.id, v_mp, v_metros);
    END LOOP;
END $$;

-- Receta suministros por unidad CAMILA
DO $$
DECLARE
    v_prod UUID;
BEGIN
    SELECT id INTO v_prod FROM productos WHERE nombre = 'CAMILA';
    INSERT INTO receta_suministros (producto_id, suministro_id, cantidad_unidad)
    SELECT v_prod, id,
        CASE nombre
            WHEN 'ELASTICO 6 SEMIREFORZADO' THEN 0.5
            WHEN 'HILO POLIESTER' THEN 1.0
            WHEN 'BOTON' THEN 6
            WHEN 'CIERRE METALICO' THEN 1
            WHEN 'ETIQUETA' THEN 1
            ELSE 0.2
        END
    FROM suministros;
END $$;

-- Clientes ejemplo
INSERT INTO clientes (nombre, contacto, telefono) VALUES
    ('Clínica San Rafael', 'Dra. Pérez', '02-2345678'),
    ('Hospital Central', 'Ing. Torres', '02-3456789'),
    ('Laboratorio BioMed', 'Lic. Castro', '02-4567890');

-- Criterios de calidad (documento Word)
INSERT INTO criterios_calidad (codigo, parametro, criterio, metodo, criticidad) VALUES
(1, 'Integridad de la prenda', 'La prenda no presenta roturas, perforaciones, deformaciones ni daños físicos.', 'Inspección visual', 'Alta'),
(2, 'Cumplimiento de talla y medidas', 'Las dimensiones corresponden a la ficha técnica y a la talla solicitada por el cliente.', 'Medición con cinta métrica', 'Alta'),
(3, 'Calidad de costuras', 'Las costuras son rectas, uniformes, resistentes y no presentan aperturas ni puntadas defectuosas.', 'Inspección visual y manual', 'Alta'),
(4, 'Limpieza y ausencia de manchas', 'La prenda está libre de manchas, suciedad, residuos de tela, grasa, tinta o cualquier contaminante.', 'Inspección visual', 'Alta'),
(5, 'Acabado de confección', 'No presenta hilos sueltos, remates incompletos ni defectos visibles de terminación.', 'Inspección visual', 'Media'),
(6, 'Calidad del bordado o estampado', 'El bordado o estampado coincide con el diseño aprobado, mantiene la posición correcta y no presenta errores.', 'Comparación con ficha técnica', 'Alta'),
(7, 'Funcionamiento de accesorios', 'Botones, cierres, broches y velcros se encuentran completos, correctamente instalados y funcionan adecuadamente.', 'Verificación funcional', 'Alta'),
(8, 'Simetría y presentación', 'Los componentes de la prenda se encuentran alineados y proporcionados.', 'Inspección visual', 'Media'),
(9, 'Planchado y presentación final', 'La prenda está correctamente planchada, sin arrugas pronunciadas y lista para su entrega.', 'Inspección visual', 'Baja'),
(10, 'Conformidad con la orden de producción', 'El modelo, color, talla, cantidad y personalización coinciden con la orden aprobada.', 'Verificación documental', 'Alta');

-- Verificación
SELECT '✅ Esquema MARTIN Company v2 creado' AS estado;
SELECT * FROM vista_kpis;
SELECT COUNT(*) AS variantes FROM producto_variantes;
SELECT COUNT(*) AS criterios FROM criterios_calidad;
