(function () {
    "use strict";

    window.edicionActiva = null;

    window.iniciarEdicion = function (config) {
        if (window.edicionActiva) window.cancelarEdicion();
        window.edicionActiva = config;

        config.campos.forEach(function (campo) {
            var elemento = document.getElementById(campo.id);
            if (elemento) elemento.value = campo.valor;
        });

        var boton = document.getElementById(config.btnId);
        if (boton) {
            boton.textContent = "Guardar cambios";
            boton.classList.remove("btn-primary");
            boton.classList.add("btn-success");
        }

        var cancelar = document.getElementById(config.btnCancelId);
        if (cancelar) cancelar.classList.remove("d-none");
    };

    window.cancelarEdicion = function () {
        if (!window.edicionActiva) return;
        var config = window.edicionActiva;

        config.campos.forEach(function (campo) {
            var elemento = document.getElementById(campo.id);
            if (elemento) elemento.value = "";
        });

        var boton = document.getElementById(config.btnId);
        if (boton) {
            boton.textContent = config.btnTexto || "Agregar";
            boton.classList.remove("btn-success");
            boton.classList.add("btn-primary");
        }

        var cancelar = document.getElementById(config.btnCancelId);
        if (cancelar) cancelar.classList.add("d-none");

        window.edicionActiva = null;
    };

    window.limpiarCampos = function (ids) {
        ids.forEach(function (id) {
            var elemento = document.getElementById(id);
            if (elemento) elemento.value = "";
        });
    };
})();
