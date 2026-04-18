// Base de datos local usando localStorage
const DB = {
    getProductos() {
        const data = localStorage.getItem('pos_productos');
        if (!data) {
            // Productos iniciales de ejemplo
            const productosIniciales = [
                { id: 1, codigo: 'BEB001', nombre: 'Coca-Cola 600ml', precio: 18.00, stock: 50, categoria: 'bebidas' },
                { id: 2, codigo: 'BEB002', nombre: 'Agua Natural 1L', precio: 12.00, stock: 80, categoria: 'bebidas' },
                { id: 3, codigo: 'BEB003', nombre: 'Jugo de Naranja', precio: 25.00, stock: 30, categoria: 'bebidas' },
                { id: 4, codigo: 'BEB004', nombre: 'Cafe Americano', precio: 35.00, stock: 100, categoria: 'bebidas' },
                { id: 5, codigo: 'ALI001', nombre: 'Sandwich Jamon', precio: 45.00, stock: 20, categoria: 'alimentos' },
                { id: 6, codigo: 'ALI002', nombre: 'Torta de Milanesa', precio: 55.00, stock: 15, categoria: 'alimentos' },
                { id: 7, codigo: 'ALI003', nombre: 'Ensalada Caesar', precio: 65.00, stock: 10, categoria: 'alimentos' },
                { id: 8, codigo: 'ALI004', nombre: 'Hot Dog', precio: 30.00, stock: 25, categoria: 'alimentos' },
                { id: 9, codigo: 'SNK001', nombre: 'Papas Sabritas', precio: 22.00, stock: 40, categoria: 'snacks' },
                { id: 10, codigo: 'SNK002', nombre: 'Galletas Marias', precio: 15.00, stock: 35, categoria: 'snacks' },
                { id: 11, codigo: 'SNK003', nombre: 'Barra de Chocolate', precio: 28.00, stock: 45, categoria: 'snacks' },
                { id: 12, codigo: 'SNK004', nombre: 'Cacahuates', precio: 18.00, stock: 30, categoria: 'snacks' },
                { id: 13, codigo: 'LIM001', nombre: 'Jabon de Manos', precio: 32.00, stock: 20, categoria: 'limpieza' },
                { id: 14, codigo: 'LIM002', nombre: 'Desinfectante', precio: 45.00, stock: 15, categoria: 'limpieza' },
                { id: 15, codigo: 'OTR001', nombre: 'Pilas AA (par)', precio: 38.00, stock: 25, categoria: 'otros' },
                { id: 16, codigo: 'OTR002', nombre: 'Cuaderno 100h', precio: 42.00, stock: 20, categoria: 'otros' },
            ];
            localStorage.setItem('pos_productos', JSON.stringify(productosIniciales));
            return productosIniciales;
        }
        return JSON.parse(data);
    },

    saveProductos(productos) {
        localStorage.setItem('pos_productos', JSON.stringify(productos));
    },

    getVentas() {
        const data = localStorage.getItem('pos_ventas');
        return data ? JSON.parse(data) : [];
    },

    saveVentas(ventas) {
        localStorage.setItem('pos_ventas', JSON.stringify(ventas));
    },

    getNextId(lista) {
        if (lista.length === 0) return 1;
        return Math.max(...lista.map(i => i.id)) + 1;
    },

    getNextFolio() {
        const ventas = this.getVentas();
        if (ventas.length === 0) return 'V-0001';
        const lastNum = Math.max(...ventas.map(v => parseInt(v.folio.split('-')[1])));
        return `V-${String(lastNum + 1).padStart(4, '0')}`;
    }
};
