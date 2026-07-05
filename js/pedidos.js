
// ========================================
// DATOS
// ========================================

let pedidos = [];
let stockDisponible = [];
let entregas = [];

// ========================================
// INICIO
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    cargarPedidos();
});

async function cargarPedidos() {

    let pedidosRaw = await obtenerRegistros("pedidos");
    pedidos = normalizarPedidos(pedidosRaw);
    stockDisponible = await obtenerRegistros("stock_disponible");
    entregas = await obtenerRegistros("entregas");

    renderizarStock();
    renderizarPorProducir();
    renderizarEntregas();
}

// ========================================
// NAVEGACIÓN
// ========================================

function mostrarSeccionPedido(id) {

    document.getElementById("menuPedidos").style.display = "none";

    document.getElementById("stock").style.display = "none";
    document.getElementById("producir").style.display = "none";
    document.getElementById("entregasPedido").style.display = "none";

    document.getElementById(id).style.display = "block";
}

function volverMenuPedidos() {

    document.getElementById("menuPedidos").style.display = "flex";

    document.getElementById("stock").style.display = "none";
    document.getElementById("producir").style.display = "none";
    document.getElementById("entregasPedido").style.display = "none";
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

function estadoPedido(estado) {

    if (estado === "en_proceso") {
        return "🔵 En Proceso";
    }

    if (estado === "completado") {
        return "🟢 Completado";
    }

    if (estado === "cancelado") {
        return "🔴 Cancelado";
    }

    return "🟡 Pendiente";
}

function botonesAcciones(id, tabla) {
    return (
        '<button onclick="editarFila(this)">Editar</button> ' +
        '<button onclick="eliminarFila(this, \'' + id + '\', \'' + tabla + '\')">Eliminar</button>'
    );
}

// ========================================
// RENDERIZADO
// ========================================

function renderizarStock() {

    let tabla = document.getElementById("tablaStockDisponible");
    tabla.innerHTML = "";

    stockDisponible.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;

        fila.insertCell(0).textContent = item.producto;
        fila.insertCell(1).textContent = item.talla;
        fila.insertCell(2).textContent = item.color;
        fila.insertCell(3).textContent = item.cantidad;
        fila.insertCell(4).textContent = obtenerEstado(item.cantidad);
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "stock_disponible");
    });
}

function renderizarPorProducir() {

    let tabla = document.getElementById("tablaPorProducir");
    tabla.innerHTML = "";

    pedidos.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;

        fila.insertCell(0).textContent = item.pedido;
        fila.insertCell(1).textContent = item.cliente;
        fila.insertCell(2).textContent = item.producto;
        fila.insertCell(3).textContent = item.talla;
        fila.insertCell(4).textContent = item.cantidad;
        fila.insertCell(5).textContent = item.fecha;
        fila.insertCell(6).textContent = estadoPedido(item.estado);
        fila.insertCell(7).innerHTML = botonesAcciones(item.id, "pedidos");
    });
}

function renderizarEntregas() {

    let tabla = document.getElementById("tablaEntregasPedido");
    tabla.innerHTML = "";

    entregas.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;

        fila.insertCell(0).textContent = item.numero_pedido;
        fila.insertCell(1).textContent = item.cliente;
        fila.insertCell(2).textContent = item.fecha_entrega;
        fila.insertCell(3).textContent = item.responsable;
        fila.insertCell(4).textContent = item.estado === "entregado" ? "🟢 Entregado" : "🔵 En Ruta";
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "entregas");
    });
}

// ========================================
// STOCK DISPONIBLE
// ========================================

async function agregarStockDisponible() {

    let producto = document.getElementById("stockProducto").value;
    let talla = document.getElementById("stockTalla").value;
    let color = document.getElementById("stockColor").value;
    let cantidad = parseInt(document.getElementById("stockCantidad").value);

    if (
        producto === "" ||
        talla === "" ||
        color === "" ||
        isNaN(cantidad)
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("stock_disponible", {
        producto: producto,
        talla: talla,
        color: color,
        cantidad: cantidad
    });

    if (!registro) {
        return;
    }

    stockDisponible.unshift(registro);
    renderizarStock();

    document.getElementById("stockProducto").value = "";
    document.getElementById("stockTalla").value = "";
    document.getElementById("stockColor").value = "";
    document.getElementById("stockCantidad").value = "";
}

// ========================================
// PRODUCTOS POR PRODUCIR
// ========================================

async function agregarProductoProducir() {

    let pedido = document.getElementById("pedidoNumero").value;
    let cliente = document.getElementById("pedidoCliente").value;
    let producto = document.getElementById("pedidoProducto").value;
    let talla = document.getElementById("pedidoTalla").value;
    let cantidad = parseInt(document.getElementById("pedidoCantidad").value);
    let fecha = document.getElementById("pedidoFecha").value;

    if (
        pedido === "" ||
        cliente === "" ||
        producto === "" ||
        talla === "" ||
        isNaN(cantidad) ||
        fecha === ""
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("pedidos", {
        numero: pedido,
        cliente: cliente,
        producto: producto,
        talla: talla,
        cantidad: cantidad,
        fecha: fecha,
        estado: "pendiente"
    });

    if (!registro) {
        return;
    }

    pedidos.unshift(normalizarPedidos([registro])[0]);
    renderizarPorProducir();

    document.getElementById("pedidoNumero").value = "";
    document.getElementById("pedidoCliente").value = "";
    document.getElementById("pedidoProducto").value = "";
    document.getElementById("pedidoTalla").value = "";
    document.getElementById("pedidoCantidad").value = "";
    document.getElementById("pedidoFecha").value = "";
}

// ========================================
// ENTREGAS
// ========================================

async function agregarEntregaPedido() {

    let pedido = document.getElementById("entregaPedido").value;
    let cliente = document.getElementById("entregaCliente").value;
    let fecha = document.getElementById("entregaFecha").value;
    let responsable = document.getElementById("entregaResponsable").value;

    if (
        pedido === "" ||
        cliente === "" ||
        fecha === "" ||
        responsable === ""
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("entregas", {
        numero_pedido: pedido,
        cliente: cliente,
        fecha_entrega: fecha,
        responsable: responsable,
        estado: "entregado"
    });

    if (!registro) {
        return;
    }

    entregas.unshift(registro);
    renderizarEntregas();

    document.getElementById("entregaPedido").value = "";
    document.getElementById("entregaCliente").value = "";
    document.getElementById("entregaFecha").value = "";
    document.getElementById("entregaResponsable").value = "";
}

// ========================================
// ELIMINAR / EDITAR
// ========================================

async function eliminarFila(boton, id, tabla) {

    let confirmar = confirm("¿Desea eliminar este registro?");

    if (!confirmar) {
        return;
    }

    let eliminado = await eliminarRegistro(tabla, id);

    if (!eliminado) {
        return;
    }

    boton.parentNode.parentNode.remove();
}

function editarFila(boton) {

    alert(
        "Para simplificar el prototipo de tesis, copie los datos y vuelva a registrarlos."
    );
}
