var variantes = [], pedidos = [], ordenes = [], kpis = {};
var pagRepInv, pagRepPed, pagRepProd;

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();

    pagRepInv = crearPaginador({
        tbodyId: "tablaRepInv",
        containerId: "pagRepInv",
        pageSize: 10,
        emptyMsg: "Sin datos de inventario.",
        renderRow: function (v, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = v.producto;
            f.insertCell(1).textContent = v.color;
            f.insertCell(2).textContent = v.talla;
            f.insertCell(3).textContent = v.stock;
        }
    });

    pagRepPed = crearPaginador({
        tbodyId: "tablaRepPed",
        containerId: "pagRepPed",
        emptyMsg: "Sin pedidos.",
        renderRow: function (p, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = p.numero;
            f.insertCell(1).textContent = p.clientes ? p.clientes.nombre : "";
            f.insertCell(2).innerHTML = badgeEstado(p.estado);
        }
    });

    pagRepProd = crearPaginador({
        tbodyId: "tablaRepProd",
        containerId: "pagRepProd",
        emptyMsg: "Sin órdenes.",
        renderRow: function (o, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = o.pedidos ? o.pedidos.numero : "";
            f.insertCell(1).textContent = o.perfiles ? o.perfiles.nombre : "";
            f.insertCell(2).textContent = o.porcentaje_avance + "%";
            f.insertCell(3).textContent = o.estado;
        }
    });
});

async function mostrarSeccionReporte(id) {
    document.getElementById("menuReportes").style.display = "none";
    ["resumen", "inventario", "pedidos", "produccion"].forEach(function (s) {
        document.getElementById(s).style.display = "none";
    });
    document.getElementById(id).style.display = "block";

    variantes = await obtenerVariantes();
    pedidos = await obtenerPedidosCompletos();
    ordenes = await obtenerOrdenes();
    kpis = await obtenerKPIs();

    if (id === "resumen") cargarResumen();
    if (id === "inventario") pagRepInv.setData(variantes);
    if (id === "pedidos") pagRepPed.setData(pedidos);
    if (id === "produccion") pagRepProd.setData(ordenes);
}

function volverMenuReportes() {
    document.getElementById("menuReportes").style.display = "grid";
    ["resumen", "inventario", "pedidos", "produccion"].forEach(function (s) {
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
