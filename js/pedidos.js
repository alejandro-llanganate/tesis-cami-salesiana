
// PEDIDOS v2 — flujo completo de gestión

var pedidosLista = [], clientes = [], variantes = [], maquiladoras = [];
var itemPedido = [];

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();
    await cargarCatalogos();
    await cargarPedidos();
});

async function cargarCatalogos() {
    clientes = await obtenerRegistros("clientes");
    variantes = await obtenerVariantes();
    maquiladoras = await obtenerPerfiles("maquiladora");
    llenarSelect("pedCliente", clientes, "id", "nombre", "Cliente");
    llenarSelect("opMaquiladora", maquiladoras, "id", "nombre", "Maquiladora");

    var productos = {};
    variantes.forEach(function(v){ productos[v.producto] = true; });
    llenarSelect("pedProducto", Object.keys(productos).map(function(p){ return {id:p, nombre:p}; }), "id", "nombre", "Producto");
}

async function cargarPedidos() {
    pedidosLista = await obtenerPedidosCompletos();
    renderizarPedidos();
    renderizarStock();
}

function mostrarSeccionPedido(id) {
    document.getElementById("menuPedidos").style.display = "none";
    ["registro","lista","stock","compras"].forEach(function(s){
        var el = document.getElementById(s);
        if (el) el.style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}

function volverMenuPedidos() {
    document.getElementById("menuPedidos").style.display = "flex";
    ["registro","lista","stock","compras"].forEach(function(s){
        var el = document.getElementById(s);
        if (el) el.style.display = "none";
    });
}

function onProductoChange() {
    var prod = document.getElementById("pedProducto").value;
    var colores = filtrarColoresPorProducto(variantes, prod);
    llenarSelect("pedColor", colores.map(function(c){ return {id:c, nombre:c}; }), "id", "nombre", "Color");
    document.getElementById("pedTalla").innerHTML = '<option value="">Talla</option>';
}

function onColorChange() {
    var prod = document.getElementById("pedProducto").value;
    var color = document.getElementById("pedColor").value;
    var vars = filtrarTallasPorProductoColor(variantes, prod, color);
    llenarSelect("pedTalla", vars.map(function(v){ return {id:v.talla, nombre:v.talla}; }), "id", "nombre", "Talla");
}

function agregarItemPedido() {
    var prod = document.getElementById("pedProducto").value;
    var color = document.getElementById("pedColor").value;
    var talla = document.getElementById("pedTalla").value;
    var cant = parseInt(document.getElementById("pedCantidad").value);
    if (!prod || !color || !talla || isNaN(cant)) { mostrarAviso("Complete producto, color, talla y cantidad"); return; }
    var varId = buscarVarianteId(variantes, prod, color, talla);
    if (!varId) { mostrarError("Variante no encontrada"); return; }
    itemPedido.push({ producto_variante_id: varId, cantidad: cant, etiqueta: prod+" | "+color+" | "+talla });
    renderizarItemsTemp();
    limpiarCampos(["pedCantidad"]);
}

function renderizarItemsTemp() {
    var t = document.getElementById("tablaItemsTemp");
    t.innerHTML = "";
    itemPedido.forEach(function(it, i) {
        var f = t.insertRow();
        f.insertCell(0).textContent = it.etiqueta;
        f.insertCell(1).textContent = it.cantidad;
        f.insertCell(2).innerHTML = '<button class="btn-eliminar" onclick="quitarItem('+i+')">Quitar</button>';
    });
}

function quitarItem(i) { itemPedido.splice(i, 1); renderizarItemsTemp(); }

async function registrarPedido() {
    var cliente = document.getElementById("pedCliente").value;
    var numero = document.getElementById("pedNumero").value.trim();
    var fecha = document.getElementById("pedFecha").value;
    var fechaEnt = document.getElementById("pedFechaEntrega").value;
    if (!cliente || !numero || !fecha || itemPedido.length === 0) {
        mostrarAviso("Complete cliente, número, fecha y al menos un ítem"); return;
    }

    var pedido = await insertarRegistro("pedidos", {
        numero: numero, cliente_id: cliente, fecha: fecha,
        fecha_entrega_planeada: fechaEnt || null, estado: "registrado"
    });
    if (!pedido) return;

    for (var i = 0; i < itemPedido.length; i++) {
        await insertarRegistro("pedido_items", {
            pedido_id: pedido.id,
            producto_variante_id: itemPedido[i].producto_variante_id,
            cantidad: itemPedido[i].cantidad
        });
    }

    var resultado = await llamarRPC("verificar_stock_pedido", { p_pedido_id: pedido.id });
    if (resultado && resultado.stock_suficiente) {
        mostrarExito("Pedido registrado. Stock suficiente → listo para producción.");
    } else {
        mostrarAviso("Pedido registrado. Stock insuficiente → se generó solicitud de compra.");
    }

    itemPedido = [];
    renderizarItemsTemp();
    limpiarCampos(["pedNumero","pedFecha","pedFechaEntrega","pedCantidad"]);
    await cargarPedidos();
}

function renderizarPedidos() {
    var t = document.getElementById("tablaPedidos");
    t.innerHTML = "";
    pedidosLista.forEach(function(p) {
        var f = t.insertRow();
        f.insertCell(0).textContent = p.numero;
        f.insertCell(1).textContent = p.clientes.nombre;
        f.insertCell(2).textContent = p.fecha;
        f.insertCell(3).textContent = estadoPedidoTexto(p.estado);
        var acciones = "";
        if (p.estado === "materia_recibida") {
            acciones += '<button class="btn-op" onclick="abrirOrdenProduccion(\''+p.id+'\')">Generar OP</button> ';
        }
        if (p.estado === "stock_insuficiente") {
            acciones += '<button class="btn-compra" onclick="recibirCompra(\''+p.id+'\')">Recibir materia</button> ';
        }
        if (p.estado === "aprobado_calidad") {
            acciones += '<button class="btn-entrega" onclick="registrarEntrega(\''+p.id+'\')">Entregar</button>';
        }
        f.insertCell(4).innerHTML = acciones;
    });
}

function renderizarStock() {
    var t = document.getElementById("tablaStock");
    t.innerHTML = "";
    variantes.forEach(function(v) {
        var f = t.insertRow();
        f.insertCell(0).textContent = v.etiqueta;
        f.insertCell(1).textContent = v.stock;
    });
}

async function recibirCompra(pedidoId) {
    var sols = await obtenerRegistros("solicitudes_compra");
    var sol = sols.find(function(s){ return s.pedido_id === pedidoId && s.estado === "pendiente"; });
    if (!sol) { mostrarAviso("No hay solicitud pendiente"); return; }
    await llamarRPC("recibir_materia_compra", { p_solicitud_id: sol.id });
    mostrarExito("Materia prima ingresada al inventario.");
    await cargarPedidos();
}

function abrirOrdenProduccion(pedidoId) {
    document.getElementById("opPedidoId").value = pedidoId;
    mostrarSeccionPedido("ordenProd");
}

async function generarOrdenProduccion() {
    var pedidoId = document.getElementById("opPedidoId").value;
    var maqId = document.getElementById("opMaquiladora").value;
    var dias = parseInt(document.getElementById("opDias").value) || 7;
    if (!maqId) { mostrarAviso("Seleccione maquiladora"); return; }
    var ordenId = await llamarRPC("generar_orden_produccion", {
        p_pedido_id: pedidoId, p_maquiladora_id: maqId, p_dias_plazo: dias
    });
    if (ordenId) {
        mostrarExito("Orden de producción generada. Materia prima descontada.");
        volverMenuPedidos();
        await cargarPedidos();
    }
}

async function registrarEntrega(pedidoId) {
    var sesion = JSON.parse(sessionStorage.getItem("martin_sesion"));
    await insertarRegistro("entregas", { pedido_id: pedidoId, responsable_id: sesion.id, estado: "entregado" });
    await actualizarRegistro("pedidos", pedidoId, { estado: "entregado" });
    mostrarExito("Entrega registrada correctamente.");
    await cargarPedidos();
}
