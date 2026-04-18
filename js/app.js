// ==========================================
// PUNTO DE VENTA CESUN - App Principal v2.0
// ==========================================

let carrito = [];
let categoriaActual = 'todos';
let sesionActual = null;

// --- Inicializacion ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesion
    sesionActual = JSON.parse(localStorage.getItem('pos_sesion') || 'null');
    if (!sesionActual || !sesionActual.activa) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar usuario logueado
    document.getElementById('usuario-actual').textContent = `${sesionActual.rol === 'admin' ? 'Admin' : 'Cajero'}: ${sesionActual.nombre}`;

    // Restringir tabs segun rol
    if (sesionActual.rol === 'cajero') {
        const tabProductos = document.querySelector('[data-tab="productos"]');
        if (tabProductos) {
            tabProductos.style.display = 'none';
        }
    }

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        showConfirm(
            'Cerrar Sesion',
            'Deseas cerrar tu sesion actual?',
            'warning',
            'Cerrar Sesion',
            () => {
                localStorage.removeItem('pos_sesion');
                window.location.href = 'login.html';
            }
        );
    });

    initTabs();
    initReloj();
    renderProductosGrid();
    initBusqueda();
    initCategorias();
    initCarrito();
    initFormProducto();
    initHistorial();
    initModal();
    renderCarrito();
});

// ==========================================
// SISTEMA DE NOTIFICACIONES (Toast + Modal)
// ==========================================

function showToast(mensaje, tipo = 'info', duracion = 3000) {
    const container = document.getElementById('toast-container');
    const iconos = {
        success: '&#10003;',
        danger: '&#10007;',
        warning: '&#9888;',
        info: '&#8505;'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span class="toast-icon">${iconos[tipo]}</span><span>${mensaje}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duracion);
}

function showAlert(titulo, mensaje, tipo = 'warning') {
    const iconos = {
        success: '&#10003;',
        danger: '&#10007;',
        warning: '&#9888;',
        info: '&#8505;'
    };

    document.getElementById('modal-alert-icon').className = `modal-icon ${tipo}`;
    document.getElementById('modal-alert-icon').innerHTML = iconos[tipo];
    document.getElementById('modal-alert-title').textContent = titulo;
    document.getElementById('modal-alert-msg').textContent = mensaje;
    document.getElementById('modal-alert').classList.add('active');
}

function showConfirm(titulo, mensaje, tipo, textoConfirmar, callback) {
    const iconos = {
        success: '&#10003;',
        danger: '&#10007;',
        warning: '&#9888;',
        info: '&#8505;'
    };

    const modal = document.getElementById('modal-confirm');
    document.getElementById('modal-confirm-icon').className = `modal-icon ${tipo}`;
    document.getElementById('modal-confirm-icon').innerHTML = iconos[tipo];
    document.getElementById('modal-confirm-title').textContent = titulo;
    document.getElementById('modal-confirm-msg').textContent = mensaje;

    const btnSi = document.getElementById('modal-btn-si');
    btnSi.textContent = textoConfirmar || 'Confirmar';
    btnSi.className = `modal-btn modal-btn-confirm ${tipo}`;

    // Limpiar listeners anteriores clonando el boton
    const nuevoBtn = btnSi.cloneNode(true);
    btnSi.parentNode.replaceChild(nuevoBtn, btnSi);
    nuevoBtn.id = 'modal-btn-si';

    nuevoBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (callback) callback();
    });

    modal.classList.add('active');
}

// --- Cerrar modales ---
function initModal() {
    // Alert OK
    document.getElementById('modal-alert-ok').addEventListener('click', () => {
        document.getElementById('modal-alert').classList.remove('active');
    });

    // Confirm Cancel
    document.getElementById('modal-btn-no').addEventListener('click', () => {
        document.getElementById('modal-confirm').classList.remove('active');
    });

    // Ticket
    document.getElementById('btn-cerrar-ticket').addEventListener('click', () => {
        document.getElementById('modal-ticket').classList.remove('active');
    });

    document.getElementById('btn-imprimir').addEventListener('click', () => {
        const contenido = document.getElementById('ticket-impresion').innerHTML;
        const ventana = window.open('', '_blank', 'width=350,height=500');
        ventana.document.write(`
            <html><head><title>Ticket</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
                .ticket-header { text-align: center; border-bottom: 1px dashed #999; padding-bottom: 8px; margin-bottom: 8px; }
                .ticket-items { border-bottom: 1px dashed #999; padding-bottom: 8px; margin-bottom: 8px; }
                .ticket-total { text-align: right; font-weight: bold; }
                .ticket-footer { text-align: center; margin-top: 12px; color: #666; }
            </style>
            </head><body>${contenido}</body></html>
        `);
        ventana.document.close();
        ventana.print();
    });

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });
}

