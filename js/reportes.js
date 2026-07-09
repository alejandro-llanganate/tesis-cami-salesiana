
var variantes = [], pedidos = [], ordenes = [], kpis = {};

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();
});

async function mostrarSeccionReporte(id) {
    document.getElementById("menuReportes").style.display = "none";
    ["resumen","inventario","pedidos","produccion"].forEach(function(s){
        document.getElementById(s).style.display = "none";
    });
    document.getElementById(id).style.display = "block";
    variantes = await obtenerVariantes();
    pedidos = await obtenerPedidosCompletos();
    ordenes = await obtenerOrdenes();
    kpis = await obtenerKPIs();
    if (id === "resumen") cargarResumen();
    if (id === "inventario") cargarInventario();
    if (id === "pedidos") cargarPedidos();
    if (id === "produccion") cargarProduccion();
}

function volverMenuReportes() {
    document.getElementById("menuReportes").style.display = "flex";
    ["resumen","inventario","pedidos","produccion"].forEach(function(s){
        document.getElementById(s).style.display = "none";
    });
}

function cargarResumen() {
    document.getElementById("rActivos").textContent = kpis.pedidos_activos || 0;
    document.getElementById("rOrdenes").textContent = kpis.ordenes_activas || 0;
    document.getElementById("rAlertas").textContent = kpis.alertas_activas || 0;
    document.getElementById("rStock").textContent = kpis.stock_total || 0;
    document.getElementById("rCalidad").textContent = kpis.inspecciones_aprobadas || 0;
    document.getElementById("rEntregas").textContent = kpis.entregas_realizadas || 0;
}

function cargarInventario() {
    var t = document.getElementById("tablaRepInv");
    t.innerHTML = "";
    variantes.forEach(function(v) {
        var f = t.insertRow();
        f.insertCell(0).textContent = v.producto;
        f.insertCell(1).textContent = v.color;
        f.insertCell(2).textContent = v.talla;
        f.insertCell(3).textContent = v.stock;
    });
}

function cargarPedidos() {
    var t = document.getElementById("tablaRepPed");
    t.innerHTML = "";
    pedidos.forEach(function(p) {
        var f = t.insertRow();
        f.insertCell(0).textContent = p.numero;
        f.insertCell(1).textContent = p.clientes.nombre;
        f.insertCell(2).textContent = estadoPedidoTexto(p.estado);
    });
}

function cargarProduccion() {
    var t = document.getElementById("tablaRepProd");
    t.innerHTML = "";
    ordenes.forEach(function(o) {
        var f = t.insertRow();
        f.insertCell(0).textContent = o.pedidos ? o.pedidos.numero : "";
        f.insertCell(1).textContent = o.perfiles ? o.perfiles.nombre : "";
        f.insertCell(2).textContent = o.porcentaje_avance + "%";
        f.insertCell(3).textContent = o.estado;
    });
}
