
// ========================================
// RESUMEN OPERATIVO DESDE SUPABASE
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    cargarResumenDashboard();
});

async function cargarResumenDashboard() {

    let productosTerminados = await obtenerRegistros("productos_terminados");
    let productosProceso = await obtenerRegistros("productos_proceso");
    let pedidosRaw = await obtenerRegistros("pedidos");
    let pedidos = normalizarPedidos(pedidosRaw);

    let totalTerminados = productosTerminados.reduce(function (total, item) {
        return total + Number(item.cantidad);
    }, 0);

    let totalProceso = productosProceso.reduce(function (total, item) {
        return total + Number(item.cantidad);
    }, 0);

    let pedidosPendientes = pedidos.filter(function (item) {
        return item.estado === "pendiente";
    });

    document.getElementById("totalTerminados").textContent = totalTerminados;
    document.getElementById("totalProceso").textContent = totalProceso;
    document.getElementById("totalPedidos").textContent = pedidosPendientes.length;
}