// ==========================================
// RELOJ
// ==========================================

function initReloj() {
    function actualizar() {
        const ahora = new Date();
        document.getElementById('fecha-hora').textContent = ahora.toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }
    actualizar();
    setInterval(actualizar, 15000);
}

// ==========================================
// TABS
// ==========================================

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');

            if (btn.dataset.tab === 'historial') renderHistorial();
            if (btn.dataset.tab === 'reportes') renderReportes();
            if (btn.dataset.tab === 'productos') renderTablaProductos();
        });
    });
}

// ==========================================
// GRID DE PRODUCTOS (Ventas)
// ==========================================

function renderProductosGrid(filtro = '') {
    const grid = document.getElementById('grid-productos');
    let productos = DB.getProductos();

    if (categoriaActual !== 'todos') {
        productos = productos.filter(p => p.categoria === categoriaActual);
    }

    if (filtro) {
        const f = filtro.toLowerCase();
        productos = productos.filter(p =>
            p.nombre.toLowerCase().includes(f) ||
            p.codigo.toLowerCase().includes(f)
        );
    }

    if (productos.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">No se encontraron productos</div>';
        return;
    }

    grid.innerHTML = productos.map(p => {
        const stockClass = p.stock <= 0 ? 'sin-stock' : '';
        const stockLabel = p.stock <= 0 ? 'Agotado' : p.stock < 5 ? `Stock: ${p.stock}` : `Stock: ${p.stock}`;
        const stockBadge = p.stock > 0 && p.stock < 5 ? 'stock-bajo' : '';
        return `
            <div class="producto-card ${stockClass}"
                 onclick="${p.stock > 0 ? `agregarAlCarrito(${p.id})` : ''}">
                <div class="prod-nombre">${p.nombre}</div>
                <div class="prod-precio">$${p.precio.toFixed(2)}</div>
                <div class="prod-stock ${stockBadge}">${stockLabel}</div>
            </div>
        `;
    }).join('');
}

// --- Busqueda ---
function initBusqueda() {
    const input = document.getElementById('buscar-producto');
    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => renderProductosGrid(e.target.value), 150);
    });
}

// --- Categorias ---
function initCategorias() {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaActual = btn.dataset.cat;
            renderProductosGrid(document.getElementById('buscar-producto').value);
        });
    });
}

// ==========================================
// CARRITO
// ==========================================

