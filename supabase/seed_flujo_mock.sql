-- =============================================================================
-- MARTIN Company — Datos de prueba (flujo completo mock)
-- Ejecutar DESPUÉS de martin_company.sql en el SQL Editor de Supabase
-- =============================================================================
-- Escenarios:
--   PED-001  completado      → flujo feliz (pedido → OP → calidad → entrega)
--   PED-002  en_produccion   → avance 45 %, a tiempo
--   PED-003  stock_insuficiente → solicitud de compra pendiente
--   PED-004  materia_recibida → listo para generar OP
--   PED-005  control_calidad → avance 100 %, pendiente inspección
--   PED-006  aprobado_calidad → listo para entregar
--   PED-007  en_produccion   → retraso con alerta activa
-- =============================================================================

-- Limpiar datos transaccionales previos (conserva catálogos)
TRUNCATE
    inspeccion_items,
    inspecciones_calidad,
    alertas_produccion,
    avances_produccion,
    consumo_produccion,
    ordenes_produccion,
    ingresos_materia,
    solicitud_compra_items,
    solicitudes_compra,
    entregas,
    pedido_items,
    pedidos
RESTART IDENTITY CASCADE;

DO $$
DECLARE
    -- Perfiles
    v_sup   UUID;
    v_maq1  UUID;
    v_maq2  UUID;
    -- Clientes
    v_cli1  UUID;
    v_cli2  UUID;
    v_cli3  UUID;
    -- Variantes CAMILA
    v_var_azul_s  UUID;
    v_var_azul_m  UUID;
    v_var_negro_l UUID;
    v_var_blanco_m UUID;
    v_var_vino_s  UUID;
    v_var_gris_m  UUID;
    -- Materia / suministros
    v_mp    UUID;
    v_sum_hilo UUID;
    v_sum_boton UUID;
    -- Pedidos
    v_p1 UUID; v_p2 UUID; v_p3 UUID; v_p4 UUID;
    v_p5 UUID; v_p6 UUID; v_p7 UUID;
    -- Órdenes / calidad / compra
    v_op1 UUID; v_op2 UUID; v_op5 UUID; v_op6 UUID; v_op7 UUID;
    v_insp UUID;
    v_sol  UUID;
    v_crit RECORD;
