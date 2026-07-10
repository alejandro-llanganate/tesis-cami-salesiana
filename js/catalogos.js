(function () {
    "use strict";

    window.llenarSelect = function (id, items, valorKey, textoKey, placeholder) {
        var sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = "";
        var def = document.createElement("option");
        def.value = "";
        def.textContent = placeholder || "Seleccione";
        sel.appendChild(def);
        (items || []).forEach(function (item) {
            var opt = document.createElement("option");
            opt.value = item[valorKey];
            opt.textContent = item[textoKey];
            sel.appendChild(opt);
        });
    };

    window.llenarSelectVariantes = function (id, variantes) {
        var sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">Seleccione producto</option>';
        variantes.forEach(function (v) {
            var opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = v.etiqueta + " (Stock: " + v.stock + ")";
            sel.appendChild(opt);
        });
    };

    window.filtrarColoresPorProducto = function (variantes, productoNombre) {
        var colores = {};
        variantes.filter(function (v) { return v.producto === productoNombre; })
            .forEach(function (v) { colores[v.color] = true; });
        return Object.keys(colores).sort();
    };

    window.filtrarTallasPorProductoColor = function (variantes, producto, color) {
        return variantes.filter(function (v) {
            return v.producto === producto && v.color === color;
        });
    };

    window.buscarVarianteId = function (variantes, producto, color, talla) {
        var v = variantes.find(function (x) {
            return x.producto === producto && x.color === color && x.talla === talla;
        });
        return v ? v.id : null;
    };

    window.estadoPedidoTexto = function (estado) {
        var mapa = {
            registrado: "Registrado",
            stock_insuficiente: "Stock insuficiente",
            solicitud_compra: "Solicitud compra",
            materia_recibida: "Materia lista",
            en_produccion: "En producción",
            control_calidad: "Control calidad",
            aprobado_calidad: "Aprobado calidad",
            empaquetado: "Empaquetado",
            entregado: "Entregado",
            completado: "Completado",
            cancelado: "Cancelado"
        };
        return mapa[estado] || estado;
    };

    window.badgeEstado = function (estado) {
        var cls = "badge rounded-pill badge-estado badge-" + (estado || "default").replace(/_/g, "-");
        return '<span class="' + cls + '">' + estadoPedidoTexto(estado) + "</span>";
    };

    window.configurarSidebar = function () {
        var sesion = requerirSesion();
        if (!sesion) return;

        var sidebar = document.getElementById("appSidebar") || document.querySelector(".app-sidebar");
        if (!sidebar) return;

        var rol = sesion.rol;
        var rolTxt = rol === "supervisora" ? "Supervisora" : "Maquiladora";
        var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";

        var items = [
            { href: "index.html", texto: "Inicio", icon: "bi-house-door", roles: null },
            { href: "inventario.html", texto: "Inventario", icon: "bi-box-seam", roles: ["supervisora"] },
            { href: "pedidos.html", texto: "Pedidos", icon: "bi-clipboard-check", roles: ["supervisora"] },
            { href: "produccion.html", texto: "Producción", icon: "bi-gear", roles: null },
            { href: "calidad.html", texto: "Calidad", icon: "bi-shield-check", roles: ["supervisora"] },
            { href: "reportes.html", texto: "Reportes", icon: "bi-bar-chart", roles: ["supervisora"] }
        ];

        var links = items.filter(function (item) {
            return !item.roles || item.roles.indexOf(rol) !== -1;
        }).map(function (item) {
            var active = page === item.href ? " active" : "";
            return (
                '<a class="nav-link' + active + '" href="' + item.href + '">' +
                '<i class="bi ' + item.icon + '" aria-hidden="true"></i>' +
                "<span>" + item.texto + "</span></a>"
            );
        }).join("");

        var inicial = (sesion.nombre || "?").trim().charAt(0).toUpperCase();

        sidebar.innerHTML =
            '<div class="app-brand">' +
            '<img src="img/LOGO.jpeg" alt="Logo MARTIN">' +
            '<div class="brand-text"><strong>MARTIN</strong><small>Producción</small></div>' +
            "</div>" +
            '<nav class="app-nav nav flex-column" aria-label="Menú principal">' + links + "</nav>" +
            '<div class="app-user">' +
            '<div class="d-flex align-items-center gap-2 mb-2">' +
            '<div class="avatar" aria-hidden="true">' + inicial + "</div>" +
            '<div class="overflow-hidden">' +
            '<div class="fw-semibold text-truncate" style="max-width:140px">' + sesion.nombre + "</div>" +
            '<div class="small text-white-50">' + rolTxt + "</div>" +
            "</div></div>" +
            '<button type="button" class="btn btn-sm btn-outline-light w-100" onclick="confirmarCerrarSesion()">' +
            '<i class="bi bi-box-arrow-right me-1"></i>Cerrar sesión</button>' +
            "</div>";

        if (!document.querySelector(".app-topbar")) {
            var top = document.createElement("header");
            top.className = "app-topbar";
            top.innerHTML =
                '<button type="button" class="btn btn-sm btn-outline-light" onclick="toggleSidebarMovil()" aria-label="Menú">' +
                '<i class="bi bi-list fs-5"></i></button>' +
                '<strong class="flex-grow-1">MARTIN Company</strong>' +
                '<span class="small opacity-75">' + sesion.nombre.split(" ")[0] + "</span>";
            document.body.insertBefore(top, document.body.firstChild);
        }
        if (!document.querySelector(".app-backdrop")) {
            var back = document.createElement("div");
            back.className = "app-backdrop";
            back.onclick = function () { document.body.classList.remove("nav-abierta"); };
            document.body.appendChild(back);
        }
    };

    window.confirmarCerrarSesion = function () {
        confirmarAccion("Se cerrará la sesión actual.", function () {
            cerrarSesion();
        }, { titulo: "Cerrar sesión", okTexto: "Sí, salir" });
    };
})();
