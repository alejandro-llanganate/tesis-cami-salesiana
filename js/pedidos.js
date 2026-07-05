
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

    cancelarEdicion();

    document.getElementById("menuPedidos").style.display = "none";
    document.getElementById("stock").style.display = "none";
    document.getElementById("producir").style.display = "none";
    document.getElementById("entregasPedido").style.display = "none";
    document.getElementById(id).style.display = "block";
}

function volverMenuPedidos() {

    cancelarEdicion();

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
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "stock_disponible", "stock");
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
        fila.insertCell(7).innerHTML = botonesAcciones(item.id, "pedidos", "pedido");
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
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "entregas", "entrega");
    });
}

// ========================================
// EDITAR
// ========================================

function editarRegistro(id, tabla, seccion) {

    let item = null;

    if (seccion === "stock") {
        item = stockDisponible.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id, tabla: tabla, seccion: seccion,
            btnId: "btnStock", btnCancelId: "btnCancelStock", btnTexto: "Agregar",
            campos: [
                { id: "stockProducto", valor: item.producto },
                { id: "stockTalla", valor: item.talla },
                { id: "stockColor", valor: item.color },
                { id: "stockCantidad", valor: item.cantidad }
            ]
        });
    }

    if (seccion === "pedido") {
        item = pedidos.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id, tabla: tabla, seccion: seccion,
            btnId: "btnPedido", btnCancelId: "btnCancelPedido", btnTexto: "Agregar",
            campos: [
                { id: "pedidoNumero", valor: item.pedido },
                { id: "pedidoCliente", valor: item.cliente },
                { id: "pedidoProducto", valor: item.producto },
                { id: "pedidoTalla", valor: item.talla },
                { id: "pedidoCantidad", valor: item.cantidad },
                { id: "pedidoFecha", valor: item.fecha }
            ]
        });
    }

    if (seccion === "entrega") {
        item = entregas.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id, tabla: tabla, seccion: seccion,
            btnId: "btnEntrega", btnCancelId: "btnCancelEntrega", btnTexto: "Agregar",
            campos: [
                { id: "entregaPedido", valor: item.numero_pedido },
                { id: "entregaCliente", valor: item.cliente },
                { id: "entregaFecha", valor: item.fecha_entrega },
                { id: "entregaResponsable", valor: item.responsable }
            ]
        });
    }
}

// ========================================
// ELIMINAR
// ========================================

async function eliminarRegistroFila(id, tabla, seccion) {

    if (!confirm("¿Desea eliminar este registro?")) {
        return;
    }

    let eliminado = await eliminarRegistro(tabla, id);

    if (!eliminado) {
        return;
    }

    if (edicionActiva && edicionActiva.id === id) {
        cancelarEdicion();
    }

    if (seccion === "stock") {
        stockDisponible = stockDisponible.filter(function (p) { return p.id !== id; });
        renderizarStock();
    }

    if (seccion === "pedido") {
        pedidos = pedidos.filter(function (p) { return p.id !== id; });
        renderizarPorProducir();
    }

    if (seccion === "entrega") {
        entregas = entregas.filter(function (p) { return p.id !== id; });
        renderizarEntregas();
    }
}

// ========================================
// STOCK DISPONIBLE
// ========================================

async function agregarStockDisponible() {

    let producto = document.getElementById("stockProducto").value.trim();
    let talla = document.getElementById("stockTalla").value;
    let color = document.getElementById("stockColor").value.trim();
    let cantidad = parseInt(document.getElementById("stockCantidad").value);

    if (producto === "" || talla === "" || color === "" || isNaN(cantidad)) {
        alert("Complete todos los campos");
        return;
    }

    let datos = { producto: producto, talla: talla, color: color, cantidad: cantidad };

    if (edicionActiva && edicionActiva.seccion === "stock") {

        let actualizado = await actualizarRegistro("stock_disponible", edicionActiva.id, datos);
        if (!actualizado) return;

        let indice = stockDisponible.findIndex(function (p) { return p.id === edicionActiva.id; });
        stockDisponible[indice] = actualizado;
        renderizarStock();
        cancelarEdicion();
        return;
    }

    let registro = await insertarRegistro("stock_disponible", datos);
    if (!registro) return;

    stockDisponible.unshift(registro);
    renderizarStock();
    limpiarCampos(["stockProducto", "stockTalla", "stockColor", "stockCantidad"]);
}

// ========================================
// PRODUCTOS POR PRODUCIR
// ========================================

async function agregarProductoProducir() {

    let pedido = document.getElementById("pedidoNumero").value.trim();
    let cliente = document.getElementById("pedidoCliente").value.trim();
    let producto = document.getElementById("pedidoProducto").value.trim();
    let talla = document.getElementById("pedidoTalla").value;
    let cantidad = parseInt(document.getElementById("pedidoCantidad").value);
    let fecha = document.getElementById("pedidoFecha").value;

    if (pedido === "" || cliente === "" || producto === "" || talla === "" || isNaN(cantidad) || fecha === "") {
        alert("Complete todos los campos");
        return;
    }

    let datos = {
        numero: pedido,
        cliente: cliente,
        producto: producto,
        talla: talla,
        cantidad: cantidad,
        fecha: fecha
    };

    if (edicionActiva && edicionActiva.seccion === "pedido") {

        let actualizado = await actualizarRegistro("pedidos", edicionActiva.id, datos);
        if (!actualizado) return;

        let indice = pedidos.findIndex(function (p) { return p.id === edicionActiva.id; });
        pedidos[indice] = normalizarPedidos([actualizado])[0];
        renderizarPorProducir();
        cancelarEdicion();
        return;
    }

    datos.estado = "pendiente";

    let registro = await insertarRegistro("pedidos", datos);
    if (!registro) return;

    pedidos.unshift(normalizarPedidos([registro])[0]);
    renderizarPorProducir();
    limpiarCampos(["pedidoNumero", "pedidoCliente", "pedidoProducto", "pedidoTalla", "pedidoCantidad", "pedidoFecha"]);
}

// ========================================
// ENTREGAS
// ========================================

async function agregarEntregaPedido() {

    let pedido = document.getElementById("entregaPedido").value.trim();
    let cliente = document.getElementById("entregaCliente").value.trim();
    let fecha = document.getElementById("entregaFecha").value;
    let responsable = document.getElementById("entregaResponsable").value.trim();

    if (pedido === "" || cliente === "" || fecha === "" || responsable === "") {
        alert("Complete todos los campos");
        return;
    }

    let datos = {
        numero_pedido: pedido,
        cliente: cliente,
        fecha_entrega: fecha,
        responsable: responsable
    };

    if (edicionActiva && edicionActiva.seccion === "entrega") {

        let actualizado = await actualizarRegistro("entregas", edicionActiva.id, datos);
        if (!actualizado) return;

        let indice = entregas.findIndex(function (p) { return p.id === edicionActiva.id; });
        entregas[indice] = actualizado;
        renderizarEntregas();
        cancelarEdicion();
        return;
    }

    datos.estado = "entregado";

    let registro = await insertarRegistro("entregas", datos);
    if (!registro) return;

    entregas.unshift(registro);
    renderizarEntregas();
    limpiarCampos(["entregaPedido", "entregaCliente", "entregaFecha", "entregaResponsable"]);
}
