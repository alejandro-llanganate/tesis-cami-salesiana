
// ========================================
// DATOS
// ========================================

let productosTerminados = [];
let productosProceso = [];
let materiaPrima = [];
let suministros = [];

// ========================================
// INICIO
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    cargarInventario();
});

async function cargarInventario() {

    productosTerminados = await obtenerRegistros("productos_terminados");
    productosProceso = await obtenerRegistros("productos_proceso");
    materiaPrima = await obtenerRegistros("materia_prima");
    suministros = await obtenerRegistros("suministros");

    renderizarTerminados();
    renderizarProceso();
    renderizarMateriaPrima();
    renderizarSuministros();
}

// ========================================
// NAVEGACIÓN
// ========================================

function mostrarSeccion(id) {

    cancelarEdicion();

    document.getElementById("menuInventario").style.display = "none";
    document.getElementById("terminados").style.display = "none";
    document.getElementById("proceso").style.display = "none";
    document.getElementById("materia").style.display = "none";
    document.getElementById("suministros").style.display = "none";
    document.getElementById(id).style.display = "block";
}

function volverMenu() {

    cancelarEdicion();

    document.getElementById("menuInventario").style.display = "flex";
    document.getElementById("terminados").style.display = "none";
    document.getElementById("proceso").style.display = "none";
    document.getElementById("materia").style.display = "none";
    document.getElementById("suministros").style.display = "none";
}

// ========================================
// ESTADO STOCK
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

// ========================================
// RENDERIZADO
// ========================================

function renderizarTerminados() {

    let tabla = document.getElementById("tablaTerminados");
    tabla.innerHTML = "";

    productosTerminados.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;
        fila.insertCell(0).textContent = item.producto;
        fila.insertCell(1).textContent = item.talla;
        fila.insertCell(2).textContent = item.color;
        fila.insertCell(3).textContent = item.cantidad;
        fila.insertCell(4).textContent = obtenerEstado(item.cantidad);
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "productos_terminados", "terminados");
    });
}

function renderizarProceso() {

    let tabla = document.getElementById("tablaProceso");
    tabla.innerHTML = "";

    productosProceso.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;
        fila.insertCell(0).textContent = item.producto;
        fila.insertCell(1).textContent = item.talla;
        fila.insertCell(2).textContent = item.color;
        fila.insertCell(3).textContent = item.cantidad;
        fila.insertCell(4).textContent = item.maquiladora;
        fila.insertCell(5).textContent = obtenerEstado(item.cantidad);
        fila.insertCell(6).innerHTML = botonesAcciones(item.id, "productos_proceso", "proceso");
    });
}

function renderizarMateriaPrima() {

    let tabla = document.getElementById("tablaMateriaPrima");
    tabla.innerHTML = "";

    materiaPrima.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;
        fila.insertCell(0).textContent = item.tela;
        fila.insertCell(1).textContent = item.color;
        fila.insertCell(2).textContent = item.cantidad;
        fila.insertCell(3).textContent = obtenerEstado(item.cantidad);
        fila.insertCell(4).innerHTML = botonesAcciones(item.id, "materia_prima", "materia");
    });
}

function renderizarSuministros() {

    let tabla = document.getElementById("tablaSuministros");
    tabla.innerHTML = "";

    suministros.forEach(function (item) {

        let fila = tabla.insertRow();
        fila.dataset.id = item.id;
        fila.insertCell(0).textContent = item.nombre;
        fila.insertCell(1).textContent = item.color;
        fila.insertCell(2).textContent = item.cantidad;
        fila.insertCell(3).textContent = obtenerEstado(item.cantidad);
        fila.insertCell(4).innerHTML = botonesAcciones(item.id, "suministros", "suministros");
    });
}

// ========================================
// EDITAR
// ========================================

