
// ========================================
// DATOS
// ========================================

let productosTerminados = [];
let productosProceso = [];
let pedidos = [];

// ========================================
// NAVEGACIÓN
// ========================================

const seccionesReporte = [
    "resumen",
    "inventario",
    "pedidos",
    "produccion",
    "exportar"
];

async function mostrarSeccionReporte(id) {

    document.getElementById("menuReportes").style.display = "none";

    seccionesReporte.forEach(function (seccion) {
        document.getElementById(seccion).style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    await cargarDatosReportes();

    if (id === "resumen") {
        cargarResumen();
    }

    if (id === "inventario") {
        cargarReporteInventario();
    }

    if (id === "pedidos") {
        cargarReportePedidos();
    }

    if (id === "produccion") {
        cargarReporteProduccion();
    }

    if (id === "exportar") {
        cargarVistaPrevia();
    }
}

function volverMenuReportes() {

    document.getElementById("menuReportes").style.display = "flex";

    seccionesReporte.forEach(function (seccion) {
        document.getElementById(seccion).style.display = "none";
    });
}

async function cargarDatosReportes() {

    productosTerminados = await obtenerRegistros("productos_terminados");
    productosProceso = await obtenerRegistros("productos_proceso");

    let pedidosRaw = await obtenerRegistros("pedidos");
    pedidos = normalizarPedidos(pedidosRaw);
}

// ========================================
// UTILIDADES
// ========================================

function obtenerEstado(cantidad) {

    if (cantidad >= 30) {
        return "🟢 Disponible";
    }

    if (cantidad >= 10) {
        return "🟡 Stock Medio";
    }

    return "🔴 Bajo Stock";
}

function sumarCantidades(lista) {

    return lista.reduce(function (total, item) {
        return total + Number(item.cantidad);
    }, 0);
}

function contarPorEstado(lista) {

    let bajo = 0;
    let medio = 0;
    let disponible = 0;

    lista.forEach(function (item) {

        let cantidad = Number(item.cantidad);

        if (cantidad >= 30) {
            disponible++;
        } else if (cantidad >= 10) {
            medio++;
        } else {
            bajo++;
        }
    });

    return { bajo: bajo, medio: medio, disponible: disponible };
}

function limpiarTabla(id) {

    let tabla = document.getElementById(id);
    tabla.innerHTML = "";
}

// ========================================
// RESUMEN GENERAL
// ========================================

function cargarResumen() {

    let totalTerminados = sumarCantidades(productosTerminados);
    let totalProceso = sumarCantidades(productosProceso);

    let pedidosPendientes = pedidos.filter(function (item) {
        return item.estado === "pendiente";
    });

    let totalUnidadesPedidas = sumarCantidades(pedidosPendientes);

    document.getElementById("kpiTerminados").textContent = totalTerminados;
    document.getElementById("kpiProceso").textContent = totalProceso;
    document.getElementById("kpiPedidos").textContent = pedidosPendientes.length;
    document.getElementById("kpiUnidadesPedidas").textContent = totalUnidadesPedidas;

    let inventarioCompleto = productosTerminados.concat(productosProceso);
    let estados = contarPorEstado(inventarioCompleto);

    document.getElementById("alertaBajoStock").textContent = estados.bajo;
    document.getElementById("alertaStockMedio").textContent = estados.medio;
    document.getElementById("alertaDisponible").textContent = estados.disponible;
}

// ========================================
// REPORTE INVENTARIO
// ========================================

function cargarReporteInventario() {

    limpiarTabla("tablaReporteTerminados");
    limpiarTabla("tablaReporteProceso");

    productosTerminados.forEach(function (item) {

        let fila = document.getElementById("tablaReporteTerminados").insertRow();

        fila.insertCell(0).textContent = item.producto;
        fila.insertCell(1).textContent = item.talla;
        fila.insertCell(2).textContent = item.color;
        fila.insertCell(3).textContent = item.cantidad;
        fila.insertCell(4).textContent = obtenerEstado(item.cantidad);
    });

    productosProceso.forEach(function (item) {

        let fila = document.getElementById("tablaReporteProceso").insertRow();

        fila.insertCell(0).textContent = item.producto;
        fila.insertCell(1).textContent = item.talla;
        fila.insertCell(2).textContent = item.color;
        fila.insertCell(3).textContent = item.cantidad;
        fila.insertCell(4).textContent = item.maquiladora;
        fila.insertCell(5).textContent = obtenerEstado(item.cantidad);
    });

    if (productosTerminados.length === 0) {
        let fila = document.getElementById("tablaReporteTerminados").insertRow();
        let celda = fila.insertCell(0);
        celda.colSpan = 5;
        celda.textContent = "No hay productos terminados registrados.";
    }

    if (productosProceso.length === 0) {
        let fila = document.getElementById("tablaReporteProceso").insertRow();
        let celda = fila.insertCell(0);
        celda.colSpan = 6;
        celda.textContent = "No hay productos en proceso registrados.";
    }
}

// ========================================
// REPORTE PEDIDOS
// ========================================

function cargarReportePedidos() {

    limpiarTabla("tablaReportePedidos");
    limpiarTabla("tablaReporteClientes");

    let clientesMap = {};

    pedidos.forEach(function (item) {

        let fila = document.getElementById("tablaReportePedidos").insertRow();

        fila.insertCell(0).textContent = item.pedido;
        fila.insertCell(1).textContent = item.cliente;
        fila.insertCell(2).textContent = item.producto;
        fila.insertCell(3).textContent = item.talla;
        fila.insertCell(4).textContent = item.cantidad;
        fila.insertCell(5).textContent = item.fecha;

        if (!clientesMap[item.cliente]) {
            clientesMap[item.cliente] = { pedidos: 0, unidades: 0 };
        }

        clientesMap[item.cliente].pedidos++;
        clientesMap[item.cliente].unidades += Number(item.cantidad);
    });

    let clientes = Object.keys(clientesMap);

    clientes.forEach(function (cliente) {

        let datos = clientesMap[cliente];
        let fila = document.getElementById("tablaReporteClientes").insertRow();

        fila.insertCell(0).textContent = cliente;
        fila.insertCell(1).textContent = datos.pedidos;
        fila.insertCell(2).textContent = datos.unidades;
    });

    document.getElementById("totalPedidosReporte").textContent = pedidos.length;
    document.getElementById("totalClientesReporte").textContent = clientes.length;

    if (pedidos.length === 0) {
        let fila = document.getElementById("tablaReportePedidos").insertRow();
        let celda = fila.insertCell(0);
        celda.colSpan = 6;
        celda.textContent = "No hay pedidos registrados.";
    }
}

// ========================================
// REPORTE PRODUCCIÓN
// ========================================

function cargarReporteProduccion() {

    limpiarTabla("tablaReporteMaquiladoras");

    let maquiladorasMap = {};

    productosProceso.forEach(function (item) {

        if (!maquiladorasMap[item.maquiladora]) {
            maquiladorasMap[item.maquiladora] = { productos: 0, unidades: 0 };
        }

        maquiladorasMap[item.maquiladora].productos++;
        maquiladorasMap[item.maquiladora].unidades += Number(item.cantidad);
    });

    let maquiladoras = Object.keys(maquiladorasMap);
    let totalUnidades = 0;

    maquiladoras.forEach(function (nombre) {

        let datos = maquiladorasMap[nombre];
        totalUnidades += datos.unidades;

        let fila = document.getElementById("tablaReporteMaquiladoras").insertRow();

        fila.insertCell(0).textContent = nombre;
        fila.insertCell(1).textContent = datos.productos;
        fila.insertCell(2).textContent = datos.unidades;
    });

    document.getElementById("totalMaquiladoras").textContent = maquiladoras.length;
    document.getElementById("totalUnidadesProduccion").textContent = totalUnidades;

    if (maquiladoras.length === 0) {
        let fila = document.getElementById("tablaReporteMaquiladoras").insertRow();
        let celda = fila.insertCell(0);
        celda.colSpan = 3;
        celda.textContent = "No hay producción activa registrada.";
    }
}

// ========================================
// EXPORTAR
// ========================================

function generarCSV(encabezados, filas) {

    let lineas = [encabezados.join(",")];

    filas.forEach(function (fila) {
        lineas.push(fila.join(","));
    });

    return lineas.join("\n");
}

function descargarArchivo(contenido, nombre) {

    let blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    let enlace = document.createElement("a");
    let url = URL.createObjectURL(blob);

    enlace.href = url;
    enlace.download = nombre;
    enlace.style.display = "none";

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);
}

async function exportarCSV(tipo) {

    await cargarDatosReportes();

    let contenido = "";
    let nombre = "reporte_martin_company.csv";

    if (tipo === "terminados") {

        let filas = productosTerminados.map(function (item) {
            return [item.producto, item.talla, item.color, item.cantidad];
        });

        contenido = generarCSV(
            ["Producto", "Talla", "Color", "Cantidad"],
            filas
        );

        nombre = "productos_terminados.csv";
    }

    if (tipo === "proceso") {

        let filas = productosProceso.map(function (item) {
            return [item.producto, item.talla, item.color, item.cantidad, item.maquiladora];
        });

        contenido = generarCSV(
            ["Producto", "Talla", "Color", "Cantidad", "Maquiladora"],
            filas
        );

        nombre = "productos_proceso.csv";
    }

    if (tipo === "pedidos") {

        let filas = pedidos.map(function (item) {
            return [item.pedido, item.cliente, item.producto, item.talla, item.cantidad, item.fecha];
        });

        contenido = generarCSV(
            ["Pedido", "Cliente", "Producto", "Talla", "Cantidad", "Fecha"],
            filas
        );

        nombre = "pedidos.csv";
    }

    if (tipo === "completo") {

        let filasTerminados = productosTerminados.map(function (item) {
            return ["Terminado", item.producto, item.talla, item.color, item.cantidad, ""];
        });

        let filasProceso = productosProceso.map(function (item) {
            return ["Proceso", item.producto, item.talla, item.color, item.cantidad, item.maquiladora];
        });

        let filasPedidos = pedidos.map(function (item) {
            return ["Pedido", item.producto, item.talla, "", item.cantidad, item.cliente];
        });

        contenido = generarCSV(
            ["Tipo", "Producto", "Talla", "Color", "Cantidad", "Detalle"],
            filasTerminados.concat(filasProceso).concat(filasPedidos)
        );

        nombre = "reporte_completo_martin_company.csv";
    }

    if (contenido === "") {
        alert("No hay datos para exportar.");
        return;
    }

    descargarArchivo(contenido, nombre);
}

function cargarVistaPrevia() {

    let pedidosPendientes = pedidos.filter(function (item) {
        return item.estado === "pendiente";
    });

    let totalTerminados = sumarCantidades(productosTerminados);
    let totalProceso = sumarCantidades(productosProceso);
    let totalUnidadesPedidas = sumarCantidades(pedidosPendientes);
    let fecha = new Date().toLocaleDateString("es-CO");

    document.getElementById("previewReporte").innerHTML =
        "<p><strong>MARTIN Company</strong> — Reporte Operativo</p>" +
        "<p>Fecha: " + fecha + "</p>" +
        "<br>" +
        "<p>Productos terminados: " + totalTerminados + " unidades</p>" +
        "<p>Productos en proceso: " + totalProceso + " unidades</p>" +
        "<p>Pedidos pendientes: " + pedidosPendientes.length + "</p>" +
        "<p>Unidades por producir: " + totalUnidadesPedidas + "</p>";
}

function imprimirReporte() {

    cargarVistaPrevia();
    window.print();
}
