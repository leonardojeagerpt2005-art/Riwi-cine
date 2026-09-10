# Cinema Riwi

Cinema Riwi es una aplicación web de cine construida con React, TypeScript, Vite y Express. Permite consultar la cartelera, seleccionar una función y sus sillas, administrar un carrito con entradas y productos de confitería, aplicar descuentos, simular el pago y consultar las reservas realizadas.

El proyecto utiliza `db.json` como persistencia local para desarrollo. No requiere una base de datos externa para ejecutarse.

## Funcionalidades

### Autenticación y registro

- Inicio de sesión con correo y contraseña.
- Registro de nuevos usuarios.
- Usuario demo disponible desde la pantalla de inicio de sesión.
- Persistencia de la sesión actual en `localStorage` mediante `cinema_user`.
- Redirección de usuarios no autenticados hacia `/login`.
- Flujo de verificación por token disponible en el backend.
- Modal de selección de país, departamento y ciudad después del inicio de sesión.

> La autenticación actual es una implementación de demostración. Las contraseñas están almacenadas en `db.json` y la sesión se guarda en el navegador; no debe utilizarse así en producción.

### Cartelera

La pantalla principal de cine está disponible en `/cinema` e incluye:

- Catálogo de películas.
- Búsqueda por título y sinopsis.
- Filtros por género.
- Poster, video promocional, sinopsis, duración, clasificación y precio.
- Horarios disponibles por película.
- Precios convertidos según la ubicación seleccionada.
- Cambio de idioma entre español e inglés para los textos principales.
- Selector de ubicación.
- Acceso al soporte.
- Consulta y cancelación de reservas anteriores.

Las películas de ejemplo están almacenadas en la colección `movies` de `db.json`.

### Selección de sillas

Al elegir una película se abre el selector de sillas:

- Sala de seis filas, de `A` a `F`.
- Ocho sillas por fila.
- Sillas normales en las filas `A-C`.
- Sillas `pro` en las filas `D-F`.
- Estado visual para sillas disponibles, seleccionadas y ocupadas.
- Selección de horario.
- Cálculo del precio de las entradas.
- Creación del carrito al confirmar las sillas.
- Regreso a la cartelera antes de confirmar la selección.

La interfaz utiliza una lista de sillas ocupadas simulada para el entorno de demostración.

### Carrito de compras

La pantalla está disponible en `/cart` y centraliza el proceso de compra.

Incluye:

- Resumen de las entradas seleccionadas.
- Película, fecha, horario y sillas elegidas.
- Botón para editar las sillas y regresar a la cartelera.
- Catálogo de confitería dentro del flujo de compra.
- Resumen de productos añadidos.
- Actualización de cantidades.
- Eliminación de productos.
- Subtotal de entradas.
- Subtotal de confitería.
- Descuentos.
- Impuestos del 19%.
- Total final.
- Temporizador de 15 minutos para el carrito.
- Notificación cuando el carrito ha expirado.
- Estado de carrito vacío.
- Modal de pago simulado.
- Métodos de pago de demostración: tarjeta, PSE y pago en taquilla.
- Confirmación de la compra.
- Descarga de comprobante en formato `.txt`.
- Vaciamiento lógico del carrito después de confirmar el pago.

Códigos de demostración:

| Tipo      | Código   | Beneficio                           |
| --------- | -------- | ----------------------------------- |
| Membresía | `RIWI15` | 15% de descuento                    |
| Bono      | `CINE25` | Descuento de 25 unidades monetarias |

### Confitería

El catálogo de productos se carga desde el backend y ofrece:

- Categorías de productos.
- Buscador por nombre y descripción.
- Tarjetas con imagen, nombre, descripción y precio.
- Identificación visual de promociones.
- Productos agotados deshabilitados.
- Adición de productos al carrito.
- Incremento y decremento de cantidades.
- Eliminación de productos.
- Control para impedir cantidades negativas.
- Validación de inventario en el servidor.

Los productos iniciales incluyen combos, nachos, palomitas, bebidas y chocolates.

### Ubicación y monedas

La ubicación seleccionada se guarda con la clave `cineclub_location` en `localStorage`.

El sistema soporta estas monedas de referencia:

- Colombia: COP.
- Panamá: USD.
- Estados Unidos: USD.
- México: MXN.
- Argentina: ARS.

Los tipos de cambio son fijos y simulados. Se utilizan únicamente para presentar precios en la interfaz.

### Soporte y notificaciones

- El modal de soporte permite enviar una solicitud con correo, asunto y mensaje.
- Las solicitudes se guardan en `db.json`.
- El servidor registra en consola el destinatario simulado.
- Las notificaciones pueden consultarse filtradas por `userId`.