function initCarrito() {
    document.getElementById('metodo-pago').addEventListener('change', (e) => {
        const pagoEfectivo = document.getElementById('pago-efectivo');
        if (e.target.value === 'efectivo') {
            pagoEfectivo.classList.add('visible');
        } else {
            pagoEfectivo.classList.remove('visible');
        }
    });

    document.getElementById('monto-pago').addEventListener('input', calcularCambio);

    document.getElementById('btn-cobrar').addEventListener('click', () => {
        if (carrito.length === 0) return;

        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const total = subtotal * 1.16;
        const metodo = document.getElementById('metodo-pago').value;

        if (metodo === 'efectivo') {
            const pago = parseFloat(document.getElementById('monto-pago').value) || 0;
            if (pago < total) {
                showAlert('Pago insuficiente', `El monto ingresado ($${pago.toFixed(2)}) es menor al total ($${total.toFixed(2)}). Ingresa un monto igual o mayor.`, 'warning');
                return;
            }
        }

        const numItems = carrito.reduce((sum, i) => sum + i.cantidad, 0);
        showConfirm(
            'Confirmar Venta',
            `Se cobraran ${numItems} producto(s) por un total de $${total.toFixed(2)} con pago en ${metodo}.`,
            'success',
            'Cobrar',
            procesarVenta
        );
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => {
        if (carrito.length === 0) return;
        showConfirm(
            'Cancelar Venta',
            'Se eliminaran todos los productos del carrito. Esta accion no se puede deshacer.',
            'danger',
            'Si, cancelar',
            () => {
                carrito = [];
                renderCarrito();
                document.getElementById('monto-pago').value = '';
                showToast('Venta cancelada', 'info');
            }
        );
    });
}

function agregarAlCarrito(productoId) {
    const productos = DB.getProductos();
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock <= 0) return;

    const existente = carrito.find(item => item.id === productoId);
    if (existente) {
        if (existente.cantidad >= producto.stock) {
            showAlert('Stock insuficiente', `Solo hay ${producto.stock} unidades de "${producto.nombre}" disponibles.`, 'warning');
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }

    showToast(`${producto.nombre} agregado`, 'success', 1500);
    renderCarrito();
}

function renderCarrito() {
    const lista = document.getElementById('lista-carrito');

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icon">&#128722;</div>
                <p>El carrito esta vacio</p>
                <p style="font-size:0.8rem;margin-top:4px;">Selecciona productos para comenzar</p>
            </div>`;
        document.getElementById('btn-cobrar').disabled = true;
        actualizarTotales();
        return;
    }

    lista.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <span class="item-nombre">${item.nombre}</span>
            <span class="item-precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
            <span class="item-cantidad">
                <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <span>${item.cantidad}</span>
                <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </span>
            <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.id})" title="Eliminar">&times;</button>
        </div>
    `).join('');

    document.getElementById('btn-cobrar').disabled = false;
    actualizarTotales();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    const productos = DB.getProductos();
    const producto = productos.find(p => p.id === id);

    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    } else if (nuevaCantidad > producto.stock) {
        showAlert('Stock insuficiente', `Solo hay ${producto.stock} unidades de "${producto.nombre}" disponibles.`, 'warning');
        return;
    } else {
        item.cantidad = nuevaCantidad;
    }

    renderCarrito();
}

function eliminarDelCarrito(id) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    showConfirm(
        'Eliminar producto',
        `Quitar "${item.nombre}" del carrito?`,
        'danger',
        'Eliminar',
        () => {
            carrito = carrito.filter(i => i.id !== id);
            renderCarrito();
            showToast('Producto eliminado del carrito', 'info', 1500);
        }
    );
}

function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    calcularCambio();
}

function calcularCambio() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) * 1.16;
    const pago = parseFloat(document.getElementById('monto-pago').value) || 0;
    const cambio = pago - total;
    const cambioEl = document.getElementById('cambio');
    cambioEl.textContent = cambio >= 0 ? `$${cambio.toFixed(2)}` : '$0.00';
    cambioEl.style.color = cambio >= 0 && pago > 0 ? '#16a34a' : '#64748b';
}

function procesarVenta() {
    if (carrito.length === 0) return;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal * 1.16;
    const metodo = document.getElementById('metodo-pago').value;
    const pagoMonto = metodo === 'efectivo' ? parseFloat(document.getElementById('monto-pago').value) : total;

    // Actualizar stock
    const productos = DB.getProductos();
    carrito.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
    });
    DB.saveProductos(productos);

    // Guardar venta
    const ventas = DB.getVentas();
    const venta = {
        id: DB.getNextId(ventas),
        folio: DB.getNextFolio(),
        fecha: new Date().toISOString(),
        items: carrito.map(i => ({ ...i })),
        subtotal: subtotal,
        iva: subtotal * 0.16,
        total: total,
        metodo: metodo,
        pago: pagoMonto,
        cambio: metodo === 'efectivo' ? (pagoMonto - total) : 0
    };
    ventas.push(venta);
    DB.saveVentas(ventas);

    // Mostrar ticket
    mostrarTicket(venta);

    // Limpiar
    carrito = [];
    renderCarrito();
    renderProductosGrid(document.getElementById('buscar-producto').value);
    document.getElementById('monto-pago').value = '';

    showToast(`Venta ${venta.folio} procesada correctamente`, 'success');
}

// ==========================================
// TICKET
// ==========================================

