
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

    document.getElementById("menuInventario").style.display = "none";

    document.getElementById("terminados").style.display = "none";
    document.getElementById("proceso").style.display = "none";
    document.getElementById("materia").style.display = "none";
    document.getElementById("suministros").style.display = "none";

    document.getElementById(id).style.display = "block";
}

function volverMenu() {

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
        fila.insertCell(5).innerHTML = botonesAcciones(item.id, "productos_terminados");
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
        fila.insertCell(6).innerHTML = botonesAcciones(item.id, "productos_proceso");
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
        fila.insertCell(4).innerHTML = botonesAcciones(item.id, "materia_prima");
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
        fila.insertCell(4).innerHTML = botonesAcciones(item.id, "suministros");
    });
}

function botonesAcciones(id, tabla) {
    return (
        '<button onclick="editarFila(this)">Editar</button> ' +
        '<button onclick="eliminarFila(this, \'' + id + '\', \'' + tabla + '\')">Eliminar</button>'
    );
}

// ========================================
// PRODUCTOS TERMINADOS
// ========================================

async function agregarProductoTerminado() {

    let producto = document.getElementById("ptProducto").value;
    let talla = document.getElementById("ptTalla").value;
    let color = document.getElementById("ptColor").value;
    let cantidad = parseInt(document.getElementById("ptCantidad").value);

    if (
        producto === "" ||
        talla === "" ||
        color === "" ||
        isNaN(cantidad)
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("productos_terminados", {
        producto: producto,
        talla: talla,
        color: color,
        cantidad: cantidad
    });

    if (!registro) {
        return;
    }

    productosTerminados.unshift(registro);
    renderizarTerminados();

    document.getElementById("ptProducto").value = "";
    document.getElementById("ptTalla").value = "";
    document.getElementById("ptColor").value = "";
    document.getElementById("ptCantidad").value = "";
}

// ========================================
// PRODUCTOS EN PROCESO
// ========================================

async function agregarProductoProceso() {

    let producto = document.getElementById("ppProducto").value;
    let talla = document.getElementById("ppTalla").value;
    let color = document.getElementById("ppColor").value;
    let cantidad = parseInt(document.getElementById("ppCantidad").value);
    let maquiladora = document.getElementById("ppMaquiladora").value;

    if (
        producto === "" ||
        talla === "" ||
        color === "" ||
        maquiladora === "" ||
        isNaN(cantidad)
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("productos_proceso", {
        producto: producto,
        talla: talla,
        color: color,
        cantidad: cantidad,
        maquiladora: maquiladora
    });

    if (!registro) {
        return;
    }

    productosProceso.unshift(registro);
    renderizarProceso();

    document.getElementById("ppProducto").value = "";
    document.getElementById("ppTalla").value = "";
    document.getElementById("ppColor").value = "";
    document.getElementById("ppCantidad").value = "";
    document.getElementById("ppMaquiladora").value = "";
}

// ========================================
// MATERIA PRIMA
// ========================================

async function agregarMateriaPrima() {

    let tela = document.getElementById("mpTela").value;
    let color = document.getElementById("mpColor").value;
    let cantidad = parseInt(document.getElementById("mpCantidad").value);

    if (
        tela === "" ||
        color === "" ||
        isNaN(cantidad)
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("materia_prima", {
        tela: tela,
        color: color,
        cantidad: cantidad
    });

    if (!registro) {
        return;
    }

    materiaPrima.unshift(registro);
    renderizarMateriaPrima();

    document.getElementById("mpTela").value = "";
    document.getElementById("mpColor").value = "";
    document.getElementById("mpCantidad").value = "";
}

// ========================================
// SUMINISTROS
// ========================================

async function agregarSuministro() {

    let suministro = document.getElementById("suNombre").value;
    let color = document.getElementById("suColor").value;
    let cantidad = parseInt(document.getElementById("suCantidad").value);

    if (
        suministro === "" ||
        color === "" ||
        isNaN(cantidad)
    ) {
        alert("Complete todos los campos");
        return;
    }

    let registro = await insertarRegistro("suministros", {
        nombre: suministro,
        color: color,
        cantidad: cantidad
    });

    if (!registro) {
        return;
    }

    suministros.unshift(registro);
    renderizarSuministros();

    document.getElementById("suNombre").value = "";
    document.getElementById("suColor").value = "";
    document.getElementById("suCantidad").value = "";
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
        "Para simplificar el prototipo de tesis, copie los datos de la fila y vuelva a registrarlos."
    );
}
