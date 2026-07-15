// PEDIDOS v2 — flujo completo + paginación + confirmaciones

var pedidosLista = [], clientes = [], variantes = [], maquiladoras = [];
var itemPedido = [];
var pagPedidos, pagStock;

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();

    pagPedidos = crearPaginador({
        tbodyId: "tablaPedidos",
        containerId: "pagPedidos",
        emptyMsg: "No hay pedidos registrados.",
        renderRow: function (p, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = p.numero;
            f.insertCell(1).textContent = p.clientes ? p.clientes.nombre : "";
            f.insertCell(2).textContent = p.fecha;
            f.insertCell(3).innerHTML = badgeEstado(p.estado);
            var acciones = "";
            if (p.estado === "materia_recibida") {
                acciones += '<button class="btn btn-sm btn-teal btn-info text-white me-1" onclick="abrirOrdenProduccion(\'' + p.id + '\')">Generar OP</button>';
            }
            if (p.estado === "stock_insuficiente") {
                acciones += '<button class="btn btn-sm btn-warning me-1" onclick="recibirCompra(\'' + p.id + '\')">Recibir materia</button>';
            }
            if (p.estado === "aprobado_calidad") {
                acciones += '<button class="btn btn-sm btn-success" onclick="registrarEntrega(\'' + p.id + '\')">Entregar</button>';
            }
            f.insertCell(4).innerHTML = acciones || '<span class="text-muted">—</span>';
        }
    });

    pagStock = crearPaginador({
        tbodyId: "tablaStock",
        containerId: "pagStock",
        pageSize: 10,
        emptyMsg: "Sin variantes en stock.",
        renderRow: function (v, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = v.etiqueta;
            f.insertCell(1).textContent = v.stock;
        }
    });

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
    variantes.forEach(function (v) { productos[v.producto] = true; });
    llenarSelect("pedProducto", Object.keys(productos).map(function (p) {
        return { id: p, nombre: p };
    }), "id", "nombre", "Producto");

    await prepararFormularioPedido();
}

async function prepararFormularioPedido() {
    var num = document.getElementById("pedNumero");
    if (num) num.value = await generarNumeroPedido();
    var fecha = document.getElementById("pedFecha");
    if (fecha && !fecha.value) fecha.value = new Date().toISOString().slice(0, 10);
}

async function cargarPedidos() {
    pedidosLista = await obtenerPedidosCompletos();
    pagPedidos.setData(pedidosLista);
    pagStock.setData(variantes);
}

function mostrarSeccionPedido(id) {
    document.getElementById("menuPedidos").classList.add("d-none");
    ["registro", "lista", "stock", "compras", "ordenProd"].forEach(function (s) {
        var el = document.getElementById(s);
        if (el) el.classList.add("d-none");
    });
    document.getElementById(id).classList.remove("d-none");
    if (id === "registro") prepararFormularioPedido();
}

function volverMenuPedidos() {
    document.getElementById("menuPedidos").classList.remove("d-none");
    ["registro", "lista", "stock", "compras", "ordenProd"].forEach(function (s) {
        var el = document.getElementById(s);
        if (el) el.classList.add("d-none");
    });
}

function onProductoChange() {
    var prod = document.getElementById("pedProducto").value;
    var colores = filtrarColoresPorProducto(variantes, prod);
    llenarSelect("pedColor", colores.map(function (c) { return { id: c, nombre: c }; }), "id", "nombre", "Color");
    document.getElementById("pedTalla").innerHTML = '<option value="">Talla</option>';
}

function onColorChange() {
    var prod = document.getElementById("pedProducto").value;
    var color = document.getElementById("pedColor").value;
    var vars = filtrarTallasPorProductoColor(variantes, prod, color);
    llenarSelect("pedTalla", vars.map(function (v) { return { id: v.talla, nombre: v.talla }; }), "id", "nombre", "Talla");
}

