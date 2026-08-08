# Autenticación y Autorización con JWT en Express

## Descripción

Aplicación REST desarrollada con **Node.js + Express** para practicar autenticación y autorización mediante **JWT**.

El sistema permite:

- Registrar usuarios.
- Guardar contraseñas usando hash con `bcryptjs`.
- Iniciar sesión.
- Generar un token JWT.
- Enviar el token mediante `Authorization: Bearer <token>`.
- Validar el token con un middleware.
- Proteger la ruta `/api/perfil`.
- Detectar tokens ausentes, inválidos o expirados.

Los usuarios se almacenan en:

```text
usuarios.json
```

---

## Tecnologías utilizadas

- Node.js
- Express
- jsonwebtoken
- bcryptjs
- dotenv
- fs/promises
- Nodemon

---

## Estructura del proyecto

```text
jwt-express/
├── middlewares/
│   └── auth.js
├── usuarios.json
├── index.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

Si se crea manualmente:

```bash
npm install express jsonwebtoken bcryptjs dotenv
npm install -D nodemon
```

---

## Scripts

En `package.json`:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}
```

Ejecutar:

```bash
npm run dev
```

Luego la API queda disponible en:

```text
http://localhost:3000
```

---

# 1. Registro de usuario

Endpoint:

```text
POST /auth/register
```

Body JSON:

```json
{
    "email": "demo@mail.com",
    "password": "123456"
}
```

Ejemplo en Thunder Client:

```text
POST http://localhost:3000/auth/register
```

Seleccionar:

```text
Body → JSON
```

y enviar:

```json
{
    "email": "demo@mail.com",
    "password": "123456"
}
```

Respuesta:

```json
{
    "ok": true,
    "mensaje": "Usuario registrado correctamente",
    "data": {
        "id": 1,
        "email": "demo@mail.com",
        "role": "user"
    }
}
```

Código:

```text
201 Created
```

---

## Hash de contraseña

La contraseña no se guarda directamente.

Se utiliza:

```js
const passwordHash = await bcrypt.hash(password, 10);
```

Por ejemplo, el usuario escribe:

```text
123456
```

pero `usuarios.json` guarda algo parecido a:

```text
$2b$10$...
```

Esto evita guardar la contraseña en texto plano.

---

# 2. Login

Endpoint:

```text
POST /auth/login
```

Body:

```json
{
    "email": "demo@mail.com",
    "password": "123456"
}
```

El servidor busca al usuario y compara la contraseña:

```js
await bcrypt.compare(
    password,
    usuario.passwordHash
);
```

Si las credenciales son correctas, se genera el JWT.

Respuesta:

```json
{
    "ok": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Código:

```text
200 OK
```

---

## Credenciales incorrectas

Si el email o password no corresponden:

```text
401 Unauthorized
```

Respuesta:

```json
{
    "ok": false,
    "mensaje": "Credenciales inválidas"
}
```

Si falta email o password:

```text
400 Bad Request
```

---

# 3. ¿Qué contiene el JWT?

El token se crea con:

```js
jwt.sign(
    {
        sub: usuario.id,
        email: usuario.email,
        role: usuario.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRES || "15m"
    }
);
```

El payload contiene:

```text
sub   → ID del usuario
email → correo
role  → rol
```

El token expira después de:

```text
15 minutos
```

---

# 4. Ruta protegida

Endpoint:

```text
GET /api/perfil
```

Esta ruta utiliza el middleware:

```js
auth
```

Por eso no puede utilizarse sin token.

---

## Enviar el token

El token debe enviarse en el header:

```text
Authorization
```

con el valor:

```text
Bearer TOKEN
```

Ejemplo:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

En Thunder Client:

```text
Headers
```

Agregar:

```text
Authorization
Bearer <TOKEN>
```

Luego ejecutar:

```text
GET http://localhost:3000/api/perfil
```

---

## Respuesta del perfil

Si el token es correcto:

```json
{
    "ok": true,
    "data": {
        "id": 1,
        "email": "demo@mail.com",
        "role": "user"
    }
}
```

Código:

```text
200 OK
```

---

# 5. Middleware auth

El middleware se encuentra en:

```text
middlewares/auth.js
```

Primero obtiene:

```js
req.headers.authorization
```

El formato esperado es:

```text
Bearer <token>
```

Luego separa:

```js
const [tipo, token] = header.split(" ");
```

Por ejemplo:

```text
Bearer abc123
```

queda:

```text
tipo  = Bearer
token = abc123
```

Después verifica:

```js
jwt.verify(
    token,
    process.env.JWT_SECRET
);
```

Si el token es válido, su contenido se guarda en:

```js
req.user
```

y se ejecuta:

```js
next();
```

Esto permite continuar hacia la ruta protegida.

---

## Token ausente

Si no se envía:

```text
Authorization: Bearer ...
```

la API responde:

```text
401 Unauthorized
```

```json
{
    "ok": false,
    "mensaje": "Token requerido"
}
```

---

## Token inválido o expirado

Respuesta:

```text
401 Unauthorized
```

```json
{
    "ok": false,
    "mensaje": "Token inválido o expirado"
}
```

---

# Autenticación y autorización

## Autenticación

La autenticación responde:

```text
¿Quién eres?
```

En esta aplicación ocurre al hacer:

```text
POST /auth/login
```

Si las credenciales son válidas, se entrega un JWT.

---

## Autorización

La autorización responde:

```text
¿Puedes entrar a esta ruta?
```

El middleware decide si la petición tiene un token válido antes de permitir el acceso a:

```text
GET /api/perfil
```

---

# Flujo completo

```text
1. Usuario se registra
        ↓