BEGIN
    -- ── Resolver IDs de catálogo ─────────────────────────────────────────────
    SELECT id INTO v_sup  FROM perfiles WHERE email = 'supervisora@martin.com';
    SELECT id INTO v_maq1 FROM perfiles WHERE email = 'maquiladora@martin.com';
    SELECT id INTO v_maq2 FROM perfiles WHERE email = 'maria.maquila@martin.com';

    SELECT id INTO v_cli1 FROM clientes WHERE nombre = 'Clínica San Rafael';
    SELECT id INTO v_cli2 FROM clientes WHERE nombre = 'Hospital Central';
    SELECT id INTO v_cli3 FROM clientes WHERE nombre = 'Laboratorio BioMed';

    SELECT pv.id INTO v_var_azul_s
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'AZUL MARINO' AND t.nombre = 'S';

    SELECT pv.id INTO v_var_azul_m
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'AZUL MARINO' AND t.nombre = 'M';

    SELECT pv.id INTO v_var_negro_l
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'NEGRO' AND t.nombre = 'L';

    SELECT pv.id INTO v_var_blanco_m
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'BLANCO' AND t.nombre = 'M';

    SELECT pv.id INTO v_var_vino_s
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'VINO' AND t.nombre = 'S';

    SELECT pv.id INTO v_var_gris_m
    FROM producto_variantes pv
    JOIN productos p ON p.id = pv.producto_id
    JOIN colores c ON c.id = pv.color_id
    JOIN tallas t ON t.id = pv.talla_id
    WHERE p.nombre = 'CAMILA' AND c.nombre = 'GRIS' AND t.nombre = 'M';

    SELECT id INTO v_mp FROM materia_prima ORDER BY created_at LIMIT 1;
    SELECT id INTO v_sum_hilo FROM suministros WHERE nombre = 'HILO POLIESTER';
    SELECT id INTO v_sum_boton FROM suministros WHERE nombre = 'BOTON';

    -- Stock de materia: suficiente para la mayoría, bajo para forzar compra en PED-003
    UPDATE materia_prima SET stock_actual = 400 WHERE id = v_mp;
    UPDATE materia_prima SET stock_actual = 5
    WHERE id IN (SELECT id FROM materia_prima WHERE id <> v_mp LIMIT 1);

    -- =========================================================================
    -- PED-001 — COMPLETADO (flujo feliz cerrado)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-001', v_cli1, CURRENT_DATE - 20, CURRENT_DATE - 5, 'completado',
            'Pedido demo: flujo completo cerrado')
    RETURNING id INTO v_p1;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p1, v_var_azul_s, 10),
        (v_p1, v_var_azul_m, 15);

    INSERT INTO ordenes_produccion (
        pedido_id, maquiladora_id, estado, fecha_inicio, fecha_fin_planeada,
        fecha_fin_real, porcentaje_avance
    ) VALUES (
        v_p1, v_maq1, 'completada', CURRENT_DATE - 18, CURRENT_DATE - 8,
        CURRENT_DATE - 7, 100
    ) RETURNING id INTO v_op1;

    INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
    VALUES (v_op1, v_mp, 52.50); -- 10*2.10 + 15*2.10
    INSERT INTO consumo_produccion (orden_id, suministro_id, cantidad)
    VALUES (v_op1, v_sum_hilo, 25), (v_op1, v_sum_boton, 150);

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por, fecha) VALUES
        (v_op1, 30, 'Corte terminado', v_maq1, CURRENT_DATE - 16),
        (v_op1, 70, 'Maquila en curso', v_maq1, CURRENT_DATE - 12),
        (v_op1, 100, 'Producción finalizada', v_maq1, CURRENT_DATE - 8);

    INSERT INTO inspecciones_calidad (orden_id, supervisor_id, fecha, aprobada, observaciones)
    VALUES (v_op1, v_sup, CURRENT_DATE - 7, true, 'Lote aprobado sin observaciones')
    RETURNING id INTO v_insp;

    FOR v_crit IN SELECT id FROM criterios_calidad LOOP
        INSERT INTO inspeccion_items (inspeccion_id, criterio_id, cumple)
        VALUES (v_insp, v_crit.id, true);
    END LOOP;

    INSERT INTO entregas (pedido_id, fecha_entrega, responsable_id, estado)
    VALUES (v_p1, CURRENT_DATE - 5, v_sup, 'entregado');

    -- =========================================================================
    -- PED-002 — EN PRODUCCIÓN (avance 45 %, a tiempo)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-002', v_cli2, CURRENT_DATE - 5, CURRENT_DATE + 10, 'en_produccion',
            'Pedido demo: producción en curso')
    RETURNING id INTO v_p2;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p2, v_var_negro_l, 20);

    INSERT INTO ordenes_produccion (
        pedido_id, maquiladora_id, estado, fecha_inicio, fecha_fin_planeada, porcentaje_avance
    ) VALUES (
        v_p2, v_maq1, 'avance', CURRENT_DATE - 4, CURRENT_DATE + 5, 45
    ) RETURNING id INTO v_op2;

    INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
    VALUES (v_op2, v_mp, 46.00); -- 20 * 2.30

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por, fecha) VALUES
        (v_op2, 20, 'Inicio de corte', v_maq1, CURRENT_DATE - 3),
        (v_op2, 45, 'Corte avanzado, inicia maquila', v_maq1, CURRENT_DATE - 1);

    -- =========================================================================
    -- PED-003 — STOCK INSUFICIENTE (solicitud de compra pendiente)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-003', v_cli3, CURRENT_DATE - 1, CURRENT_DATE + 14, 'stock_insuficiente',
            'Pedido demo: falta materia → compra')
    RETURNING id INTO v_p3;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p3, v_var_blanco_m, 80); -- 80 * 2.10 = 168 m (más de lo disponible en algunos escenarios)

    INSERT INTO solicitudes_compra (pedido_id, estado, fecha)
    VALUES (v_p3, 'pendiente', CURRENT_DATE - 1)
    RETURNING id INTO v_sol;

    INSERT INTO solicitud_compra_items (solicitud_id, materia_prima_id, cantidad_necesaria, cantidad_recibida)
    VALUES (v_sol, v_mp, 168.00, 0);

    -- =========================================================================
    -- PED-004 — MATERIA RECIBIDA (listo para generar OP)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-004', v_cli1, CURRENT_DATE, CURRENT_DATE + 12, 'materia_recibida',
            'Pedido demo: stock OK, generar orden de producción')
    RETURNING id INTO v_p4;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p4, v_var_vino_s, 12),
        (v_p4, v_var_gris_m, 8);

    -- =========================================================================
    -- PED-005 — CONTROL DE CALIDAD (avance 100 %, pendiente inspección)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-005', v_cli2, CURRENT_DATE - 12, CURRENT_DATE + 2, 'control_calidad',
            'Pedido demo: listo para inspección de calidad')
    RETURNING id INTO v_p5;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p5, v_var_azul_m, 25);

    INSERT INTO ordenes_produccion (
        pedido_id, maquiladora_id, estado, fecha_inicio, fecha_fin_planeada, porcentaje_avance
    ) VALUES (
        v_p5, v_maq2, 'control_calidad', CURRENT_DATE - 11, CURRENT_DATE - 1, 100
    ) RETURNING id INTO v_op5;

    INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
    VALUES (v_op5, v_mp, 52.50);

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por, fecha) VALUES
        (v_op5, 50, 'Mitad de lote cosido', v_maq2, CURRENT_DATE - 6),
        (v_op5, 100, 'Lote terminado, enviar a calidad', v_maq2, CURRENT_DATE - 1);

    -- =========================================================================
    -- PED-006 — APROBADO CALIDAD (listo para entregar)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-006', v_cli3, CURRENT_DATE - 15, CURRENT_DATE + 1, 'aprobado_calidad',
            'Pedido demo: calidad OK, registrar entrega')
    RETURNING id INTO v_p6;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p6, v_var_negro_l, 10);

    INSERT INTO ordenes_produccion (
        pedido_id, maquiladora_id, estado, fecha_inicio, fecha_fin_planeada,
        fecha_fin_real, porcentaje_avance
    ) VALUES (
        v_p6, v_maq2, 'completada', CURRENT_DATE - 14, CURRENT_DATE - 3,
        CURRENT_DATE - 2, 100
    ) RETURNING id INTO v_op6;

    INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
    VALUES (v_op6, v_mp, 23.00);

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por, fecha)
    VALUES (v_op6, 100, 'Producción completa', v_maq2, CURRENT_DATE - 3);

    INSERT INTO inspecciones_calidad (orden_id, supervisor_id, fecha, aprobada, observaciones)
    VALUES (v_op6, v_sup, CURRENT_DATE - 2, true, 'Aprobado — listo para empaque y entrega')
    RETURNING id INTO v_insp;

    FOR v_crit IN SELECT id FROM criterios_calidad LOOP
        INSERT INTO inspeccion_items (inspeccion_id, criterio_id, cumple)
        VALUES (v_insp, v_crit.id, true);
    END LOOP;

    -- =========================================================================
    -- PED-007 — EN PRODUCCIÓN CON RETRASO (alerta activa)
    -- =========================================================================
    INSERT INTO pedidos (numero, cliente_id, fecha, fecha_entrega_planeada, estado, notas)
    VALUES ('PED-007', v_cli1, CURRENT_DATE - 18, CURRENT_DATE - 2, 'en_produccion',
            'Pedido demo: retraso en producción')
    RETURNING id INTO v_p7;

    INSERT INTO pedido_items (pedido_id, producto_variante_id, cantidad) VALUES
        (v_p7, v_var_blanco_m, 30);

    INSERT INTO ordenes_produccion (
        pedido_id, maquiladora_id, estado, fecha_inicio, fecha_fin_planeada, porcentaje_avance
    ) VALUES (
        v_p7, v_maq1, 'avance', CURRENT_DATE - 16, CURRENT_DATE - 3, 60
    ) RETURNING id INTO v_op7;

    INSERT INTO consumo_produccion (orden_id, materia_prima_id, cantidad)
    VALUES (v_op7, v_mp, 63.00);

    INSERT INTO avances_produccion (orden_id, porcentaje, descripcion, registrado_por, fecha) VALUES
        (v_op7, 30, 'Retraso por falta de personal', v_maq1, CURRENT_DATE - 10),
        (v_op7, 60, 'Recuperando ritmo', v_maq1, CURRENT_DATE - 2);

    INSERT INTO alertas_produccion (orden_id, tipo, mensaje, activa)
    VALUES (
        v_op7, 'retraso',
        'La orden superó la fecha planeada con avance al 60%',
        true
    );

    RAISE NOTICE '✅ Flujo mock cargado: PED-001 … PED-007';
END $$;

-- Verificación rápida
SELECT numero, estado, notas FROM pedidos ORDER BY numero;
SELECT * FROM vista_kpis;
SELECT p.numero, o.estado AS op_estado, o.porcentaje_avance, o.fecha_fin_planeada
FROM ordenes_produccion o
JOIN pedidos p ON p.id = o.pedido_id
ORDER BY p.numero;
