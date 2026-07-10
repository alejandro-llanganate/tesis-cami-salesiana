
// INVENTARIO v2 — catálogos relacionados, sin duplicados

var variantes = [], proveedores = [], materiaPrima = [], suministros = [];

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();
    await cargarDatos();
});

async function cargarDatos() {
    variantes = await obtenerVariantes();
    proveedores = await obtenerRegistros("proveedores");
    materiaPrima = await obtenerRegistros("materia_prima", "*, proveedores(nombre)");
    suministros = await obtenerRegistros("suministros");
    llenarSelect("mpProveedor", proveedores, "id", "nombre", "Proveedor");
    renderizarTerminados();
    renderizarMateria();
    renderizarSuministros();
}

function mostrarSeccion(id) {
    document.getElementById("menuInventario").style.display = "none";
    ["terminados","materia","suministros"].forEach(function(s){ document.getElementById(s).style.display="none"; });
    document.getElementById(id).style.display = "block";
}

function volverMenu() {
    document.getElementById("menuInventario").style.display = "flex";
    ["terminados","materia","suministros"].forEach(function(s){ document.getElementById(s).style.display="none"; });
}

function obtenerEstado(c) {
    if (c >= 30) return "🟢 Disponible";
    if (c >= 10) return "🟡 Stock Medio";
    return "🔴 Bajo Stock";
}

function renderizarTerminados() {
    var t = document.getElementById("tablaTerminados");
    t.innerHTML = "";
    variantes.forEach(function(v) {
        var f = t.insertRow();
        f.insertCell(0).textContent = v.producto;
        f.insertCell(1).textContent = v.color;
        f.insertCell(2).textContent = v.talla;
        f.insertCell(3).textContent = v.precio;
        f.insertCell(4).textContent = v.stock;
        f.insertCell(5).textContent = obtenerEstado(v.stock);
    });
}

function renderizarMateria() {
    var t = document.getElementById("tablaMateriaPrima");
    t.innerHTML = "";
    materiaPrima.forEach(function(m) {
        var f = t.insertRow();
        f.dataset.id = m.id;
        f.insertCell(0).textContent = m.proveedores ? m.proveedores.nombre : "";
        f.insertCell(1).textContent = m.nombre;
        f.insertCell(2).textContent = m.precio;
        f.insertCell(3).textContent = m.stock_actual + " " + m.unidad;
        f.insertCell(4).textContent = obtenerEstado(Math.floor(m.stock_actual));
        f.insertCell(5).innerHTML = '<button class="btn-editar" onclick="editarMateria(\''+m.id+'\')">Editar</button>';
    });
}

function renderizarSuministros() {
    var t = document.getElementById("tablaSuministros");
    t.innerHTML = "";
    suministros.forEach(function(s) {
        var f = t.insertRow();
        f.dataset.id = s.id;
        f.insertCell(0).textContent = s.nombre;
        f.insertCell(1).textContent = s.tipo;
        f.insertCell(2).textContent = s.stock_actual;
        f.insertCell(3).textContent = obtenerEstado(Math.floor(s.stock_actual));
        f.insertCell(4).innerHTML = '<button class="btn-editar" onclick="editarSuministro(\''+s.id+'\')">Editar</button>';
    });
}

async function agregarMateriaPrima() {
    var prov = document.getElementById("mpProveedor").value;
    var nombre = document.getElementById("mpNombre").value.trim();
    var precio = parseFloat(document.getElementById("mpPrecio").value);
    var stock = parseFloat(document.getElementById("mpStock").value);
    if (!prov || !nombre || isNaN(precio) || isNaN(stock)) { mostrarAviso("Complete todos los campos"); return; }

    if (edicionActiva && edicionActiva.seccion === "materia") {
        await actualizarRegistro("materia_prima", edicionActiva.id, {
            proveedor_id: prov, nombre: nombre, precio: precio, stock_actual: stock
        });
        cancelarEdicion();
        mostrarExito("Materia prima actualizada.");
    } else {
        await insertarRegistro("materia_prima", {
            proveedor_id: prov, nombre: nombre, precio: precio, stock_actual: stock
        });
        mostrarExito("Materia prima agregada.");
    }
    await cargarDatos();
    limpiarCampos(["mpNombre","mpPrecio","mpStock"]);
}

function editarMateria(id) {
    var m = materiaPrima.find(function(x){ return x.id === id; });
    if (!m) return;
    iniciarEdicion({
        id: id, seccion: "materia", btnId: "btnMp", btnCancelId: "btnCancelMp", btnTexto: "Agregar",
        campos: [
            { id: "mpProveedor", valor: m.proveedor_id },
            { id: "mpNombre", valor: m.nombre },
            { id: "mpPrecio", valor: m.precio },
            { id: "mpStock", valor: m.stock_actual }
        ]
    });
}

async function agregarSuministro() {
    var nombre = document.getElementById("suNombre").value.trim();
    var tipo = document.getElementById("suTipo").value;
    var stock = parseFloat(document.getElementById("suStock").value);
    if (!nombre || !tipo || isNaN(stock)) { mostrarAviso("Complete todos los campos"); return; }

    if (edicionActiva && edicionActiva.seccion === "suministros") {
        await actualizarRegistro("suministros", edicionActiva.id, { nombre: nombre, tipo: tipo, stock_actual: stock });
        cancelarEdicion();
        mostrarExito("Suministro actualizado.");
    } else {
        await insertarRegistro("suministros", { nombre: nombre, tipo: tipo, stock_actual: stock, precio: 0 });
        mostrarExito("Suministro agregado.");
    }
    await cargarDatos();
    limpiarCampos(["suNombre","suStock"]);
}

function editarSuministro(id) {
    var s = suministros.find(function(x){ return x.id === id; });
    if (!s) return;
    iniciarEdicion({
        id: id, seccion: "suministros", btnId: "btnSu", btnCancelId: "btnCancelSu", btnTexto: "Agregar",
        campos: [
            { id: "suNombre", valor: s.nombre },
            { id: "suTipo", valor: s.tipo },
            { id: "suStock", valor: s.stock_actual }
        ]
    });
}