function editarRegistro(id, tabla, seccion) {

    let item = null;

    if (seccion === "terminados") {
        item = productosTerminados.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id,
            tabla: tabla,
            seccion: seccion,
            btnId: "btnPt",
            btnCancelId: "btnCancelPt",
            btnTexto: "Agregar",
            campos: [
                { id: "ptProducto", valor: item.producto },
                { id: "ptTalla", valor: item.talla },
                { id: "ptColor", valor: item.color },
                { id: "ptCantidad", valor: item.cantidad }
            ]
        });
    }

    if (seccion === "proceso") {
        item = productosProceso.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id,
            tabla: tabla,
            seccion: seccion,
            btnId: "btnPp",
            btnCancelId: "btnCancelPp",
            btnTexto: "Agregar",
            campos: [
                { id: "ppProducto", valor: item.producto },
                { id: "ppTalla", valor: item.talla },
                { id: "ppColor", valor: item.color },
                { id: "ppCantidad", valor: item.cantidad },
                { id: "ppMaquiladora", valor: item.maquiladora }
            ]
        });
    }

    if (seccion === "materia") {
        item = materiaPrima.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id,
            tabla: tabla,
            seccion: seccion,
            btnId: "btnMp",
            btnCancelId: "btnCancelMp",
            btnTexto: "Agregar",
            campos: [
                { id: "mpTela", valor: item.tela },
                { id: "mpColor", valor: item.color },
                { id: "mpCantidad", valor: item.cantidad }
            ]
        });
    }

    if (seccion === "suministros") {
        item = suministros.find(function (p) { return p.id === id; });
        if (!item) return;
        iniciarEdicion({
            id: id,
            tabla: tabla,
            seccion: seccion,
            btnId: "btnSu",
            btnCancelId: "btnCancelSu",
            btnTexto: "Agregar",
            campos: [
                { id: "suNombre", valor: item.nombre },
                { id: "suColor", valor: item.color },
                { id: "suCantidad", valor: item.cantidad }
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

    if (seccion === "terminados") {
        productosTerminados = productosTerminados.filter(function (p) { return p.id !== id; });
        renderizarTerminados();
    }

    if (seccion === "proceso") {
        productosProceso = productosProceso.filter(function (p) { return p.id !== id; });
        renderizarProceso();
    }

    if (seccion === "materia") {
        materiaPrima = materiaPrima.filter(function (p) { return p.id !== id; });
        renderizarMateriaPrima();
    }

    if (seccion === "suministros") {
        suministros = suministros.filter(function (p) { return p.id !== id; });
        renderizarSuministros();
    }
}

// ========================================
// PRODUCTOS TERMINADOS
// ========================================

async function agregarProductoTerminado() {

    let producto = document.getElementById("ptProducto").value.trim();
    let talla = document.getElementById("ptTalla").value;
    let color = document.getElementById("ptColor").value.trim();
    let cantidad = parseInt(document.getElementById("ptCantidad").value);

    if (producto === "" || talla === "" || color === "" || isNaN(cantidad)) {
        alert("Complete todos los campos");
        return;
    }

    let datos = { producto: producto, talla: talla, color: color, cantidad: cantidad };

    if (edicionActiva && edicionActiva.seccion === "terminados") {

        let actualizado = await actualizarRegistro("productos_terminados", edicionActiva.id, datos);

        if (!actualizado) return;

        let indice = productosTerminados.findIndex(function (p) { return p.id === edicionActiva.id; });
        productosTerminados[indice] = actualizado;
        renderizarTerminados();
        cancelarEdicion();
        return;
    }

    let registro = await insertarRegistro("productos_terminados", datos);

    if (!registro) return;

    productosTerminados.unshift(registro);
    renderizarTerminados();
    limpiarCampos(["ptProducto", "ptTalla", "ptColor", "ptCantidad"]);
}

// ========================================
// PRODUCTOS EN PROCESO
// ========================================

async function agregarProductoProceso() {

    let producto = document.getElementById("ppProducto").value.trim();
    let talla = document.getElementById("ppTalla").value;
    let color = document.getElementById("ppColor").value.trim();
    let cantidad = parseInt(document.getElementById("ppCantidad").value);
    let maquiladora = document.getElementById("ppMaquiladora").value.trim();

    if (producto === "" || talla === "" || color === "" || maquiladora === "" || isNaN(cantidad)) {
        alert("Complete todos los campos");
        return;
    }

    let datos = { producto: producto, talla: talla, color: color, cantidad: cantidad, maquiladora: maquiladora };

    if (edicionActiva && edicionActiva.seccion === "proceso") {

        let actualizado = await actualizarRegistro("productos_proceso", edicionActiva.id, datos);

        if (!actualizado) return;

        let indice = productosProceso.findIndex(function (p) { return p.id === edicionActiva.id; });
        productosProceso[indice] = actualizado;
        renderizarProceso();
        cancelarEdicion();
        return;
    }

    let registro = await insertarRegistro("productos_proceso", datos);

    if (!registro) return;

    productosProceso.unshift(registro);
    renderizarProceso();
    limpiarCampos(["ppProducto", "ppTalla", "ppColor", "ppCantidad", "ppMaquiladora"]);
}

// ========================================
// MATERIA PRIMA
// ========================================

async function agregarMateriaPrima() {

    let tela = document.getElementById("mpTela").value.trim();
    let color = document.getElementById("mpColor").value.trim();
    let cantidad = parseInt(document.getElementById("mpCantidad").value);

    if (tela === "" || color === "" || isNaN(cantidad)) {
        alert("Complete todos los campos");
        return;
    }

    let datos = { tela: tela, color: color, cantidad: cantidad };

    if (edicionActiva && edicionActiva.seccion === "materia") {

        let actualizado = await actualizarRegistro("materia_prima", edicionActiva.id, datos);

        if (!actualizado) return;

        let indice = materiaPrima.findIndex(function (p) { return p.id === edicionActiva.id; });
        materiaPrima[indice] = actualizado;
        renderizarMateriaPrima();
        cancelarEdicion();
        return;
    }

    let registro = await insertarRegistro("materia_prima", datos);

    if (!registro) return;

    materiaPrima.unshift(registro);
    renderizarMateriaPrima();
    limpiarCampos(["mpTela", "mpColor", "mpCantidad"]);
}

// ========================================
// SUMINISTROS
// ========================================

async function agregarSuministro() {

    let suministro = document.getElementById("suNombre").value;
    let color = document.getElementById("suColor").value.trim();
    let cantidad = parseInt(document.getElementById("suCantidad").value);

    if (suministro === "" || color === "" || isNaN(cantidad)) {
        alert("Complete todos los campos");
        return;
    }

    let datos = { nombre: suministro, color: color, cantidad: cantidad };

    if (edicionActiva && edicionActiva.seccion === "suministros") {

        let actualizado = await actualizarRegistro("suministros", edicionActiva.id, datos);

        if (!actualizado) return;

        let indice = suministros.findIndex(function (p) { return p.id === edicionActiva.id; });
        suministros[indice] = actualizado;
        renderizarSuministros();
        cancelarEdicion();
        return;
    }

    let registro = await insertarRegistro("suministros", datos);

    if (!registro) return;

    suministros.unshift(registro);
    renderizarSuministros();
    limpiarCampos(["suNombre", "suColor", "suCantidad"]);
}
