// ==========================================
// PUNTO DE VENTA CESUN - Aplicacion Principal
// ==========================================

let carrito = [];
let categoriaActual = 'todos';

// --- Inicializacion ---
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initReloj();
    renderProductosGrid();
    initBusqueda();
    initCategorias();
    initCarrito();
    initFormProducto();
    initHistorial();
    initReportes();
    initModal();
});

// --- Reloj ---
function initReloj() {
    function actualizar() {
        const ahora = new Date();
        document.getElementById('fecha-hora').textContent = ahora.toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }
    actualizar();
    setInterval(actualizar, 30000);
}

// --- Tabs ---
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

// --- Grid de Productos (Ventas) ---
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

    grid.innerHTML = productos.map(p => `
        <div class="producto-card ${p.stock <= 0 ? 'sin-stock' : ''}"
             data-id="${p.id}"
             onclick="${p.stock > 0 ? `agregarAlCarrito(${p.id})` : ''}">
            <div class="prod-nombre">${p.nombre}</div>
            <div class="prod-precio">$${p.precio.toFixed(2)}</div>
            <div class="prod-stock">${p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}</div>
        </div>
    `).join('');
}

// --- Busqueda ---
function initBusqueda() {
    document.getElementById('buscar-producto').addEventListener('input', (e) => {
        renderProductosGrid(e.target.value);
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

// --- Carrito ---
function initCarrito() {
    document.getElementById('metodo-pago').addEventListener('change', (e) => {
        document.getElementById('pago-efectivo').style.display =
            e.target.value === 'efectivo' ? 'block' : 'none';
    });

    document.getElementById('monto-pago').addEventListener('input', calcularCambio);
    document.getElementById('btn-cobrar').addEventListener('click', procesarVenta);
    document.getElementById('btn-cancelar').addEventListener('click', cancelarVenta);
}

function agregarAlCarrito(productoId) {
    const productos = DB.getProductos();
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock <= 0) return;

    const existente = carrito.find(item => item.id === productoId);
    if (existente) {
        if (existente.cantidad >= producto.stock) {
            alert('No hay suficiente stock disponible');
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

    renderCarrito();
}

function renderCarrito() {
    const lista = document.getElementById('lista-carrito');

    if (carrito.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px 0;">Carrito vacio</p>';
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
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">x</button>
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

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    } else if (item.cantidad > producto.stock) {
        item.cantidad = producto.stock;
        alert('Stock insuficiente');
    }

    renderCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    renderCarrito();
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
    document.getElementById('cambio').textContent = cambio >= 0 ? `$${cambio.toFixed(2)}` : '$0.00';
}

function procesarVenta() {
    if (carrito.length === 0) return;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal * 1.16;
    const metodo = document.getElementById('metodo-pago').value;

    if (metodo === 'efectivo') {
        const pago = parseFloat(document.getElementById('monto-pago').value) || 0;
        if (pago < total) {
            alert('El monto de pago es insuficiente');
            return;
        }
    }

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
        items: [...carrito],
        subtotal: subtotal,
        iva: subtotal * 0.16,
        total: total,
        metodo: metodo,
        pago: metodo === 'efectivo' ? parseFloat(document.getElementById('monto-pago').value) : total,
        cambio: metodo === 'efectivo' ? (parseFloat(document.getElementById('monto-pago').value) - total) : 0
    };
    ventas.push(venta);
    DB.saveVentas(ventas);

    // Mostrar ticket
    mostrarTicket(venta);

    // Limpiar carrito
    carrito = [];
    renderCarrito();
    renderProductosGrid(document.getElementById('buscar-producto').value);
    document.getElementById('monto-pago').value = '';
}

function cancelarVenta() {
    if (carrito.length === 0) return;
    if (confirm('Cancelar la venta actual?')) {
        carrito = [];
        renderCarrito();
        document.getElementById('monto-pago').value = '';
    }
}

// --- Ticket ---
function mostrarTicket(venta) {
    const fecha = new Date(venta.fecha);
    let html = `
        <div class="ticket-header">
            <strong>PUNTO DE VENTA CESUN</strong><br>
            Ticket de Venta<br>
            Folio: ${venta.folio}<br>
            ${fecha.toLocaleString('es-MX')}
        </div>
        <div class="ticket-items">
    `;

    venta.items.forEach(item => {
        html += `${item.cantidad}x ${item.nombre}<br>`;
        html += `   $${item.precio.toFixed(2)} c/u = $${(item.precio * item.cantidad).toFixed(2)}<br>`;
    });

    html += `
        </div>
        <div class="ticket-total">
            Subtotal: $${venta.subtotal.toFixed(2)}<br>
            IVA 16%: $${venta.iva.toFixed(2)}<br>
            <strong>TOTAL: $${venta.total.toFixed(2)}</strong><br>
            Metodo: ${venta.metodo}<br>
            ${venta.metodo === 'efectivo' ? `Pago: $${venta.pago.toFixed(2)}<br>Cambio: $${venta.cambio.toFixed(2)}` : ''}
        </div>
        <div style="text-align:center;margin-top:12px;">
            Gracias por su compra
        </div>
    `;

    document.getElementById('ticket-impresion').innerHTML = html;
    document.getElementById('modal-ticket').classList.add('active');
}

function initModal() {
    document.getElementById('btn-cerrar-ticket').addEventListener('click', () => {
        document.getElementById('modal-ticket').classList.remove('active');
    });

    document.getElementById('btn-imprimir').addEventListener('click', () => {
        const contenido = document.getElementById('ticket-impresion').innerHTML;
        const ventana = window.open('', '_blank', 'width=350,height=500');
        ventana.document.write(`
            <html><head><title>Ticket</title>
            <style>body{font-family:'Courier New',monospace;font-size:12px;padding:10px;}</style>
            </head><body>${contenido}</body></html>
        `);
        ventana.document.close();
        ventana.print();
    });
}

// --- Admin Productos ---
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

    if (!producto.codigo || !producto.nombre || isNaN(producto.precio) || isNaN(producto.stock)) {
        alert('Completa todos los campos correctamente');
        return;
    }

    const productos = DB.getProductos();

    if (id) {
        // Editar
        const idx = productos.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
            producto.id = parseInt(id);
            productos[idx] = producto;
        }
    } else {
        // Nuevo
        producto.id = DB.getNextId(productos);
        productos.push(producto);
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
}

function eliminarProducto(id) {
    if (!confirm('Eliminar este producto?')) return;
    let productos = DB.getProductos();
    productos = productos.filter(p => p.id !== id);
    DB.saveProductos(productos);
    renderTablaProductos();
    renderProductosGrid();
}

function renderTablaProductos() {
    const tbody = document.getElementById('tbody-productos');
    const productos = DB.getProductos();

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${p.categoria}</td>
            <td>
                <button class="btn-editar" onclick="editarProducto(${p.id})">Editar</button>
                <button class="btn-eliminar-prod" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// --- Historial ---
function initHistorial() {
    document.getElementById('btn-filtrar').addEventListener('click', () => {
        const fecha = document.getElementById('filtro-fecha').value;
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No hay ventas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ventas.map(v => {
        const fecha = new Date(v.fecha);
        const prods = v.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
        return `
            <tr>
                <td>${v.folio}</td>
                <td>${fecha.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>${prods}</td>
                <td>$${v.total.toFixed(2)}</td>
                <td>${v.metodo}</td>
                <td><button class="btn-editar" onclick='verTicket(${JSON.stringify(v).replace(/'/g, "\\'")})'>Ver Ticket</button></td>
            </tr>
        `;
    }).join('');
}

function verTicket(venta) {
    mostrarTicket(venta);
}

// --- Reportes ---
function initReportes() {}

function renderReportes() {
    const ventas = DB.getVentas();
    const productos = DB.getProductos();
    const hoy = new Date().toISOString().split('T')[0];

    // Ventas del dia
    const ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy));
    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    document.getElementById('ventas-dia').textContent = `$${totalHoy.toFixed(2)}`;
    document.getElementById('num-ventas-dia').textContent = `${ventasHoy.length} ventas`;

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
        const height = (total / maxMetodo) * 150;
        return `
            <div class="chart-barra">
                <div class="barra-valor">$${total.toFixed(0)}</div>
                <div class="barra" style="height:${height}px"></div>
                <div class="barra-label">${metodo}</div>
            </div>
        `;
    }).join('');
}

// Inicializar carrito vacio al cargar
renderCarrito();