function mostrarTicket(venta) {
    const fecha = new Date(venta.fecha);
    let html = `
        <div class="ticket-header">
            <strong>PUNTO DE VENTA CESUN</strong><br>
            <small>Desarrollo Empresarial</small><br><br>
            <strong>Folio: ${venta.folio}</strong><br>
            ${fecha.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
        </div>
        <div class="ticket-items">
    `;

    venta.items.forEach(item => {
        const itemTotal = (item.precio * item.cantidad).toFixed(2);
        html += `${item.cantidad}x ${item.nombre}<br>`;
        html += `&nbsp;&nbsp;&nbsp;$${item.precio.toFixed(2)} c/u &nbsp; = $${itemTotal}<br>`;
    });

    html += `
        </div>
        <div class="ticket-total">
            Subtotal: $${venta.subtotal.toFixed(2)}<br>
            IVA 16%:&nbsp; $${venta.iva.toFixed(2)}<br>
            <strong>TOTAL: &nbsp; $${venta.total.toFixed(2)}</strong><br><br>
            Pago: ${venta.metodo}<br>
            ${venta.metodo === 'efectivo' ? `Recibido: $${venta.pago.toFixed(2)}<br>Cambio: &nbsp; $${venta.cambio.toFixed(2)}` : ''}
        </div>
        <div class="ticket-footer">
            &#9733; Gracias por su compra &#9733;
        </div>
    `;

    document.getElementById('ticket-impresion').innerHTML = html;
    document.getElementById('modal-ticket').classList.add('active');
}

// ==========================================
// ADMIN PRODUCTOS
// ==========================================

function initFormProducto() {
    document.getElementById('form-producto').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarProducto();
    });

    document.getElementById('btn-limpiar').addEventListener('click', limpiarFormProducto);
    renderTablaProductos();
}

function guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const producto = {
        codigo: document.getElementById('prod-codigo').value.trim(),
        nombre: document.getElementById('prod-nombre').value.trim(),
        precio: parseFloat(document.getElementById('prod-precio').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        categoria: document.getElementById('prod-categoria').value
    };

    if (!producto.codigo || !producto.nombre) {
        showAlert('Campos incompletos', 'El codigo y nombre del producto son obligatorios.', 'warning');
        return;
    }

    if (isNaN(producto.precio) || producto.precio <= 0) {
        showAlert('Precio invalido', 'Ingresa un precio mayor a cero.', 'warning');
        return;
    }

    if (isNaN(producto.stock) || producto.stock < 0) {
        showAlert('Stock invalido', 'Ingresa un valor de stock valido (0 o mayor).', 'warning');
        return;
    }

    const productos = DB.getProductos();

    // Verificar codigo duplicado
    const duplicado = productos.find(p => p.codigo === producto.codigo && p.id !== parseInt(id));
    if (duplicado) {
        showAlert('Codigo duplicado', `Ya existe un producto con el codigo "${producto.codigo}".`, 'danger');
        return;
    }

    if (id) {
        const idx = productos.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
            producto.id = parseInt(id);
            productos[idx] = producto;
            showToast(`"${producto.nombre}" actualizado`, 'success');
        }
    } else {
        producto.id = DB.getNextId(productos);
        productos.push(producto);
        showToast(`"${producto.nombre}" agregado al inventario`, 'success');
    }

    DB.saveProductos(productos);
    limpiarFormProducto();
    renderTablaProductos();
    renderProductosGrid();
}

function limpiarFormProducto() {
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-codigo').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-precio').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('prod-categoria').value = 'bebidas';
}

function editarProducto(id) {
    const productos = DB.getProductos();
    const p = productos.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-codigo').value = p.codigo;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-categoria').value = p.categoria;

    // Scroll al formulario
    document.getElementById('form-producto').scrollIntoView({ behavior: 'smooth' });
    showToast(`Editando "${p.nombre}"`, 'info', 2000);
}

function eliminarProducto(id) {
    const productos = DB.getProductos();
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    showConfirm(
        'Eliminar producto',
        `Se eliminara "${prod.nombre}" del inventario. Esta accion no se puede deshacer.`,
        'danger',
        'Eliminar',
        () => {
            const actualizados = productos.filter(p => p.id !== id);
            DB.saveProductos(actualizados);
            renderTablaProductos();
            renderProductosGrid();
            showToast(`"${prod.nombre}" eliminado`, 'danger');
        }
    );
}

