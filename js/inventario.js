// INVENTARIO v2 — paginación + confirmaciones

var variantes = [], proveedores = [], materiaPrima = [], suministros = [];
var pagTerm, pagMat, pagSum;

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();

    pagTerm = crearPaginador({
        tbodyId: "tablaTerminados",
        containerId: "pagTerminados",
        pageSize: 10,
        emptyMsg: "Sin stock terminado.",
        renderRow: function (v, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = v.producto;
            f.insertCell(1).textContent = v.color;
            f.insertCell(2).textContent = v.talla;
            f.insertCell(3).textContent = v.precio;
            f.insertCell(4).textContent = v.stock;
            f.insertCell(5).textContent = obtenerEstado(v.stock);
        }
    });

    pagMat = crearPaginador({
        tbodyId: "tablaMateriaPrima",
        containerId: "pagMateria",
        emptyMsg: "Sin materia prima registrada.",
        renderRow: function (m, tbody) {
            var f = tbody.insertRow();
            f.dataset.id = m.id;
            f.insertCell(0).textContent = m.proveedores ? m.proveedores.nombre : "";
            f.insertCell(1).textContent = m.nombre;
            f.insertCell(2).textContent = m.precio;
            f.insertCell(3).textContent = m.stock_actual + " " + (m.unidad || "m");
            f.insertCell(4).textContent = obtenerEstado(Math.floor(m.stock_actual));
            f.insertCell(5).innerHTML = '<button class="btn-editar" onclick="editarMateria(\'' + m.id + '\')">Editar</button>';
        }
    });

    pagSum = crearPaginador({
        tbodyId: "tablaSuministros",
        containerId: "pagSuministros",
        emptyMsg: "Sin suministros registrados.",
        renderRow: function (s, tbody) {
            var f = tbody.insertRow();
            f.dataset.id = s.id;
            f.insertCell(0).textContent = s.nombre;
            f.insertCell(1).textContent = s.tipo;
            f.insertCell(2).textContent = s.stock_actual;
            f.insertCell(3).textContent = obtenerEstado(Math.floor(s.stock_actual));
            f.insertCell(4).innerHTML = '<button class="btn-editar" onclick="editarSuministro(\'' + s.id + '\')">Editar</button>';
        }
    });

    await cargarDatos();
});

async function cargarDatos() {
    variantes = await obtenerVariantes();
    proveedores = await obtenerRegistros("proveedores");
    materiaPrima = await obtenerRegistros("materia_prima", "*, proveedores(nombre)");
    suministros = await obtenerRegistros("suministros");
    llenarSelect("mpProveedor", proveedores, "id", "nombre", "Proveedor");
    pagTerm.setData(variantes);
    pagMat.setData(materiaPrima);
    pagSum.setData(suministros);
}

function mostrarSeccion(id) {
    document.getElementById("menuInventario").style.display = "none";
    ["terminados", "materia", "suministros"].forEach(function (s) {
        document.getElementById(s).style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}

function volverMenu() {
    document.getElementById("menuInventario").style.display = "grid";
    ["terminados", "materia", "suministros"].forEach(function (s) {
        document.getElementById(s).style.display = "none";
    });
}

function obtenerEstado(c) {
    if (c >= 30) return "Disponible";
    if (c >= 10) return "Stock medio";
    return "Bajo stock";
}

async function agregarMateriaPrima() {
    var prov = document.getElementById("mpProveedor").value;
    var nombre = document.getElementById("mpNombre").value.trim();
    var precio = parseFloat(document.getElementById("mpPrecio").value);
    var stock = parseFloat(document.getElementById("mpStock").value);
    if (!prov || !nombre || isNaN(precio) || isNaN(stock)) {
        mostrarAviso("Complete todos los campos");
        return;
    }

    var editando = edicionActiva && edicionActiva.seccion === "materia";
    confirmarAccion(
        editando ? "Se actualizará el registro de materia prima." : "Se agregará nueva materia prima al inventario.",
        async function () {
            if (editando) {
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
            limpiarCampos(["mpNombre", "mpPrecio", "mpStock"]);
        },
        { titulo: editando ? "Guardar cambios" : "Agregar materia", okTexto: editando ? "Guardar" : "Agregar" }
    );
}

function editarMateria(id) {
    var m = materiaPrima.find(function (x) { return x.id === id; });
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
    if (!nombre || !tipo || isNaN(stock)) {
        mostrarAviso("Complete todos los campos");
        return;
    }

    var editando = edicionActiva && edicionActiva.seccion === "suministros";
    confirmarAccion(
        editando ? "Se actualizará el suministro." : "Se agregará un nuevo suministro.",
        async function () {
            if (editando) {
                await actualizarRegistro("suministros", edicionActiva.id, {
                    nombre: nombre, tipo: tipo, stock_actual: stock
                });
                cancelarEdicion();
                mostrarExito("Suministro actualizado.");
            } else {
                await insertarRegistro("suministros", {
                    nombre: nombre, tipo: tipo, stock_actual: stock, precio: 0
                });
                mostrarExito("Suministro agregado.");
            }
            await cargarDatos();
            limpiarCampos(["suNombre", "suStock"]);
        },
        { titulo: editando ? "Guardar cambios" : "Agregar suministro", okTexto: editando ? "Guardar" : "Agregar" }
    );
}

function editarSuministro(id) {
    var s = suministros.find(function (x) { return x.id === id; });
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
