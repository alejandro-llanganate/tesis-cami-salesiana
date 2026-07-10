
// PRODUCCIÓN — maquiladora registra avance, supervisora ve todo

var ordenes = [];

document.addEventListener("DOMContentLoaded", async function () {
    configurarSidebar();
    await cargarOrdenes();
});

async function cargarOrdenes() {
    ordenes = await obtenerOrdenes();
    var sesion = requerirSesion();
    if (sesion.rol === "maquiladora") {
        ordenes = ordenes.filter(function(o){ return o.maquiladora_id === sesion.id; });
    }
    renderizarOrdenes();
    renderizarAlertas();
}

function renderizarOrdenes() {
    var t = document.getElementById("tablaOrdenes");
    t.innerHTML = "";
    ordenes.forEach(function(o) {
        var f = t.insertRow();
        f.insertCell(0).textContent = o.pedidos ? o.pedidos.numero : "";
        f.insertCell(1).textContent = o.perfiles ? o.perfiles.nombre : "";
        f.insertCell(2).textContent = o.estado;
        f.insertCell(3).textContent = o.porcentaje_avance + "%";
        f.insertCell(4).textContent = o.fecha_fin_planeada;
        var retraso = new Date(o.fecha_fin_planeada) < new Date() && o.porcentaje_avance < 100;
        f.insertCell(5).textContent = retraso ? "🔴 Retraso" : "🟢 A tiempo";
        f.insertCell(6).innerHTML =
            '<button class="btn-avance" onclick="abrirAvance(\''+o.id+'\','+o.porcentaje_avance+')">Registrar avance</button>';
    });
}

async function renderizarAlertas() {
    var alertas = await obtenerRegistros("alertas_produccion");
    var t = document.getElementById("tablaAlertas");
    if (!t) return;
    t.innerHTML = "";
    alertas.filter(function(a){ return a.activa; }).forEach(function(a) {
        var f = t.insertRow();
        f.insertCell(0).textContent = a.tipo;
        f.insertCell(1).textContent = a.mensaje;
        f.insertCell(2).textContent = new Date(a.created_at).toLocaleDateString();
    });
}

function abrirAvance(ordenId, avanceActual) {
    document.getElementById("avanceOrdenId").value = ordenId;
    document.getElementById("avancePct").value = Math.min(avanceActual + 25, 100);
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

    if (isNaN(pct) || pct < 0 || pct > 100) { mostrarAviso("Porcentaje inválido"); return; }

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
}
