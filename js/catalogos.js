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
            registrado: "📝 Registrado",
            stock_insuficiente: "🔴 Stock insuficiente",
            solicitud_compra: "🛒 Solicitud compra",
            materia_recibida: "📦 Materia lista",
            en_produccion: "🧵 En producción",
            control_calidad: "🔍 Control calidad",
            aprobado_calidad: "✅ Aprobado calidad",
            empaquetado: "📦 Empaquetado",
            entregado: "🚚 Entregado",
            completado: "🟢 Completado",
            cancelado: "❌ Cancelado"
        };
        return mapa[estado] || estado;
    };

    window.configurarSidebar = function () {
        var sesion = requerirSesion();
        if (!sesion) return;
        var nav = document.querySelector(".sidebar ul");
        if (!nav) return;

        var rol = sesion.rol;
        var items = [
            { href: "index.html", texto: "Inicio" },
            { href: "inventario.html", texto: "Inventario", roles: ["supervisora"] },
            { href: "pedidos.html", texto: "Pedidos", roles: ["supervisora"] },
            { href: "produccion.html", texto: "Producción" },
            { href: "calidad.html", texto: "Calidad", roles: ["supervisora"] },
            { href: "reportes.html", texto: "Reportes", roles: ["supervisora"] }
        ];

        nav.innerHTML = "";
        items.forEach(function (item) {
            if (item.roles && item.roles.indexOf(rol) === -1) return;
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = item.href;
            a.textContent = item.texto;
            if (window.location.pathname.indexOf(item.href) !== -1) a.style.color = "#4fc3f7";
            li.appendChild(a);
            nav.appendChild(li);
        });

        var info = document.createElement("div");
        info.className = "sesion-info";
        info.innerHTML = "<small>" + sesion.nombre + "<br>(" + rol + ")</small><br><a href='#' onclick='cerrarSesion();return false;'>Cerrar sesión</a>";
        document.querySelector(".sidebar").appendChild(info);
    };

})();
