// CALIDAD — paginación + SweetAlert

var ordenesCalidad = [], criterios = [], inspeccionItems = {};
var pagCalidad;

document.addEventListener("DOMContentLoaded", async function () {
    if (!esSupervisora()) { window.location.href = "produccion.html"; return; }
    configurarSidebar();
    criterios = await obtenerRegistros("criterios_calidad");
    criterios.sort(function (a, b) { return a.codigo - b.codigo; });

    pagCalidad = crearPaginador({
        tbodyId: "tablaOrdenesCalidad",
        containerId: "pagCalidad",
        emptyMsg: "No hay órdenes pendientes de inspección.",
        renderRow: function (o, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = o.pedidos ? o.pedidos.numero : "";
            f.insertCell(1).textContent = o.perfiles ? o.perfiles.nombre : "";
            f.insertCell(2).textContent = o.porcentaje_avance + "%";
            f.insertCell(3).innerHTML =
                '<button class="btn-calidad" onclick="iniciarInspeccion(\'' + o.id + '\')">Inspeccionar</button>';
        }
    });

    await cargarOrdenesCalidad();
});

async function cargarOrdenesCalidad() {
    var todas = await obtenerOrdenes();
    ordenesCalidad = todas.filter(function (o) {
        return o.estado === "control_calidad" || (o.estado === "avance" && o.porcentaje_avance >= 100);
    });
    pagCalidad.setData(ordenesCalidad);
}

function iniciarInspeccion(ordenId) {
    document.getElementById("inspOrdenId").value = ordenId;
    inspeccionItems = {};
    var cont = document.getElementById("criteriosLista");
    cont.innerHTML = "";

    criterios.forEach(function (c) {
        var div = document.createElement("div");
        div.className = "criterio-item formulario";
        div.innerHTML =
            "<h4>" + c.codigo + ". " + c.parametro +
            ' <span class="badge-' + c.criticidad.toLowerCase() + '">' + c.criticidad + "</span></h4>" +
            "<p><small>" + c.criterio + "</small></p>" +
            "<p><small>Método: " + c.metodo + "</small></p>" +
            '<label><input type="radio" name="crit_' + c.id + '" value="si" onchange="marcarCriterio(\'' + c.id + '\',true)"> Cumple</label> ' +
            '<label><input type="radio" name="crit_' + c.id + '" value="no" onchange="marcarCriterio(\'' + c.id + '\',false)"> No cumple</label>' +
            '<input type="text" id="obs_' + c.id + '" placeholder="Observación (opcional)" style="width:100%;margin-top:8px;">';
        cont.appendChild(div);
    });

    document.getElementById("seccionInspeccion").style.display = "block";
    window.scrollTo(0, document.getElementById("seccionInspeccion").offsetTop - 20);
}

function marcarCriterio(criterioId, cumple) {
    inspeccionItems[criterioId] = cumple;
}

async function guardarInspeccion() {
    var ordenId = document.getElementById("inspOrdenId").value;
    var sesion = JSON.parse(sessionStorage.getItem("martin_sesion"));

    if (Object.keys(inspeccionItems).length < criterios.length) {
        mostrarAviso("Evalúe los 10 criterios de calidad antes de finalizar");
        return;
    }

    confirmarAccion("Se guardará la inspección y se actualizará el stock si es aprobada.", async function () {
        var inspeccion = await insertarRegistro("inspecciones_calidad", {
            orden_id: ordenId, supervisor_id: sesion.id
        });
        if (!inspeccion) return;

        for (var i = 0; i < criterios.length; i++) {
            var c = criterios[i];
            var obs = document.getElementById("obs_" + c.id);
            await insertarRegistro("inspeccion_items", {
                inspeccion_id: inspeccion.id,
                criterio_id: c.id,
                cumple: inspeccionItems[c.id] === true,
                observacion: obs ? obs.value : ""
            });
        }

        var resultado = await llamarRPC("aprobar_inspeccion_calidad", { p_inspeccion_id: inspeccion.id });
        if (resultado) {
            if (resultado.aprobada) mostrarExito(resultado.mensaje);
            else mostrarError(resultado.mensaje);
            document.getElementById("seccionInspeccion").style.display = "none";
            await cargarOrdenesCalidad();
        }
    }, { titulo: "Finalizar inspección", okTexto: "Guardar inspección" });
}