## Rutas frontend

| Ruta        | Descripción                                      |
| ----------- | ------------------------------------------------ |
| `/`         | Redirección a `/login`.                          |
| `/login`    | Inicio de sesión.                                |
| `/register` | Registro de usuario.                             |
| `/cinema`   | Cartelera, reservas y navegación principal.      |
| `/cart`     | Carrito, confitería, descuentos y pago simulado. |
| `/404`      | Página de recurso no encontrado.                 |

## API disponible

Todas las rutas de la aplicación utilizan el prefijo `/api`.

### Autenticación

| Método | Endpoint                  | Descripción                                         |
| ------ | ------------------------- | --------------------------------------------------- |
| `POST` | `/api/auth/login`         | Valida credenciales contra los usuarios locales.    |
| `POST` | `/api/auth/request-token` | Genera un token de verificación.                    |
| `POST` | `/api/auth/verify-token`  | Valida el token y marca al usuario como verificado. |

### Recursos generales

El servidor también expone CRUD genérico para las colecciones de `db.json`:

| Método   | Endpoint             | Descripción            |
| -------- | -------------------- | ---------------------- |
| `GET`    | `/api/:resource`     | Lista una colección.   |
| `GET`    | `/api/:resource/:id` | Consulta un elemento.  |
| `POST`   | `/api/:resource`     | Crea un elemento.      |
| `PUT`    | `/api/:resource/:id` | Actualiza un elemento. |
| `DELETE` | `/api/:resource/:id` | Elimina un elemento.   |

Entre los recursos disponibles están `users`, `movies`, `bookings`, `support`, `notifications`, `showtimes`, `snacks` y `carts`.

### Cartelera y reservas

| Método   | Endpoint            | Descripción                        |
| -------- | ------------------- | ---------------------------------- |
| `GET`    | `/api/movies`       | Obtiene las películas.             |
| `GET`    | `/api/bookings`     | Obtiene las reservas.              |
| `POST`   | `/api/bookings`     | Crea una reserva confirmada.       |
| `DELETE` | `/api/bookings/:id` | Cancela una reserva.               |
| `POST`   | `/api/support`      | Registra una solicitud de soporte. |

### Confitería

| Método   | Endpoint                             | Descripción                           |
| -------- | ------------------------------------ | ------------------------------------- |
| `GET`    | `/api/snacks`                        | Lista productos de confitería.        |
| `GET`    | `/api/snacks?category=Combos`        | Filtra productos por categoría.       |
| `GET`    | `/api/snacks/categories`             | Devuelve las categorías disponibles.  |
| `POST`   | `/api/cart/snacks`                   | Agrega un producto al carrito.        |
| `PUT`    | `/api/cart/snacks/:snackId`          | Actualiza la cantidad de un producto. |
| `DELETE` | `/api/cart/snacks/:snackId?userId=1` | Elimina un producto del carrito.      |

### Carrito

| Método   | Endpoint                     | Descripción                                             |
| -------- | ---------------------------- | ------------------------------------------------------- |
| `GET`    | `/api/cart?userId=1`         | Recupera el carrito activo del usuario.                 |
| `POST`   | `/api/cart`                  | Crea un carrito a partir de las entradas seleccionadas. |
| `PUT`    | `/api/cart`                  | Actualiza el carrito activo por usuario.                |
| `PUT`    | `/api/cart/:id`              | Actualiza un carrito por identificador.                 |
| `DELETE` | `/api/cart`                  | Marca como completado el carrito activo del usuario.    |
| `DELETE` | `/api/cart/:id`              | Marca como completado un carrito específico.            |
| `POST`   | `/api/cart/apply-membership` | Aplica una membresía válida.                            |
| `POST`   | `/api/cart/apply-giftcard`   | Aplica un bono válido.                                  |

Los códigos válidos implementados en el mock son `RIWI15` y `CINE25`.

## Estructura del proyecto

```text
riwi-cine/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── components/
│       │   ├── CinematicBackground.tsx
│       │   ├── MovieCard.tsx
│       │   ├── SeatSelector.tsx
│       │   ├── SupportModal.tsx
│       │   ├── location/
│       │   └── ui/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       └── pages/
│           ├── Cart.tsx
│           ├── CinemaHome.tsx
│           ├── Home.tsx
│           ├── Login.tsx
│           ├── NotFound.tsx
│           └── Register.tsx
├── db.json
├── package.json
├── pnpm-lock.yaml
├── server/
│   └── index.ts
├── shared/
│   └── const.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Requisitos

- Node.js 20 o superior recomendado.
- Corepack habilitado.
- `pnpm` 10.x.

La versión declarada por el proyecto es `pnpm@10.4.1`.

## Instalación

Desde la raíz del proyecto:

```bash
corepack enable
corepack pnpm install
```

Si `pnpm` ya está habilitado, también puede utilizarse:

```bash
pnpm install
```

## Ejecución en desarrollo

```bash
pnpm run dev
```

El script inicia dos procesos:

- Backend Express en `http://localhost:3001`.
- Frontend Vite en `http://localhost:3002`.

