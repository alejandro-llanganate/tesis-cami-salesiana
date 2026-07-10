// PRODUCCIÓN — paginación + SweetAlert

var ordenes = [];
var pagOrdenes, pagAlertas;

document.addEventListener("DOMContentLoaded", async function () {
    configurarSidebar();

    pagOrdenes = crearPaginador({
        tbodyId: "tablaOrdenes",
        containerId: "pagOrdenes",
        emptyMsg: "No hay órdenes de producción.",
        renderRow: function (o, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = o.pedidos ? o.pedidos.numero : "";
            f.insertCell(1).textContent = o.perfiles ? o.perfiles.nombre : "";
            f.insertCell(2).textContent = o.estado;
            f.insertCell(3).textContent = o.porcentaje_avance + "%";
            f.insertCell(4).textContent = o.fecha_fin_planeada;
            var retraso = new Date(o.fecha_fin_planeada) < new Date() && o.porcentaje_avance < 100;
            f.insertCell(5).innerHTML = retraso
                ? '<span class="badge badge-stock-insuficiente">Retraso</span>'
                : '<span class="badge badge-completado">A tiempo</span>';
            f.insertCell(6).innerHTML =
                '<button class="btn-avance" onclick="abrirAvance(\'' + o.id + '\',' + o.porcentaje_avance + ')">Registrar avance</button>';
        }
    });

    pagAlertas = crearPaginador({
        tbodyId: "tablaAlertas",
        containerId: "pagAlertas",
        pageSize: 5,
        emptyMsg: "Sin alertas activas.",
        renderRow: function (a, tbody) {
            var f = tbody.insertRow();
            f.insertCell(0).textContent = a.tipo;
            f.insertCell(1).textContent = a.mensaje;
            f.insertCell(2).textContent = new Date(a.created_at).toLocaleDateString();
        }
    });

    await cargarOrdenes();
});

async function cargarOrdenes() {
    ordenes = await obtenerOrdenes();
    var sesion = requerirSesion();
    if (sesion.rol === "maquiladora") {
        ordenes = ordenes.filter(function (o) { return o.maquiladora_id === sesion.id; });
    }
    pagOrdenes.setData(ordenes);

    var alertas = await obtenerRegistros("alertas_produccion");
    pagAlertas.setData(alertas.filter(function (a) { return a.activa; }));
}

function abrirAvance(ordenId, avanceActual) {
    document.getElementById("avanceOrdenId").value = ordenId;
    document.getElementById("avancePct").value = Math.min(avanceActual + 25, 100);
    document.getElementById("avanceDesc").value = "";
    document.getElementById("modalAvance").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalAvance").style.display = "none";
}

async function guardarAvance() {
    var ordenId = document.getElementById("avanceOrdenId").value;
    var pct = parseInt(document.getElementById("avancePct").value);
    var desc = document.getElementById("avanceDesc").value;
    var sesion = JSON.parse(sessionStorage.getItem("martin_sesion"));

    if (isNaN(pct) || pct < 0 || pct > 100) {
        mostrarAviso("Porcentaje inválido (0–100)");
        return;
    }

    confirmarAccion("Se registrará un avance del " + pct + "%.", async function () {
        var resultado = await llamarRPC("registrar_avance_produccion", {
            p_orden_id: ordenId,
            p_porcentaje: pct,
            p_descripcion: desc,
            p_registrado_por: sesion.id
        });

        if (resultado) {
            if (resultado.retraso) mostrarAviso("La orden tiene retraso respecto a la fecha planeada.");
            if (pct >= 100) mostrarExito("Producción completada. Pasa a control de calidad.");
            else mostrarExito("Avance registrado: " + pct + "%");
            cerrarModal();
            await cargarOrdenes();
        }
    }, { titulo: "Registrar avance", okTexto: "Guardar" });
}
