/**
 * UI — SweetAlert2 + toasts + paginación (heurísticas Nielsen)
 */
(function () {
    "use strict";

    var PAGE_SIZE = 8;

    function swalDisponible() {
        return typeof Swal !== "undefined";
    }

    window.mostrarExito = function (mensaje) {
        if (swalDisponible()) {
            return Swal.fire({
                icon: "success",
                title: "Listo",
                text: mensaje,
                timer: 2600,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
        }
        alert(mensaje);
    };

    window.mostrarError = function (mensaje) {
        if (swalDisponible()) {
            return Swal.fire({ icon: "error", title: "Error", text: mensaje, confirmButtonColor: "#003b73" });
        }
        alert(mensaje);
    };

    window.mostrarAviso = function (mensaje) {
        if (swalDisponible()) {
            return Swal.fire({
                icon: "warning",
                title: "Atención",
                text: mensaje,
                confirmButtonColor: "#003b73"
            });
        }
        alert(mensaje);
    };

    window.confirmarAccion = function (mensaje, onOk, opts) {
        opts = opts || {};
        if (swalDisponible()) {
            Swal.fire({
                title: opts.titulo || "¿Confirmar operación?",
                text: mensaje,
                icon: opts.icono || "question",
                showCancelButton: true,
                confirmButtonColor: opts.peligro ? "#c0392b" : "#003b73",
                cancelButtonColor: "#64748b",
                confirmButtonText: opts.okTexto || "Sí, continuar",
                cancelButtonText: "Cancelar",
                reverseButtons: true
            }).then(function (r) {
                if (r.isConfirmed && typeof onOk === "function") onOk();
            });
            return;
        }
        if (confirm(mensaje) && typeof onOk === "function") onOk();
    };

    /** Paginación reutilizable para tablas */
    window.crearPaginador = function (config) {
        var estado = {
            page: 1,
            pageSize: config.pageSize || PAGE_SIZE,
            data: [],
            containerId: config.containerId,
            tbodyId: config.tbodyId,
            renderRow: config.renderRow,
            emptyMsg: config.emptyMsg || "No hay registros para mostrar."
        };

        function totalPages() {
            return Math.max(1, Math.ceil(estado.data.length / estado.pageSize));
        }

        function render() {
            var tbody = document.getElementById(estado.tbodyId);
            var cont = document.getElementById(estado.containerId);
            if (!tbody) return;
            tbody.innerHTML = "";

            if (!estado.data.length) {
                var tr = tbody.insertRow();
                var td = tr.insertCell(0);
                td.colSpan = 12;
                td.className = "tabla-vacia";
                td.textContent = estado.emptyMsg;
                if (cont) cont.innerHTML = "";
                return;
            }

            if (estado.page > totalPages()) estado.page = totalPages();
            var start = (estado.page - 1) * estado.pageSize;
            var slice = estado.data.slice(start, start + estado.pageSize);
            slice.forEach(function (item, i) {
                estado.renderRow(item, tbody, start + i);
            });

            if (!cont) return;
            var desde = start + 1;
            var hasta = Math.min(start + estado.pageSize, estado.data.length);
            cont.innerHTML =
                '<div class="paginacion" role="navigation" aria-label="Paginación de tabla">' +
                '<span class="paginacion-info">Mostrando ' + desde + "–" + hasta +
                " de " + estado.data.length + "</span>" +
                '<div class="paginacion-btns">' +
                '<button type="button" class="btn-pag" data-pag="prev" ' +
                (estado.page <= 1 ? "disabled" : "") + ">Anterior</button>" +
                '<span class="paginacion-pagina">Pág. ' + estado.page + " / " + totalPages() + "</span>" +
                '<button type="button" class="btn-pag" data-pag="next" ' +
                (estado.page >= totalPages() ? "disabled" : "") + ">Siguiente</button>" +
                "</div></div>";

            cont.querySelectorAll(".btn-pag").forEach(function (btn) {
                btn.onclick = function () {
                    if (btn.disabled) return;
                    if (btn.getAttribute("data-pag") === "prev") estado.page--;
                    else estado.page++;
                    render();
                };
            });
        }

        return {
            setData: function (arr) {
                estado.data = arr || [];
                estado.page = 1;
                render();
            },
            refresh: render,
            getPage: function () { return estado.page; }
        };
    };

    window.toggleSidebarMovil = function () {
        document.body.classList.toggle("nav-abierta");
    };
})();
