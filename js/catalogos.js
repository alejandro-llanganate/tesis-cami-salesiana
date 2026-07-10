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
        items.forEach(function (item) {
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
        var cls = "badge badge-" + (estado || "default").replace(/_/g, "-");
        return '<span class="' + cls + '">' + estadoPedidoTexto(estado) + "</span>";
    };

    window.configurarSidebar = function () {
        var sesion = requerirSesion();
        if (!sesion) return;

        var sidebar = document.querySelector(".sidebar");
        if (!sidebar) return;

        var rol = sesion.rol;
        var rolTxt = rol === "supervisora" ? "Supervisora" : "Maquiladora";
        var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (!page || page === "") page = "index.html";

        var items = [
            { href: "index.html", texto: "Inicio", icon: "⌂", roles: null },
            { href: "inventario.html", texto: "Inventario", icon: "▣", roles: ["supervisora"] },
            { href: "pedidos.html", texto: "Pedidos", icon: "☰", roles: ["supervisora"] },
            { href: "produccion.html", texto: "Producción", icon: "⚙", roles: null },
            { href: "calidad.html", texto: "Calidad", icon: "◎", roles: ["supervisora"] },
            { href: "reportes.html", texto: "Reportes", icon: "▦", roles: ["supervisora"] }
        ];

        var navHtml = items.filter(function (item) {
            return !item.roles || item.roles.indexOf(rol) !== -1;
        }).map(function (item) {
            var active = page === item.href ? " active" : "";
            return (
                '<li><a class="nav-link' + active + '" href="' + item.href + '">' +
                '<span class="nav-icon" aria-hidden="true">' + item.icon + "</span>" +
                '<span class="nav-text">' + item.texto + "</span></a></li>"
            );
        }).join("");

        sidebar.innerHTML =
            '<div class="sidebar-brand">' +
            '<img src="img/LOGO.jpeg" class="logo" alt="Logo MARTIN Company">' +
            "<div><strong>MARTIN</strong><small>Producción</small></div>" +
            "</div>" +
            '<nav class="sidebar-nav" aria-label="Navegación principal"><ul>' + navHtml + "</ul></nav>" +
            '<div class="sesion-info">' +
            '<div class="sesion-avatar" aria-hidden="true">' + (sesion.nombre || "?").charAt(0) + "</div>" +
            '<div class="sesion-meta"><strong>' + sesion.nombre + "</strong>" +
            "<small>" + rolTxt + "</small></div>" +
            '<button type="button" class="btn-logout" onclick="confirmarCerrarSesion()">Salir</button>' +
            "</div>";

        // Barra superior móvil
        if (!document.querySelector(".topbar")) {
            var top = document.createElement("header");
            top.className = "topbar";
            top.innerHTML =
                '<button type="button" class="btn-menu" onclick="toggleSidebarMovil()" aria-label="Abrir menú">☰</button>' +
                '<span class="topbar-title">MARTIN Company</span>' +
                '<span class="topbar-user">' + sesion.nombre.split(" ")[0] + "</span>";
            document.body.insertBefore(top, document.body.firstChild);
        }
        if (!document.querySelector(".nav-backdrop")) {
            var back = document.createElement("div");
            back.className = "nav-backdrop";
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
