/**
 * UI — toasts y confirmaciones (reemplaza alert nativo)
 */
(function () {
    "use strict";

    function asegurarContenedor() {
        var el = document.getElementById("toast-container");
        if (el) return el;
        el = document.createElement("div");
        el.id = "toast-container";
        el.setAttribute("aria-live", "polite");
        document.body.appendChild(el);
        return el;
    }

    function icono(tipo) {
        if (tipo === "exito") return "✓";
        if (tipo === "error") return "!";
        if (tipo === "aviso") return "i";
        return "•";
    }

    window.mostrarToast = function (mensaje, tipo, duracion) {
        tipo = tipo || "exito";
        duracion = duracion == null ? 3200 : duracion;
        var cont = asegurarContenedor();
        var toast = document.createElement("div");
        toast.className = "toast toast-" + tipo;
        toast.innerHTML =
            '<span class="toast-icon">' + icono(tipo) + "</span>" +
            '<span class="toast-msg">' + mensaje + "</span>" +
            '<button type="button" class="toast-cerrar" aria-label="Cerrar">&times;</button>';

        cont.appendChild(toast);
        requestAnimationFrame(function () {
            toast.classList.add("toast-visible");
        });

        function cerrar() {
            toast.classList.remove("toast-visible");
            toast.classList.add("toast-saliendo");
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 280);
        }

        toast.querySelector(".toast-cerrar").onclick = cerrar;
        if (duracion > 0) setTimeout(cerrar, duracion);
        return toast;
    };

    window.mostrarExito = function (mensaje) {
        return window.mostrarToast(mensaje, "exito");
    };

    window.mostrarError = function (mensaje) {
        return window.mostrarToast(mensaje, "error", 4500);
    };

    window.mostrarAviso = function (mensaje) {
        return window.mostrarToast(mensaje, "aviso", 4000);
    };

    window.confirmarAccion = function (mensaje, onOk) {
        var overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.innerHTML =
            '<div class="confirm-card">' +
            '<p class="confirm-msg">' + mensaje + "</p>" +
            '<div class="confirm-acciones">' +
            '<button type="button" class="btn btn-secundario" data-accion="no">Cancelar</button>' +
            '<button type="button" class="btn btn-peligro" data-accion="si">Confirmar</button>' +
            "</div></div>";
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
            overlay.classList.add("confirm-visible");
        });

        function cerrar() {
            overlay.classList.remove("confirm-visible");
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 200);
        }

        overlay.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-accion]");
            if (!btn) {
                if (e.target === overlay) cerrar();
                return;
            }
            if (btn.getAttribute("data-accion") === "si" && typeof onOk === "function") onOk();
            cerrar();
        });
    };
})();
