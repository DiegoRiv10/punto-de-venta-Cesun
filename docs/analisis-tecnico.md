# Documento de Analisis Tecnico
## Sistema Punto de Venta - CESUN

**Autor:** Diego Rivera  
**Fecha:** 17 de abril de 2026  
**Materia:** Desarrollo Empresarial  
**Repositorio:** [https://github.com/DiegoRiv10/punto-de-venta-Cesun](https://github.com/DiegoRiv10/punto-de-venta-Cesun)

---

## 1. Descripcion del Proyecto

Sistema de Punto de Venta (POS) web que permite a un negocio gestionar sus ventas diarias, controlar inventario de productos, consultar historial de transacciones y generar reportes basicos. El sistema esta disenado para ser ligero, sin dependencias externas y ejecutable directamente desde un navegador web.

---

## 2. Requerimientos

### 2.1 Requerimientos Funcionales

| ID    | Requerimiento                                | Descripcion |
|-------|----------------------------------------------|-------------|
| RF-01 | Registro de ventas                           | El sistema permite seleccionar productos, agregarlos a un carrito y procesar la venta generando un ticket. |
| RF-02 | Busqueda de productos                        | El usuario puede buscar productos por nombre o codigo desde la interfaz de ventas. |
| RF-03 | Filtrado por categorias                      | Los productos se pueden filtrar por categoria (Bebidas, Alimentos, Snacks, Limpieza, Otros). |
| RF-04 | Calculo automatico de totales                | El sistema calcula subtotal, IVA (16%) y total de forma automatica. |
| RF-05 | Metodos de pago                              | Soporte para efectivo, tarjeta y transferencia. En efectivo calcula el cambio. |
| RF-06 | Generacion de tickets                        | Al completar una venta se genera un ticket con folio, detalle de productos, totales y metodo de pago. |
| RF-07 | Impresion de tickets                         | El ticket puede imprimirse desde el navegador. |
| RF-08 | Administracion de productos (CRUD)           | Alta, baja, modificacion y consulta de productos con codigo, nombre, precio, stock y categoria. |
| RF-09 | Control de inventario                        | El stock se actualiza automaticamente al procesar una venta. Productos sin stock se marcan como agotados. |
| RF-10 | Historial de ventas                          | Registro completo de ventas realizadas con filtro por fecha. |
| RF-11 | Reportes                                     | Ventas del dia, producto mas vendido, conteo de productos y alerta de stock bajo. |
| RF-12 | Grafico de ventas por metodo de pago         | Visualizacion grafica de las ventas agrupadas por metodo de pago. |
| RF-13 | Persistencia de datos                        | Los datos se almacenan en localStorage del navegador para persistir entre sesiones. |
| RF-14 | Validacion de stock                          | El sistema impide agregar al carrito mas unidades de las disponibles en stock. |
| RF-15 | Validacion de pago                           | En efectivo, el sistema verifica que el monto pagado sea suficiente antes de procesar. |

### 2.2 Requerimientos No Funcionales

| ID     | Requerimiento                    | Descripcion |
|--------|----------------------------------|-------------|
| RNF-01 | Usabilidad                       | Interfaz intuitiva con navegacion por pestanas, colores claros y diseno responsivo. |
| RNF-02 | Rendimiento                      | La aplicacion carga instantaneamente al ser 100% cliente sin dependencias de servidor. |
| RNF-03 | Portabilidad                     | Funciona en cualquier navegador moderno (Chrome, Firefox, Edge, Safari) sin instalacion. |
| RNF-04 | Mantenibilidad                   | Codigo organizado en modulos separados (datos, logica, estilos) para facilitar mantenimiento. |
| RNF-05 | Disponibilidad                   | Al ser una aplicacion local, esta disponible sin necesidad de conexion a internet. |
| RNF-06 | Compatibilidad                   | Diseno responsivo que se adapta a pantallas de escritorio y tabletas. |
| RNF-07 | Escalabilidad                    | La arquitectura permite migrar facilmente a una base de datos real (ej. Firebase, MySQL) en el futuro. |
| RNF-08 | Sin dependencias                 | No requiere frameworks, librerias externas ni servidor backend. |

---

## 3. Diagramas

### 3.1 Diagrama de Flujo - Proceso de Venta

```
    [INICIO]
        |
        v
  [Buscar/Seleccionar Producto]
        |
        v
  {Hay stock?} --NO--> [Mostrar "Agotado"] --> [Buscar otro]
        |
       SI
        |
        v
  [Agregar al Carrito]
        |
        v
  {Agregar mas?} --SI--> [Buscar/Seleccionar Producto]
        |
       NO
        |
        v
  [Seleccionar Metodo de Pago]
        |
        v
  {Es efectivo?} --NO--> [Procesar Venta]
        |                        |
       SI                        |
        |                        |
        v                        |
  [Ingresar Monto]              |
        |                        |
        v                        |
  {Monto >= Total?} --NO--> [Error: Monto Insuficiente]
        |                        
       SI                       
        |                       
        v                       
  [Procesar Venta]
        |
        v
  [Actualizar Stock]
        |
        v
  [Guardar en Historial]
        |
        v
  [Generar Ticket]
        |
        v
     [FIN]
```

### 3.2 Diagrama Entidad-Relacion

```
+------------------+          +------------------+
|    PRODUCTO      |          |      VENTA       |
+------------------+          +------------------+
| PK id            |          | PK id            |
|    codigo        |          |    folio          |
|    nombre        |          |    fecha          |
|    precio        |          |    subtotal       |
|    stock         |          |    iva            |
|    categoria     |          |    total          |
+------------------+          |    metodo_pago    |
        |                     |    pago           |
        |  1:N                |    cambio         |
        |                     +------------------+
        v                            |
+------------------+                 |
|  DETALLE_VENTA   |    N:1          |
+------------------+<----------------+
| FK producto_id   |
| FK venta_id      |
|    cantidad      |
|    precio_unit   |
|    subtotal      |
+------------------+
```

**Relaciones:**
- Un **Producto** puede aparecer en muchos **Detalles de Venta** (1:N).
- Una **Venta** tiene muchos **Detalles de Venta** (1:N).
- **Detalle de Venta** es la tabla intermedia que relaciona Productos con Ventas.

### 3.3 Diagrama de Arquitectura

```
+-------------------------------------------+
|            NAVEGADOR WEB                   |
|                                            |
|  +----------+  +----------+  +----------+ |
|  |  HTML    |  |   CSS    |  |    JS    | |
|  | (Vista)  |  | (Estilos)|  | (Logica) | |
|  +----------+  +----------+  +----------+ |
|                                    |       |
|                              +-----v-----+ |
|                              |  datos.js  | |
|                              | (Capa de   | |
|                              |  Datos)    | |
|                              +-----+-----+ |
|                                    |       |
|                              +-----v-----+ |
|                              |localStorage||
|                              | (Persistencia)
|                              +-----------+ |
+-------------------------------------------+
```

---

## 4. Arquitectura del Sistema

El sistema sigue un patron de arquitectura **MVC simplificado**:

- **Modelo (datos.js):** Maneja la persistencia de datos usando localStorage. Provee funciones para obtener y guardar productos y ventas.
- **Vista (index.html + styles.css):** Define la estructura y presentacion visual de la interfaz.
- **Controlador (app.js):** Contiene toda la logica de negocio, manejo de eventos y actualizacion dinamica de la interfaz.

---

## 5. Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| HTML5      | Estructura semantica de la interfaz |
| CSS3       | Estilos, Grid Layout, Flexbox, Variables CSS, Responsive Design |
| JavaScript ES6+ | Logica de negocio, manipulacion del DOM, eventos |
| localStorage | Persistencia de datos en el navegador |

---

## 6. Conclusiones

### 6.1 Desafios Encontrados Durante el Analisis

1. **Persistencia de datos sin backend:** Uno de los principales desafios fue disenar un sistema funcional sin servidor backend. Se opto por localStorage, lo cual limita la cantidad de datos almacenables (~5MB) pero cumple con los requisitos del proyecto.

2. **Integridad de datos:** Al no contar con una base de datos relacional, la consistencia entre productos, ventas y stock debe manejarse cuidadosamente en la logica de JavaScript para evitar inconsistencias.

3. **Generacion de tickets:** La impresion de tickets desde el navegador tiene limitaciones en cuanto a formato y compatibilidad con impresoras termicas. Se implemento una solucion basica con ventana emergente.

4. **Diseno responsivo:** Adaptar una interfaz de punto de venta (que tipicamente ocupa toda la pantalla) a dispositivos moviles requirio decisiones de diseno sobre como reorganizar los paneles.

5. **Manejo de concurrencia:** Al ser una aplicacion de un solo usuario por navegador, no se contemplo el acceso concurrente. Si se quisiera escalar a multiples terminales, seria necesario migrar a una base de datos centralizada.

6. **Validaciones de negocio:** Implementar todas las validaciones necesarias (stock suficiente, pago minimo, campos obligatorios) sin un framework requirio atencion especial para cubrir todos los casos.

### 6.2 Logros

- Sistema completamente funcional sin dependencias externas.
- Interfaz moderna e intuitiva con navegacion por pestanas.
- Cobertura completa del ciclo de venta: desde seleccion de productos hasta generacion de ticket.
- Modulo de reportes basicos para toma de decisiones.
- Codigo organizado y documentado para facilitar futuras mejoras.

### 6.3 Mejoras Futuras

- Migracion a base de datos real (Firebase, MySQL, PostgreSQL).
- Sistema de autenticacion para multiples usuarios/cajeros.
- Integracion con impresoras termicas via API.
- Lectura de codigo de barras.
- Modulo de corte de caja.
- Exportacion de reportes a PDF/Excel.

---

*Documento generado como parte del proyecto de Desarrollo Empresarial - CESUN Universidad, abril 2026.*