POST /auth/register
        ↓
bcrypt crea hash
        ↓
usuarios.json
```

Luego:

```text
2. Usuario inicia sesión
        ↓
POST /auth/login
        ↓
Valida email/password
        ↓
JWT
```

Luego:

```text
3. Cliente guarda el token
        ↓
Authorization: Bearer TOKEN
        ↓
GET /api/perfil
        ↓
middleware auth
        ↓
jwt.verify()
        ↓
req.user
        ↓
200 OK
```

---

# Prueba completa en Thunder Client

## Paso 1

Registrar:

```text
POST http://localhost:3000/auth/register
```

```json
{
    "email": "demo@mail.com",
    "password": "123456"
}
```

## Paso 2

Login:

```text
POST http://localhost:3000/auth/login
```

```json
{
    "email": "demo@mail.com",
    "password": "123456"
}
```

Copiar el token recibido.

## Paso 3

Consultar perfil:

```text
GET http://localhost:3000/api/perfil
```

Header:

```text
Authorization: Bearer TOKEN_COPIADO
```

---

# Códigos HTTP utilizados

| Situación | Código |
|---|---:|
| Registro correcto | 201 |
| Login correcto | 200 |
| Perfil correcto | 200 |
| Datos faltantes | 400 |
| Credenciales inválidas | 401 |
| Token ausente | 401 |
| Token inválido | 401 |
| Token expirado | 401 |
| Email duplicado | 409 |
| Ruta inexistente | 404 |

---

# Archivos importantes

## usuarios.json

Inicialmente:

```json
[]
```

Después de registrar usuarios contendrá sus datos y contraseñas hasheadas.

## .env

Contiene información de configuración:

```text
PORT
JWT_SECRET
JWT_EXPIRES
```

## middlewares/auth.js

Verifica el token antes de permitir acceder a rutas protegidas.

---

# Conceptos principales

## JWT

JWT significa:

```text
JSON Web Token
```

Es un token firmado que permite transportar información del usuario y comprobar que no fue modificado.

## Bearer Token

El token se envía mediante:

```text
Authorization: Bearer <token>
```

## bcryptjs

Se utiliza para almacenar la contraseña como hash y verificarla durante el login.

## Middleware

Es una función que se ejecuta antes de llegar a una ruta.

En este proyecto:

```text
petición
   ↓
auth
   ↓
token válido
   ↓
/api/perfil
```

---

# Conclusión

La aplicación implementa autenticación y autorización mediante JWT.

El usuario se registra con contraseña protegida mediante `bcryptjs`, inicia sesión para recibir un token y posteriormente utiliza ese token en el header `Authorization` para acceder a una ruta protegida.

El middleware valida que el JWT exista, sea correcto y no haya expirado antes de permitir el acceso.