El frontend redirige automáticamente las solicitudes `/api` al backend mediante el proxy configurado en `vite.config.ts`.

Abra la aplicación en:

```text
http://localhost:3002
```

Si otro proceso está utilizando los puertos, debe cerrarlo o modificar de forma coordinada el puerto del backend, el puerto de Vite y el proxy de `vite.config.ts`.

## Usuario demo

La pantalla de login incluye un botón para completar las credenciales de demostración:

```text
Correo: demo@riwicinema.com
Contraseña: 123
```

Estos datos provienen de `db.json` y solo deben utilizarse en desarrollo.

## Scripts disponibles

| Comando            | Descripción                                         |
| ------------------ | --------------------------------------------------- |
| `pnpm run dev`     | Inicia backend y frontend en modo desarrollo.       |
| `pnpm run check`   | Ejecuta TypeScript sin emitir archivos.             |
| `pnpm run build`   | Compila el frontend y empaqueta el servidor.        |
| `pnpm run start`   | Inicia el servidor compilado en producción.         |
| `pnpm run preview` | Sirve la compilación de Vite para previsualización. |
| `pnpm run format`  | Formatea los archivos con Prettier.                 |

## Build de producción

Ejecute:

```bash
pnpm run build
pnpm run start
```

El build genera:

- Frontend estático en `dist/public`.
- Servidor compilado en `dist/index.js`.

Para producción, el servidor utiliza `dist/public` como directorio de archivos estáticos.

## Persistencia de datos

El backend lee y escribe directamente en `db.json`:

- `users`: usuarios registrados.
- `movies`: películas de la cartelera.
- `bookings`: reservas confirmadas.
- `support`: solicitudes de soporte.
- `notifications`: notificaciones programadas.
- `showtimes`: horarios y salas.
- `snacks`: productos de confitería e inventario.
- `carts`: carritos activos, expirados o completados.
- `verificationTokens`: tokens temporales de verificación.

Esta persistencia es intencionalmente sencilla para desarrollo y demostraciones. No tiene bloqueo transaccional, control de concurrencia, auditoría ni respaldo automático.

## Flujo de compra

1. El usuario inicia sesión.
2. Selecciona su ubicación.
3. Explora la cartelera y elige una película.
4. Selecciona horario y sillas.
5. El frontend crea un carrito activo con duración de 15 minutos.
6. El usuario agrega productos de confitería.
7. Puede modificar cantidades o eliminar productos.
8. Puede aplicar una membresía o bono.
9. El sistema calcula subtotal, descuentos, impuestos y total.
10. El usuario selecciona un método de pago simulado.
11. Se crea la reserva y el carrito pasa a estado `completed`.
12. Se muestra la confirmación y se puede descargar un comprobante.

## Decisiones técnicas

- React 19 con TypeScript.
- Vite para desarrollo y bundling del frontend.
- Express para la API local.
- Wouter para el enrutamiento cliente.
- Tailwind CSS v4 para estilos.
- Radix UI para componentes accesibles.
- Lucide React y React Icons para iconografía.
- `db.json` como almacenamiento local.
- `localStorage` para sesión, idioma, tema y ubicación.

## Limitaciones conocidas

- El pago es simulado y no se conecta con una pasarela real.
- La autenticación no utiliza sesiones seguras ni tokens JWT.
- Las contraseñas están almacenadas en texto plano dentro del mock.
- La ocupación de sillas del selector es simulada y no se calcula por función en tiempo real.
- El inventario de confitería se valida contra el stock disponible, pero no se descuenta físicamente después de una compra.
- Los tipos de cambio son fijos y no provienen de un servicio financiero.
- `db.json` no es adecuado para múltiples instancias o alta concurrencia.
- Las variables de analítica de `index.html` requieren configuración externa si se desea activar ese servicio.

## Validación

Antes de entregar cambios, se recomienda ejecutar:

```bash
pnpm run check
pnpm run build
pnpm exec prettier --check .
```

El proyecto puede mostrar advertencias de Vite relacionadas con `VITE_ANALYTICS_ENDPOINT` y `VITE_ANALYTICS_WEBSITE_ID` si esas variables no están configuradas. Estas advertencias no impiden compilar la aplicación.
