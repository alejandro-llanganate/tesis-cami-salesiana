
document.addEventListener("DOMContentLoaded", async function () {
  if (!sessionStorage.getItem("martin_sesion")) {
    window.location.href = "login.html";
    return;
  }
  configurarSidebar();
  var kpis = await obtenerKPIs();
  document.getElementById("kpiActivos").textContent = kpis.pedidos_activos || 0;
  document.getElementById("kpiOrdenes").textContent = kpis.ordenes_activas || 0;
  document.getElementById("kpiAlertas").textContent = kpis.alertas_activas || 0;
  document.getElementById("kpiStock").textContent = kpis.stock_total || 0;
  document.getElementById("kpiCalidad").textContent = kpis.inspecciones_aprobadas || 0;
  document.getElementById("kpiEntregas").textContent = kpis.entregas_realizadas || 0;
});
