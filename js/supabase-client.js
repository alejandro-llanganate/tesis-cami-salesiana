(function () {
    "use strict";

    // Sesión siempre disponible (mock o Supabase)
    window.requerirSesion = function () {
        var sesion = sessionStorage.getItem("martin_sesion");
        if (!sesion) {
            window.location.href = "login.html";
            return null;
        }
        return JSON.parse(sesion);
    };

    window.esSupervisora = function () {
        var s = window.requerirSesion();
        return s && s.rol === "supervisora";
    };

    window.cerrarSesion = function () {
        sessionStorage.removeItem("martin_sesion");
        window.location.href = "login.html";
    };

    // API de datos: mock-data.js ya la registró
    if (window.USE_MOCK_DATA) return;

    var supabaseClient = null;

    function initSupabase() {
        if (!window.supabase || !window.supabase.createClient) {
            console.error("Supabase SDK no cargado.");
            return null;
        }
        if (!supabaseClient) {
            supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
        }
        return supabaseClient;
    }

    function manejarError(error, accion) {
        console.error("Supabase:", error);
        var msg = "Error al " + accion + ": " + error.message;
        if (error.message.indexOf("does not exist") !== -1) {
            if (window.mostrarError) mostrarError("Ejecuta supabase/martin_company.sql en Supabase.");
            else alert("Ejecuta supabase/martin_company.sql en Supabase.");
        } else if (window.mostrarError) {
            mostrarError(msg);
        } else {
            alert(msg);
        }
    }

    window.obtenerRegistros = async function (tabla, select) {
        var c = initSupabase();
        if (!c) return [];
        var q = c.from(tabla).select(select || "*");
        if (tabla !== "criterios_calidad" && tabla !== "colores" && tabla !== "tallas") {
            q = q.order("created_at", { ascending: false });
        }
        var r = await q;
        if (r.error) { manejarError(r.error, "consultar " + tabla); return []; }
        return r.data || [];
    };

    window.insertarRegistro = async function (tabla, registro) {
        var c = initSupabase();
        if (!c) return null;
        var r = await c.from(tabla).insert([registro]).select().single();
        if (r.error) { manejarError(r.error, "guardar"); return null; }
        return r.data;
    };

    window.actualizarRegistro = async function (tabla, id, registro) {
        var c = initSupabase();
        if (!c) return null;
        var r = await c.from(tabla).update(registro).eq("id", id).select().single();
        if (r.error) { manejarError(r.error, "actualizar"); return null; }
        return r.data;
    };

    window.eliminarRegistro = async function (tabla, id) {
        var c = initSupabase();
        if (!c) return false;
        var r = await c.from(tabla).delete().eq("id", id);
        if (r.error) { manejarError(r.error, "eliminar"); return false; }
        return true;
    };

    window.llamarRPC = async function (nombre, params) {
        var c = initSupabase();
        if (!c) return null;
        var r = await c.rpc(nombre, params || {});
        if (r.error) { manejarError(r.error, nombre); return null; }
        return r.data;
    };

    window.obtenerVariantes = async function () {
        var c = initSupabase();
        if (!c) return [];
        var r = await c.from("producto_variantes").select(
            "id, precio, stock_terminado, productos(nombre), colores(nombre), tallas(nombre)"
        );
        if (r.error) { manejarError(r.error, "variantes"); return []; }
        return (r.data || []).map(function (v) {
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
        var c = initSupabase();
        if (!c) return [];
        var r = await c.from("pedidos").select(
            "*, clientes(nombre), pedido_items(id, cantidad, producto_variantes(id, productos(nombre), colores(nombre), tallas(nombre)))"
        ).order("created_at", { ascending: false });
        if (r.error) { manejarError(r.error, "pedidos"); return []; }
        return r.data || [];
    };

    window.obtenerOrdenes = async function () {
        var c = initSupabase();
        if (!c) return [];
        var r = await c.from("ordenes_produccion").select(
            "*, pedidos(numero, estado), perfiles!ordenes_produccion_maquiladora_id_fkey(nombre)"
        ).order("created_at", { ascending: false });
        if (r.error) { manejarError(r.error, "ordenes"); return []; }
        return r.data || [];
    };

    window.obtenerKPIs = async function () {
        var c = initSupabase();
        if (!c) return {};
        var r = await c.from("vista_kpis").select("*").single();
        return r.data || {};
    };

    window.obtenerPerfiles = async function (rol) {
        var c = initSupabase();
        if (!c) return [];
        var q = c.from("perfiles").select("id, nombre, email, rol, activo").eq("activo", true);
        if (rol) q = q.eq("rol", rol);
        var r = await q;
        return r.data || [];
    };

    window.autenticarUsuario = async function (email, password) {
        var c = initSupabase();
        if (!c) return null;
        var correo = String(email || "").trim().toLowerCase();
        var r = await c.from("perfiles")
            .select("id, nombre, email, rol, password, activo")
            .eq("email", correo)
            .eq("activo", true)
            .maybeSingle();
        if (r.error || !r.data) return null;
        if (r.data.password !== String(password || "")) return null;
        return { id: r.data.id, nombre: r.data.nombre, email: r.data.email, rol: r.data.rol };
    };

    window.generarNumeroPedido = async function () {
        var c = initSupabase();
        if (!c) return "PED-001";
        var r = await c.from("pedidos").select("numero").order("created_at", { ascending: false });
        var max = 0;
        (r.data || []).forEach(function (p) {
            var m = String(p.numero || "").match(/PED-(\d+)/i);
            if (m) max = Math.max(max, parseInt(m[1], 10));
        });
        return "PED-" + String(max + 1).padStart(3, "0");
    };

})();
