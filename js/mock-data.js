/**
 * MARTIN Company — Mock data (sin SQL / sin Supabase)
 * Actívalo con window.USE_MOCK_DATA = true en supabase-config.js
 * Persiste cambios en localStorage durante la sesión de demo.
 */
(function () {
    "use strict";

    if (!window.USE_MOCK_DATA) return;

    var STORAGE_KEY = "martin_mock_store_v2";

    function uid(prefix) {
        return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 10);
    }

    function hoy(offsetDias) {
        var d = new Date();
        d.setDate(d.getDate() + (offsetDias || 0));
        return d.toISOString().slice(0, 10);
    }

    function ahora(offsetDias) {
        var d = new Date();
        d.setDate(d.getDate() + (offsetDias || 0));
        return d.toISOString();
    }

    function crearStoreInicial() {
        var sup = { id: "perf-sup", nombre: "Ana Supervisora", email: "supervisora@martin.com", password: "Ana2026", rol: "supervisora", activo: true, created_at: ahora(-30) };
        var maq1 = { id: "perf-maq1", nombre: "Carlos Maquilador", email: "maquiladora@martin.com", password: "Carlos2026", rol: "maquiladora", activo: true, created_at: ahora(-30) };
        var maq2 = { id: "perf-maq2", nombre: "María Maquiladora Norte", email: "maria.maquila@martin.com", password: "Maria2026", rol: "maquiladora", activo: true, created_at: ahora(-30) };

        var cli1 = { id: "cli-1", nombre: "Clínica San Rafael", contacto: "Dra. Pérez", telefono: "02-2345678", created_at: ahora(-20) };
        var cli2 = { id: "cli-2", nombre: "Hospital Central", contacto: "Ing. Torres", telefono: "02-3456789", created_at: ahora(-20) };
        var cli3 = { id: "cli-3", nombre: "Laboratorio BioMed", contacto: "Lic. Castro", telefono: "02-4567890", created_at: ahora(-20) };

        var prod = { id: "prod-camila", nombre: "CAMILA", precio_base: 25, activo: true, created_at: ahora(-30) };
        var colores = [
            { id: "col-azul", nombre: "AZUL MARINO" },
            { id: "col-gris", nombre: "GRIS" },
            { id: "col-negro", nombre: "NEGRO" },
            { id: "col-blanco", nombre: "BLANCO" },
            { id: "col-vino", nombre: "VINO" }
        ];
        var tallas = [
            { id: "tal-s", nombre: "S" },
            { id: "tal-m", nombre: "M" },
            { id: "tal-l", nombre: "L" }
        ];

        var variantes = [];
        colores.forEach(function (c) {
            tallas.forEach(function (t) {
                variantes.push({
                    id: "var-" + c.id + "-" + t.id,
                    producto_id: prod.id,
                    color_id: c.id,
                    talla_id: t.id,
                    precio: 25,
                    stock_terminado: t.nombre === "S" ? 10 : 15,
                    created_at: ahora(-30),
                    productos: { nombre: prod.nombre },
                    colores: { nombre: c.nombre },
                    tallas: { nombre: t.nombre }
                });
            });
        });

        function varId(color, talla) {
            return variantes.find(function (v) {
                return v.colores.nombre === color && v.tallas.nombre === talla;
            }).id;
        }

        var prov = { id: "prov-1", nombre: "TEXTILES ALMACENES PRUBELA", correo: "almacenespuebla@hotmail.com", telefono: "09294-77790", direccion: "Centro Histórico", created_at: ahora(-30) };

        var mp = {
            id: "mp-1",
            proveedor_id: prov.id,
            nombre: "220 EL ROLLO 2.80x M",
            precio: 2.10,
            unidad: "metros",
            stock_actual: 400,
            created_at: ahora(-30),
            updated_at: ahora(-30),
            proveedores: { nombre: prov.nombre }
        };

        var suministros = [
            { id: "sum-1", nombre: "ELASTICO 6 SEMIREFORZADO", tipo: "elastico", precio: 2.10, stock_actual: 200, created_at: ahora(-30), updated_at: ahora(-30) },
            { id: "sum-2", nombre: "HILO POLIESTER", tipo: "hilo", precio: 1.20, stock_actual: 500, created_at: ahora(-30), updated_at: ahora(-30) },
            { id: "sum-3", nombre: "BOTON", tipo: "boton", precio: 0.15, stock_actual: 1000, created_at: ahora(-30), updated_at: ahora(-30) },
            { id: "sum-4", nombre: "CIERRE METALICO", tipo: "cierre", precio: 0.80, stock_actual: 300, created_at: ahora(-30), updated_at: ahora(-30) },
            { id: "sum-5", nombre: "ETIQUETA", tipo: "etiqueta", precio: 0.10, stock_actual: 800, created_at: ahora(-30), updated_at: ahora(-30) }
        ];

        var criterios = [
            { id: "crit-1", codigo: 1, parametro: "Integridad de la prenda", criterio: "Sin roturas ni daños físicos.", metodo: "Inspección visual", criticidad: "Alta" },
            { id: "crit-2", codigo: 2, parametro: "Cumplimiento de talla y medidas", criterio: "Dimensiones según ficha técnica.", metodo: "Cinta métrica", criticidad: "Alta" },
            { id: "crit-3", codigo: 3, parametro: "Calidad de costuras", criterio: "Costuras rectas y resistentes.", metodo: "Inspección visual y manual", criticidad: "Alta" },
            { id: "crit-4", codigo: 4, parametro: "Limpieza y ausencia de manchas", criterio: "Libre de manchas y residuos.", metodo: "Inspección visual", criticidad: "Alta" },
            { id: "crit-5", codigo: 5, parametro: "Acabado de confección", criterio: "Sin hilos sueltos ni remates incompletos.", metodo: "Inspección visual", criticidad: "Media" },
            { id: "crit-6", codigo: 6, parametro: "Calidad del bordado o estampado", criterio: "Coincide con diseño aprobado.", metodo: "Comparación con ficha", criticidad: "Alta" },
            { id: "crit-7", codigo: 7, parametro: "Funcionamiento de accesorios", criterio: "Botones y cierres correctos.", metodo: "Verificación funcional", criticidad: "Alta" },
            { id: "crit-8", codigo: 8, parametro: "Simetría y presentación", criterio: "Componentes alineados.", metodo: "Inspección visual", criticidad: "Media" },
            { id: "crit-9", codigo: 9, parametro: "Planchado y presentación final", criterio: "Prenda planchada y lista.", metodo: "Inspección visual", criticidad: "Baja" },
            { id: "crit-10", codigo: 10, parametro: "Conformidad con la orden", criterio: "Modelo, color, talla y cantidad correctos.", metodo: "Verificación documental", criticidad: "Alta" }
        ];

        // ── Pedidos del flujo demo ──────────────────────────────────────────
        var p1 = { id: "ped-001", numero: "PED-001", cliente_id: cli1.id, fecha: hoy(-20), fecha_entrega_planeada: hoy(-5), estado: "completado", notas: "Flujo completo cerrado", created_at: ahora(-20), updated_at: ahora(-5) };
        var p2 = { id: "ped-002", numero: "PED-002", cliente_id: cli2.id, fecha: hoy(-5), fecha_entrega_planeada: hoy(10), estado: "en_produccion", notas: "Producción en curso", created_at: ahora(-5), updated_at: ahora(-1) };
        var p3 = { id: "ped-003", numero: "PED-003", cliente_id: cli3.id, fecha: hoy(-1), fecha_entrega_planeada: hoy(14), estado: "stock_insuficiente", notas: "Falta materia → compra", created_at: ahora(-1), updated_at: ahora(-1) };
        var p4 = { id: "ped-004", numero: "PED-004", cliente_id: cli1.id, fecha: hoy(0), fecha_entrega_planeada: hoy(12), estado: "materia_recibida", notas: "Listo para generar OP", created_at: ahora(0), updated_at: ahora(0) };
        var p5 = { id: "ped-005", numero: "PED-005", cliente_id: cli2.id, fecha: hoy(-12), fecha_entrega_planeada: hoy(2), estado: "control_calidad", notas: "Pendiente inspección", created_at: ahora(-12), updated_at: ahora(-1) };
        var p6 = { id: "ped-006", numero: "PED-006", cliente_id: cli3.id, fecha: hoy(-15), fecha_entrega_planeada: hoy(1), estado: "aprobado_calidad", notas: "Listo para entregar", created_at: ahora(-15), updated_at: ahora(-2) };
        var p7 = { id: "ped-007", numero: "PED-007", cliente_id: cli1.id, fecha: hoy(-18), fecha_entrega_planeada: hoy(-2), estado: "en_produccion", notas: "Retraso en producción", created_at: ahora(-18), updated_at: ahora(-2) };

        function item(pedidoId, varianteId, cant) {
            var v = variantes.find(function (x) { return x.id === varianteId; });
            return {
                id: uid("pi"),
                pedido_id: pedidoId,
                producto_variante_id: varianteId,
                cantidad: cant,
                producto_variantes: {
                    id: v.id,
                    productos: v.productos,
                    colores: v.colores,
                    tallas: v.tallas
                }
            };
        }

        var pedido_items = [
            item(p1.id, varId("AZUL MARINO", "S"), 10),
            item(p1.id, varId("AZUL MARINO", "M"), 15),
            item(p2.id, varId("NEGRO", "L"), 20),
            item(p3.id, varId("BLANCO", "M"), 80),
            item(p4.id, varId("VINO", "S"), 12),
            item(p4.id, varId("GRIS", "M"), 8),
            item(p5.id, varId("AZUL MARINO", "M"), 25),
            item(p6.id, varId("NEGRO", "L"), 10),
            item(p7.id, varId("BLANCO", "M"), 30)
        ];

        var op1 = { id: "op-001", pedido_id: p1.id, maquiladora_id: maq1.id, estado: "completada", fecha_inicio: hoy(-18), fecha_fin_planeada: hoy(-8), fecha_fin_real: hoy(-7), porcentaje_avance: 100, created_at: ahora(-18), updated_at: ahora(-7), pedidos: { numero: p1.numero, estado: p1.estado }, perfiles: { nombre: maq1.nombre } };
        var op2 = { id: "op-002", pedido_id: p2.id, maquiladora_id: maq1.id, estado: "avance", fecha_inicio: hoy(-4), fecha_fin_planeada: hoy(5), fecha_fin_real: null, porcentaje_avance: 45, created_at: ahora(-4), updated_at: ahora(-1), pedidos: { numero: p2.numero, estado: p2.estado }, perfiles: { nombre: maq1.nombre } };
        var op5 = { id: "op-005", pedido_id: p5.id, maquiladora_id: maq2.id, estado: "control_calidad", fecha_inicio: hoy(-11), fecha_fin_planeada: hoy(-1), fecha_fin_real: null, porcentaje_avance: 100, created_at: ahora(-11), updated_at: ahora(-1), pedidos: { numero: p5.numero, estado: p5.estado }, perfiles: { nombre: maq2.nombre } };
        var op6 = { id: "op-006", pedido_id: p6.id, maquiladora_id: maq2.id, estado: "completada", fecha_inicio: hoy(-14), fecha_fin_planeada: hoy(-3), fecha_fin_real: hoy(-2), porcentaje_avance: 100, created_at: ahora(-14), updated_at: ahora(-2), pedidos: { numero: p6.numero, estado: p6.estado }, perfiles: { nombre: maq2.nombre } };
        var op7 = { id: "op-007", pedido_id: p7.id, maquiladora_id: maq1.id, estado: "avance", fecha_inicio: hoy(-16), fecha_fin_planeada: hoy(-3), fecha_fin_real: null, porcentaje_avance: 60, created_at: ahora(-16), updated_at: ahora(-2), pedidos: { numero: p7.numero, estado: p7.estado }, perfiles: { nombre: maq1.nombre } };

        var sol = { id: "sol-003", pedido_id: p3.id, estado: "pendiente", fecha: hoy(-1), created_at: ahora(-1) };

        return {
            perfiles: [sup, maq1, maq2],
            clientes: [cli1, cli2, cli3],
            productos: [prod],
            colores: colores,
            tallas: tallas,
            producto_variantes: variantes,
            proveedores: [prov],
            materia_prima: [mp],
            suministros: suministros,
            criterios_calidad: criterios,
            pedidos: [p1, p2, p3, p4, p5, p6, p7],
            pedido_items: pedido_items,
            solicitudes_compra: [sol],
            solicitud_compra_items: [{ id: "sci-1", solicitud_id: sol.id, materia_prima_id: mp.id, cantidad_necesaria: 168, cantidad_recibida: 0 }],
            ingresos_materia: [],
            ordenes_produccion: [op1, op2, op5, op6, op7],
            consumo_produccion: [],
            avances_produccion: [
                { id: "av-1", orden_id: op2.id, porcentaje: 20, descripcion: "Inicio de corte", registrado_por: maq1.id, fecha: ahora(-3) },
                { id: "av-2", orden_id: op2.id, porcentaje: 45, descripcion: "Corte avanzado", registrado_por: maq1.id, fecha: ahora(-1) },
                { id: "av-3", orden_id: op5.id, porcentaje: 100, descripcion: "Lote terminado", registrado_por: maq2.id, fecha: ahora(-1) },
                { id: "av-4", orden_id: op7.id, porcentaje: 60, descripcion: "Recuperando ritmo", registrado_por: maq1.id, fecha: ahora(-2) }
            ],
            alertas_produccion: [
                { id: "al-1", orden_id: op7.id, tipo: "retraso", mensaje: "La orden superó la fecha planeada con avance al 60%", activa: true, created_at: ahora(-2) }
            ],
            inspecciones_calidad: [
                { id: "insp-1", orden_id: op1.id, supervisor_id: sup.id, fecha: ahora(-7), aprobada: true, observaciones: "Lote aprobado" },
                { id: "insp-2", orden_id: op6.id, supervisor_id: sup.id, fecha: ahora(-2), aprobada: true, observaciones: "Listo para entrega" }
            ],
            inspeccion_items: [],
            entregas: [
                { id: "ent-1", pedido_id: p1.id, fecha_entrega: hoy(-5), responsable_id: sup.id, estado: "entregado", created_at: ahora(-5) }
            ]
        };
    }

    function cargarStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        var store = crearStoreInicial();
        guardarStore(store);
        return store;
    }

    function guardarStore(store) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    var db = cargarStore();

    function tabla(nombre) {
        if (!db[nombre]) db[nombre] = [];
        return db[nombre];
    }

    function findById(nombre, id) {
        return tabla(nombre).find(function (r) { return r.id === id; });
    }

    function enriquecerPedido(p) {
        var cli = findById("clientes", p.cliente_id);
        var items = tabla("pedido_items").filter(function (i) { return i.pedido_id === p.id; });
        return Object.assign({}, p, {
            clientes: { nombre: cli ? cli.nombre : "?" },
            pedido_items: items
        });
    }

    function enriquecerOrden(o) {
        var ped = findById("pedidos", o.pedido_id);
        var maq = findById("perfiles", o.maquiladora_id);
        return Object.assign({}, o, {
            pedidos: ped ? { numero: ped.numero, estado: ped.estado } : null,
            perfiles: maq ? { nombre: maq.nombre } : null
        });
    }

    function enriquecerMateria(m) {
        var p = findById("proveedores", m.proveedor_id);
        return Object.assign({}, m, { proveedores: { nombre: p ? p.nombre : "?" } });
    }

    function calcularKPIs() {
        var stock = tabla("producto_variantes").reduce(function (s, v) { return s + (v.stock_terminado || 0); }, 0);
        var avances = tabla("ordenes_produccion").filter(function (o) { return o.estado === "completada"; });
        var eff = avances.length
            ? Math.round(avances.reduce(function (s, o) { return s + o.porcentaje_avance; }, 0) / avances.length * 10) / 10
            : 0;
        return {
            pedidos_activos: tabla("pedidos").filter(function (p) { return p.estado !== "completado" && p.estado !== "cancelado"; }).length,
            ordenes_activas: tabla("ordenes_produccion").filter(function (o) { return o.estado !== "completada" && o.estado !== "cancelada"; }).length,
            alertas_activas: tabla("alertas_produccion").filter(function (a) { return a.activa; }).length,
            stock_total: stock,
            inspecciones_aprobadas: tabla("inspecciones_calidad").filter(function (i) { return i.aprobada; }).length,
            entregas_realizadas: tabla("entregas").filter(function (e) { return e.estado === "entregado"; }).length,
            eficiencia_promedio: eff
        };
    }

    function metrosPorTalla(tallaNombre) {
        return tallaNombre === "L" ? 2.30 : 2.10;
    }

    function necesidadesPedido(pedidoId) {
        var items = tabla("pedido_items").filter(function (i) { return i.pedido_id === pedidoId; });
        var total = 0;
        items.forEach(function (it) {
            var v = findById("producto_variantes", it.producto_variante_id);
            total += metrosPorTalla(v.tallas.nombre) * it.cantidad;
        });
        var mp = tabla("materia_prima")[0];
        return [{ materia_prima_id: mp.id, nombre_mp: mp.nombre, cantidad_necesaria: total }];
    }

    // ── API pública (misma firma que supabase-client) ───────────────────────

    window.obtenerRegistros = async function (nombre) {
        var rows = tabla(nombre).slice();
        if (nombre === "materia_prima") rows = rows.map(enriquecerMateria);
        if (nombre === "criterios_calidad") rows.sort(function (a, b) { return a.codigo - b.codigo; });
        else if (nombre !== "colores" && nombre !== "tallas") {
            rows.sort(function (a, b) {
                return String(b.created_at || "").localeCompare(String(a.created_at || ""));
            });
        }
        return rows;
    };

    window.insertarRegistro = async function (nombre, registro) {
        var row = Object.assign({}, registro, {
            id: registro.id || uid(nombre.slice(0, 3)),
            created_at: registro.created_at || ahora(0)
        });

        if (nombre === "pedido_items") {
            var v = findById("producto_variantes", row.producto_variante_id);
            if (v) {
                row.producto_variantes = {
                    id: v.id,
                    productos: v.productos,
                    colores: v.colores,
                    tallas: v.tallas
                };
            }
        }

        if (nombre === "materia_prima") {
            var prov = findById("proveedores", row.proveedor_id);
            row.proveedores = { nombre: prov ? prov.nombre : "?" };
            row.updated_at = ahora(0);
        }

        tabla(nombre).unshift(row);
        guardarStore(db);
        return row;
    };

    window.actualizarRegistro = async function (nombre, id, registro) {
        var rows = tabla(nombre);
        var i = rows.findIndex(function (r) { return r.id === id; });
        if (i === -1) return null;
        rows[i] = Object.assign({}, rows[i], registro, { updated_at: ahora(0) });
        guardarStore(db);
        return rows[i];
    };

    window.eliminarRegistro = async function (nombre, id) {
        db[nombre] = tabla(nombre).filter(function (r) { return r.id !== id; });
        guardarStore(db);
        return true;
    };

    window.llamarRPC = async function (nombre, params) {
        params = params || {};

        if (nombre === "verificar_stock_pedido") {
            var nec = necesidadesPedido(params.p_pedido_id);
            var falta = nec.some(function (n) {
                var mp = findById("materia_prima", n.materia_prima_id);
                return !mp || mp.stock_actual < n.cantidad_necesaria;
            });
            if (falta) {
                await window.actualizarRegistro("pedidos", params.p_pedido_id, { estado: "stock_insuficiente" });
                var sol = await window.insertarRegistro("solicitudes_compra", {
                    pedido_id: params.p_pedido_id,
                    estado: "pendiente",
                    fecha: hoy(0)
                });
                for (var i = 0; i < nec.length; i++) {
                    await window.insertarRegistro("solicitud_compra_items", {
                        solicitud_id: sol.id,
                        materia_prima_id: nec[i].materia_prima_id,
                        cantidad_necesaria: nec[i].cantidad_necesaria,
                        cantidad_recibida: 0
                    });
                }
                return { stock_suficiente: false, solicitud_id: sol.id };
            }
            await window.actualizarRegistro("pedidos", params.p_pedido_id, { estado: "materia_recibida" });
            return { stock_suficiente: true };
        }

        if (nombre === "recibir_materia_compra") {
            var solicitud = findById("solicitudes_compra", params.p_solicitud_id);
            if (!solicitud) return null;
            var items = tabla("solicitud_compra_items").filter(function (x) { return x.solicitud_id === solicitud.id; });
            items.forEach(function (it) {
                var mp = findById("materia_prima", it.materia_prima_id);
                if (mp) mp.stock_actual += it.cantidad_necesaria;
                it.cantidad_recibida = it.cantidad_necesaria;
            });
            solicitud.estado = "recibida";
            await window.actualizarRegistro("pedidos", solicitud.pedido_id, { estado: "materia_recibida" });
            guardarStore(db);
            return true;
        }

        if (nombre === "generar_orden_produccion") {
            var ped = findById("pedidos", params.p_pedido_id);
            if (!ped || (ped.estado !== "materia_recibida" && ped.estado !== "stock_insuficiente")) {
                if (window.mostrarError) mostrarError("El pedido no está listo para producción");
                else alert("El pedido no está listo para producción");
                return null;
            }
            var nec2 = necesidadesPedido(params.p_pedido_id);
            nec2.forEach(function (n) {
                var mp = findById("materia_prima", n.materia_prima_id);
                if (mp) mp.stock_actual = Math.max(0, mp.stock_actual - n.cantidad_necesaria);
            });
            var maq = findById("perfiles", params.p_maquiladora_id);
            var orden = await window.insertarRegistro("ordenes_produccion", {
                pedido_id: params.p_pedido_id,
                maquiladora_id: params.p_maquiladora_id,
                estado: "corte",
                fecha_inicio: hoy(0),
                fecha_fin_planeada: hoy(params.p_dias_plazo || 7),
                porcentaje_avance: 0,
                pedidos: { numero: ped.numero, estado: "en_produccion" },
                perfiles: { nombre: maq ? maq.nombre : "?" }
            });
            await window.actualizarRegistro("pedidos", params.p_pedido_id, { estado: "en_produccion" });
            guardarStore(db);
            return orden.id;
        }

        if (nombre === "registrar_avance_produccion") {
            var orden = findById("ordenes_produccion", params.p_orden_id);
            if (!orden) return null;
            await window.insertarRegistro("avances_produccion", {
                orden_id: params.p_orden_id,
                porcentaje: params.p_porcentaje,
                descripcion: params.p_descripcion,
                registrado_por: params.p_registrado_por,
                fecha: ahora(0)
            });
            var retraso = hoy(0) > orden.fecha_fin_planeada && params.p_porcentaje < 100;
            orden.porcentaje_avance = params.p_porcentaje;
            orden.estado = "avance";
            if (retraso) {
                await window.insertarRegistro("alertas_produccion", {
                    orden_id: orden.id,
                    tipo: "retraso",
                    mensaje: "La orden superó la fecha planeada con avance al " + params.p_porcentaje + "%",
                    activa: true
                });
            }
            if (params.p_porcentaje >= 100) {
                orden.estado = "control_calidad";
                await window.actualizarRegistro("pedidos", orden.pedido_id, { estado: "control_calidad" });
            }
            guardarStore(db);
            return { retraso: retraso, porcentaje: params.p_porcentaje };
        }

        if (nombre === "aprobar_inspeccion_calidad") {
            var insp = findById("inspecciones_calidad", params.p_inspeccion_id);
            if (!insp) return null;
            var itemsInsp = tabla("inspeccion_items").filter(function (x) { return x.inspeccion_id === insp.id; });
            var falla = itemsInsp.some(function (it) {
                if (it.cumple) return false;
                var c = findById("criterios_calidad", it.criterio_id);
                return !c || c.criticidad === "Alta" || true;
            });
            // Si algún ítem no cumple → rechazar
            falla = itemsInsp.some(function (it) { return it.cumple === false; });
            if (falla) {
                insp.aprobada = false;
                guardarStore(db);
                return { aprobada: false, mensaje: "No cumple criterios de calidad" };
            }
            insp.aprobada = true;
            var ord = findById("ordenes_produccion", insp.orden_id);
            if (ord) {
                ord.estado = "completada";
                ord.fecha_fin_real = hoy(0);
                await window.actualizarRegistro("pedidos", ord.pedido_id, { estado: "aprobado_calidad" });
                tabla("pedido_items").filter(function (pi) { return pi.pedido_id === ord.pedido_id; }).forEach(function (pi) {
                    var v = findById("producto_variantes", pi.producto_variante_id);
                    if (v) v.stock_terminado += pi.cantidad;
                });
            }
            guardarStore(db);
            return { aprobada: true, mensaje: "Calidad aprobada. Stock actualizado." };
        }

        console.warn("RPC mock no implementada:", nombre);
        return null;
    };

    window.obtenerVariantes = async function () {
        return tabla("producto_variantes").map(function (v) {
            return {
                id: v.id,
                producto: v.productos.nombre,
                color: v.colores.nombre,
                talla: v.tallas.nombre,
                precio: v.precio,
                stock: v.stock_terminado,
                etiqueta: v.productos.nombre + " | " + v.colores.nombre + " | " + v.tallas.nombre
            };
        });
    };

    window.obtenerPedidosCompletos = async function () {
        return tabla("pedidos")
            .slice()
            .sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); })
            .map(enriquecerPedido);
    };

    window.obtenerOrdenes = async function () {
        return tabla("ordenes_produccion")
            .slice()
            .sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); })
            .map(enriquecerOrden);
    };

    window.obtenerKPIs = async function () {
        return calcularKPIs();
    };

    window.obtenerPerfiles = async function (rol) {
        return tabla("perfiles").filter(function (p) {
            return p.activo && (!rol || p.rol === rol);
        }).map(function (p) {
            return { id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, activo: p.activo };
        });
    };

    window.autenticarUsuario = async function (email, password) {
        var correo = String(email || "").trim().toLowerCase();
        var clave = String(password || "");
        var user = tabla("perfiles").find(function (p) {
            return p.activo && String(p.email).toLowerCase() === correo && p.password === clave;
        });
        if (!user) return null;
        return { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
    };

    window.generarNumeroPedido = async function () {
        var max = 0;
        tabla("pedidos").forEach(function (p) {
            var m = String(p.numero || "").match(/PED-(\d+)/i);
            if (m) max = Math.max(max, parseInt(m[1], 10));
        });
        return "PED-" + String(max + 1).padStart(3, "0");
    };

    window.resetMockData = function () {
        localStorage.removeItem(STORAGE_KEY);
        db = crearStoreInicial();
        guardarStore(db);
        if (window.mostrarExito) mostrarExito("Datos restaurados.");
        setTimeout(function () { window.location.reload(); }, 600);
    };
})();
