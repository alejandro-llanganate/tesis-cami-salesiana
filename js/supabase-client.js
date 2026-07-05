(function () {
    "use strict";

    var supabaseClient = null;

    function initSupabase() {

        if (!window.supabase || !window.supabase.createClient) {
            console.error("Supabase SDK no cargado.");
            return null;
        }

        if (!supabaseClient) {
            supabaseClient = window.supabase.createClient(
                window.SUPABASE_URL,
                window.SUPABASE_KEY
            );
        }

        return supabaseClient;
    }

    function manejarErrorSupabase(error, accion) {

        console.error("Supabase:", error);

        var mensaje = "Error al " + accion + ": " + error.message;

        if (error.message.indexOf("does not exist") !== -1 || error.code === "42P01") {
            mensaje = "Las tablas no existen aún. Ejecuta supabase/martin_company.sql en el SQL Editor de Supabase.";
        }

        alert(mensaje);
    }

    window.obtenerRegistros = async function (tabla) {

        var client = initSupabase();

        if (!client) {
            return [];
        }

        var resultado = await client
            .from(tabla)
            .select("*")
            .order("created_at", { ascending: false });

        if (resultado.error) {
            manejarErrorSupabase(resultado.error, "consultar " + tabla);
            return [];
        }

        return resultado.data || [];
    };

    window.insertarRegistro = async function (tabla, registro) {

        var client = initSupabase();

        if (!client) {
            return null;
        }

        var resultado = await client
            .from(tabla)
            .insert([registro])
            .select()
            .single();

        if (resultado.error) {
            manejarErrorSupabase(resultado.error, "guardar en " + tabla);
            return null;
        }

        return resultado.data;
    };

    window.eliminarRegistro = async function (tabla, id) {

        var client = initSupabase();

        if (!client) {
            return false;
        }

        var resultado = await client
            .from(tabla)
            .delete()
            .eq("id", id);

        if (resultado.error) {
            manejarErrorSupabase(resultado.error, "eliminar de " + tabla);
            return false;
        }

        return true;
    };

    window.actualizarRegistro = async function (tabla, id, registro) {

        var client = initSupabase();

        if (!client) {
            return null;
        }

        var resultado = await client
            .from(tabla)
            .update(registro)
            .eq("id", id)
            .select()
            .single();

        if (resultado.error) {
            manejarErrorSupabase(resultado.error, "actualizar en " + tabla);
            return null;
        }

        return resultado.data;
    };

    window.normalizarPedidos = function (lista) {

        return lista.map(function (item) {
            return {
                id: item.id,
                pedido: item.numero,
                cliente: item.cliente,
                producto: item.producto,
                talla: item.talla,
                cantidad: item.cantidad,
                fecha: item.fecha,
                estado: item.estado
            };
        });
    };

})();
