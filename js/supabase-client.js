
// ========================================
// CLIENTE SUPABASE
// ========================================

let supabaseClient = null;

function initSupabase() {

    if (!window.supabase) {
        console.error("Supabase SDK no cargado.");
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    return supabaseClient;
}

function manejarErrorSupabase(error, accion) {

    console.error("Supabase:", error);

    let mensaje = "Error al " + accion + ": " + error.message;

    if (error.message.includes("does not exist") || error.code === "42P01") {
        mensaje = "Las tablas no existen aún. Ejecuta supabase/schema.sql en el SQL Editor de Supabase.";
    }

    alert(mensaje);
}

async function obtenerRegistros(tabla) {

    let client = initSupabase();

    if (!client) {
        return [];
    }

    let { data, error } = await client
        .from(tabla)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        manejarErrorSupabase(error, "consultar " + tabla);
        return [];
    }

    return data || [];
}

async function insertarRegistro(tabla, registro) {

    let client = initSupabase();

    if (!client) {
        return null;
    }

    let { data, error } = await client
        .from(tabla)
        .insert([registro])
        .select()
        .single();

    if (error) {
        manejarErrorSupabase(error, "guardar en " + tabla);
        return null;
    }

    return data;
}

async function eliminarRegistro(tabla, id) {

    let client = initSupabase();

    if (!client) {
        return false;
    }

    let { error } = await client
        .from(tabla)
        .delete()
        .eq("id", id);

    if (error) {
        manejarErrorSupabase(error, "eliminar de " + tabla);
        return false;
    }

    return true;
}

function normalizarPedidos(lista) {

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
}