function agregarItemPedido() {
    var prod = document.getElementById("pedProducto").value;
    var color = document.getElementById("pedColor").value;
    var talla = document.getElementById("pedTalla").value;
    var cant = parseInt(document.getElementById("pedCantidad").value);
    if (!prod || !color || !talla || isNaN(cant)) {
        mostrarAviso("Complete producto, color, talla y cantidad");
        return;
    }
    var varId = buscarVarianteId(variantes, prod, color, talla);
    if (!varId) { mostrarError("Variante no encontrada"); return; }
    itemPedido.push({
        producto_variante_id: varId,
        cantidad: cant,
        etiqueta: prod + " | " + color + " | " + talla
    });
    renderizarItemsTemp();
    limpiarCampos(["pedCantidad"]);
    mostrarExito("Ítem agregado al pedido");
}

function renderizarItemsTemp() {
    var t = document.getElementById("tablaItemsTemp");
    t.innerHTML = "";
    if (!itemPedido.length) {
        var f = t.insertRow();
        var td = f.insertCell(0);
        td.colSpan = 3;
        td.className = "tabla-vacia";
        td.textContent = "Agregue al menos un ítem";
        return;
    }
    itemPedido.forEach(function (it, i) {
        var f = t.insertRow();
        f.insertCell(0).textContent = it.etiqueta;
        f.insertCell(1).textContent = it.cantidad;
        f.insertCell(2).innerHTML = '<button class="btn btn-sm btn-outline-danger" onclick="quitarItem(' + i + ')">Quitar</button>';
    });
}

function quitarItem(i) {
    itemPedido.splice(i, 1);
    renderizarItemsTemp();
}

async function registrarPedido() {
    var cliente = document.getElementById("pedCliente").value;
    var numero = document.getElementById("pedNumero").value.trim() || await generarNumeroPedido();
    var fecha = document.getElementById("pedFecha").value;
    var fechaEnt = document.getElementById("pedFechaEntrega").value;
    if (!cliente || !fecha || itemPedido.length === 0) {
        mostrarAviso("Complete cliente, fecha y al menos un ítem");
        return;
    }

    confirmarAccion("Se registrará el pedido " + numero + " y se verificará el stock de materia prima.", async function () {
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
            mostrarExito("Pedido " + numero + " registrado. Stock suficiente → listo para producción.");
        } else {
            mostrarAviso("Pedido " + numero + " registrado. Stock insuficiente → se generó solicitud de compra.");
        }

        itemPedido = [];
        renderizarItemsTemp();
        limpiarCampos(["pedFechaEntrega", "pedCantidad"]);
        await prepararFormularioPedido();
        await cargarPedidos();
    }, { titulo: "Registrar pedido", okTexto: "Registrar" });
}

async function recibirCompra(pedidoId) {
    confirmarAccion("Se ingresará la materia prima de la solicitud pendiente al inventario.", async function () {
        var sols = await obtenerRegistros("solicitudes_compra");
        var sol = sols.find(function (s) { return s.pedido_id === pedidoId && s.estado === "pendiente"; });
        if (!sol) { mostrarAviso("No hay solicitud pendiente"); return; }
        await llamarRPC("recibir_materia_compra", { p_solicitud_id: sol.id });
        mostrarExito("Materia prima ingresada al inventario.");
        await cargarPedidos();
    }, { titulo: "Recibir materia", okTexto: "Recibir" });
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

    confirmarAccion("Se generará la OP y se descontará materia prima y suministros según la receta.", async function () {
        var ordenId = await llamarRPC("generar_orden_produccion", {
            p_pedido_id: pedidoId, p_maquiladora_id: maqId, p_dias_plazo: dias
        });
        if (ordenId) {
            mostrarExito("Orden de producción generada. Materia prima descontada.");
            volverMenuPedidos();
            await cargarPedidos();
        }
    }, { titulo: "Generar orden de producción", okTexto: "Generar OP" });
}

async function registrarEntrega(pedidoId) {
    confirmarAccion("Se marcará el pedido como entregado.", async function () {
        var sesion = JSON.parse(sessionStorage.getItem("martin_sesion"));
        await insertarRegistro("entregas", { pedido_id: pedidoId, responsable_id: sesion.id, estado: "entregado" });
        await actualizarRegistro("pedidos", pedidoId, { estado: "entregado" });
        mostrarExito("Entrega registrada correctamente.");
        await cargarPedidos();
    }, { titulo: "Registrar entrega", okTexto: "Entregar" });
}
