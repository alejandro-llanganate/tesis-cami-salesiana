(function () {
    "use strict";

    window.edicionActiva = null;

    window.iniciarEdicion = function (config) {

        if (window.edicionActiva) {
            window.cancelarEdicion();
        }

        window.edicionActiva = config;

        config.campos.forEach(function (campo) {
            var elemento = document.getElementById(campo.id);
            if (elemento) {
                elemento.value = campo.valor;
            }
        });

        var boton = document.getElementById(config.btnId);
        if (boton) {
            boton.textContent = "Guardar cambios";
            boton.classList.add("btn-guardar");
        }

        var cancelar = document.getElementById(config.btnCancelId);
        if (cancelar) {
            cancelar.style.display = "inline-block";
        }
    };

    window.cancelarEdicion = function () {

        if (!window.edicionActiva) {
            return;
        }

        var config = window.edicionActiva;

        config.campos.forEach(function (campo) {
            var elemento = document.getElementById(campo.id);
            if (elemento) {
                elemento.value = "";
            }
        });

        var boton = document.getElementById(config.btnId);
        if (boton) {
            boton.textContent = config.btnTexto || "Agregar";
            boton.classList.remove("btn-guardar");
        }

        var cancelar = document.getElementById(config.btnCancelId);
        if (cancelar) {
            cancelar.style.display = "none";
        }

        window.edicionActiva = null;
    };

    window.limpiarCampos = function (ids) {
        ids.forEach(function (id) {
            var elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = "";
            }
        });
    };

    window.botonesAcciones = function (id, tabla, seccion) {
        return (
            '<button class="btn-editar" onclick="editarRegistro(\'' + id + '\', \'' + tabla + '\', \'' + seccion + '\')">Editar</button> ' +
            '<button class="btn-eliminar" onclick="eliminarRegistroFila(\'' + id + '\', \'' + tabla + '\', \'' + seccion + '\')">Eliminar</button>'
        );
    };

})();