function renderTablaProductos() {
    const tbody = document.getElementById('tbody-productos');
    const productos = DB.getProductos();

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">No hay productos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => {
        let stockBadge;
        if (p.stock <= 0) {
            stockBadge = `<span class="stock-badge agotado">Agotado</span>`;
        } else if (p.stock < 5) {
            stockBadge = `<span class="stock-badge bajo">${p.stock} uds</span>`;
        } else {
            stockBadge = `<span class="stock-badge ok">${p.stock} uds</span>`;
        }

        return `
            <tr>
                <td><strong>${p.codigo}</strong></td>
                <td>${p.nombre}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${stockBadge}</td>
                <td style="text-transform:capitalize;">${p.categoria}</td>
                <td>
                    <button class="btn-editar" onclick="editarProducto(${p.id})">Editar</button>
                    <button class="btn-eliminar-prod" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// HISTORIAL
// ==========================================

function initHistorial() {
    document.getElementById('btn-filtrar').addEventListener('click', () => {
        const fecha = document.getElementById('filtro-fecha').value;
        if (!fecha) {
            showAlert('Selecciona una fecha', 'Elige una fecha en el campo para filtrar las ventas.', 'info');
            return;
        }
        renderHistorial(fecha);
    });

    document.getElementById('btn-ver-todas').addEventListener('click', () => {
        document.getElementById('filtro-fecha').value = '';
        renderHistorial();
    });
}

function renderHistorial(filtroFecha = '') {
    const tbody = document.getElementById('tbody-historial');
    let ventas = DB.getVentas();

    if (filtroFecha) {
        ventas = ventas.filter(v => v.fecha.startsWith(filtroFecha));
    }

    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">
            ${filtroFecha ? 'No hay ventas en la fecha seleccionada' : 'No hay ventas registradas'}
        </td></tr>`;
        return;
    }

    tbody.innerHTML = ventas.map(v => {
        const fecha = new Date(v.fecha);
        const prods = v.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
        const truncProds = prods.length > 50 ? prods.substring(0, 47) + '...' : prods;
        const ventaData = encodeURIComponent(JSON.stringify(v));
        return `
            <tr>
                <td><strong>${v.folio}</strong></td>
                <td>${fecha.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td title="${prods}">${truncProds}</td>
                <td><strong>$${v.total.toFixed(2)}</strong></td>
                <td style="text-transform:capitalize;">${v.metodo}</td>
                <td><button class="btn-ver" onclick="verTicketDesdeData('${ventaData}')">Ver Ticket</button></td>
            </tr>
        `;
    }).join('');
}

function verTicketDesdeData(encodedData) {
    const venta = JSON.parse(decodeURIComponent(encodedData));
    mostrarTicket(venta);
}

// ==========================================
// REPORTES
// ==========================================

function renderReportes() {
    const ventas = DB.getVentas();
    const productos = DB.getProductos();
    const hoy = new Date().toISOString().split('T')[0];

    // Ventas del dia
    const ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy));
    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    document.getElementById('ventas-dia').textContent = `$${totalHoy.toFixed(2)}`;
    document.getElementById('num-ventas-dia').textContent = `${ventasHoy.length} venta${ventasHoy.length !== 1 ? 's' : ''}`;

    // Producto mas vendido
    const conteo = {};
    ventas.forEach(v => {
        v.items.forEach(item => {
            conteo[item.nombre] = (conteo[item.nombre] || 0) + item.cantidad;
        });
    });

    const masVendido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    if (masVendido) {
        document.getElementById('prod-mas-vendido').textContent = masVendido[0];
        document.getElementById('cant-mas-vendido').textContent = `${masVendido[1]} unidades`;
    } else {
        document.getElementById('prod-mas-vendido').textContent = '-';
        document.getElementById('cant-mas-vendido').textContent = '0 unidades';
    }

    // Total productos
    document.getElementById('total-productos').textContent = productos.length;

    // Stock bajo
    const stockBajo = productos.filter(p => p.stock < 5).length;
    document.getElementById('stock-bajo').textContent = stockBajo;

    // Grafico por metodo de pago
    const metodos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    ventas.forEach(v => {
        metodos[v.metodo] = (metodos[v.metodo] || 0) + v.total;
    });

    const maxMetodo = Math.max(...Object.values(metodos), 1);
    const chart = document.getElementById('chart-metodos');
    chart.innerHTML = Object.entries(metodos).map(([metodo, total]) => {
        const height = Math.max((total / maxMetodo) * 160, 4);
        return `
            <div class="chart-barra">
                <div class="barra-valor">$${total.toFixed(0)}</div>
                <div class="barra" style="height:${height}px"></div>
                <div class="barra-label">${metodo}</div>
            </div>
        `;
    }).join('');
}
