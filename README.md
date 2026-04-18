# Punto de Venta - CESUN

Sistema de Punto de Venta (POS) desarrollado como proyecto para CESUN Universidad.

## Descripcion

Aplicacion web de punto de venta que permite gestionar ventas, productos, historial y reportes. Utiliza tecnologias web puras (HTML, CSS y JavaScript) con almacenamiento local mediante `localStorage`.

## Caracteristicas

- **Modulo de Ventas**: Busqueda de productos, carrito de compras, calculo automatico de IVA, multiples metodos de pago (efectivo, tarjeta, transferencia), generacion de tickets.
- **Administracion de Productos**: Alta, baja y modificacion de productos con codigo, nombre, precio, stock y categoria.
- **Historial de Ventas**: Consulta de ventas realizadas con filtro por fecha y visualizacion de tickets.
- **Reportes**: Ventas del dia, producto mas vendido, productos con stock bajo, grafico de ventas por metodo de pago.

## Instrucciones de Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- No requiere servidor ni instalacion adicional

### Ejecucion
1. Clona este repositorio:
   ```bash
   git clone https://github.com/DiegoRiv10/punto-de-venta-Cesun.git
   ```
2. Abre el archivo `index.html` en tu navegador web.
3. El sistema cargara productos de ejemplo automaticamente en la primera ejecucion.

### Uso del Sistema

1. **Realizar una venta**:
   - En la pestana "Ventas", busca o selecciona productos haciendo clic sobre ellos.
   - Ajusta cantidades con los botones + y -.
   - Selecciona el metodo de pago.
   - Si es efectivo, ingresa el monto recibido para calcular el cambio.
   - Presiona "Cobrar" para procesar la venta.

2. **Administrar productos**:
   - Ve a la pestana "Productos".
   - Llena el formulario y presiona "Guardar" para agregar un producto.
   - Usa los botones "Editar" o "Eliminar" en la tabla para modificar productos existentes.

3. **Consultar historial**:
   - Ve a la pestana "Historial" para ver todas las ventas realizadas.
   - Filtra por fecha si es necesario.

4. **Ver reportes**:
   - La pestana "Reportes" muestra estadisticas generales del negocio.

## Estructura del Proyecto

```
punto-de-venta-Cesun/
├── index.html              # Pagina principal
├── css/
│   └── styles.css          # Estilos de la aplicacion
├── js/
│   ├── datos.js            # Capa de datos (localStorage)
│   └── app.js              # Logica de la aplicacion
├── docs/
│   └── analisis-tecnico.md # Documento de analisis tecnico
└── README.md               # Este archivo
```

## Tecnologias Utilizadas

- HTML5
- CSS3 (Grid, Flexbox, Variables CSS)
- JavaScript ES6+ (Vanilla)
- localStorage para persistencia de datos

## Autor

Diego Rivera - CESUN Universidad
