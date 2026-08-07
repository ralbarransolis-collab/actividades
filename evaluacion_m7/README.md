Evaluación Final Módulo 7 - Administración de Países

Descripción

Esta aplicación permite administrar información de países utilizando un backend desarrollado con Node.js, Express, PostgreSQL, pg y pg-cursor.

El sistema trabaja con tres tablas existentes en la base de datos:

paises

paises_pib

paises_data_web

La aplicación permite:

Listar países con su continente, población, PIB 2019 y PIB 2020.

Mostrar los registros en bloques de 5, 10 o 20 mediante pg-cursor.

Agregar nuevos países.

Eliminar países.

Registrar las acciones realizadas en paises_data_web.

Utilizar transacciones con BEGIN, COMMIT y ROLLBACK.

Mostrar en el frontend los mensajes de error enviados por el backend.

Tecnologías utilizadas

Node.js

Express

PostgreSQL

pg

pg-cursor

dotenv

HTML

JavaScript

Fetch API

Bootstrap

Estructura del proyecto

evaluacion_m7_paises/
│
├── index.js
├── package.json
├── .env
├── README.md
│
├── data/
│   └── db.js
│
└── public/
    └── index.html

Base de datos

La base de datos y sus tablas se crean previamente en PostgreSQL utilizando el archivo SQL entregado para la evaluación.

La aplicación no crea las tablas.

Tabla paises

Guarda la información principal de cada país:

nombre

continente

poblacion

Tabla paises_pib

Guarda la información económica:

nombre

pib_2019

pib_2020

El campo nombre se relaciona con la tabla paises mediante una llave foránea.

Tabla paises_data_web

Registra las acciones realizadas sobre los países:

nombre_pais

accion

El valor de accion se interpreta así:

1 = país insertado
0 = país eliminado

Por ejemplo:

Chile | 0

significa que Chile fue eliminado.

Configuración de conexión

La conexión a PostgreSQL se configura mediante variables de entorno.

Archivo .env:

PORT=3000
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_NAME=nombre_de_tu_base
DB_PORT=5432

El archivo data/db.js crea un Pool de conexiones utilizando pg.

Backend

El backend se encuentra en index.js.

GET /paises

Permite obtener la lista de países junto con:

nombre

continente

población

PIB 2019

PIB 2020

Ejemplo:

GET /paises?cantidad=5&pagina=1

El parámetro cantidad puede ser:

5
10
20

El parámetro pagina indica el bloque de registros que se desea consultar.

Uso de pg-cursor

La evaluación solicita entregar los países en bloques mediante cursor.

Se importa:

const Cursor = require("pg-cursor");

El cursor permite recorrer el resultado de una consulta por partes, en vez de cargar todos los registros de una sola vez.

Ejemplo:

const cursor = conexion.query(
    new Cursor(`
        SELECT
            p.nombre,
            p.continente,
            p.poblacion,
            pp.pib_2019,
            pp.pib_2020
        FROM paises AS p
        INNER JOIN paises_pib AS pp
            ON p.nombre = pp.nombre
        ORDER BY p.nombre
    `)
);

La aplicación puede leer bloques de:

5 registros
10 registros
20 registros

Esto permite avanzar por el listado con el botón Siguiente.

POST /paises

Permite agregar un nuevo país.

Ejemplo de datos enviados:

{
    "nombre": "Canada",
    "continente": "America",
    "poblacion": 40000000,
    "pib_2019": 46300,
    "pib_2020": 43200
}

El proceso se ejecuta dentro de una transacción:

BEGIN
   ↓
INSERT INTO paises
   ↓
INSERT INTO paises_pib
   ↓
INSERT INTO paises_data_web
accion = 1
   ↓
COMMIT

Si alguna operación falla:

ROLLBACK

Esto evita que la información quede guardada de forma incompleta.

DELETE /paises

Permite eliminar un país utilizando su nombre.

Ejemplo:

DELETE /paises?nombre=Chile

También puede utilizarse:

DELETE /paises/Chile

La eliminación se ejecuta dentro de una transacción:

BEGIN
   ↓
DELETE FROM paises_pib
   ↓
DELETE FROM paises
   ↓
INSERT INTO paises_data_web
accion = 0
   ↓
COMMIT

Se elimina primero desde paises_pib porque esta tabla tiene una llave foránea hacia paises con ON DELETE NO ACTION.

Si alguna operación produce un error:

ROLLBACK

por lo que toda la eliminación se revierte.

Transacciones

Las transacciones permiten asegurar que todas las operaciones relacionadas se realicen correctamente.

Se inicia una transacción con:

await conexion.query("BEGIN");

Si todo resulta correctamente:

await conexion.query("COMMIT");

Si ocurre un error:

await conexion.query("ROLLBACK");

Así se mantiene la consistencia de la base de datos.

Ejemplo de COMMIT

Si se agrega un país nuevo y las tres inserciones funcionan:

paises             ✅
paises_pib         ✅
paises_data_web    ✅

se ejecuta:

COMMIT

El país queda guardado en las tres tablas y en paises_data_web queda registrado con:

accion = 1

Ejemplo de ROLLBACK

La columna nombre_pais de paises_data_web es clave primaria.

Si se intenta registrar nuevamente un país que ya existe en esta tabla, PostgreSQL genera un error de clave duplicada.

Por ejemplo, si Suiza ya existe en paises_data_web y se intenta eliminar:

DELETE paises_pib            ✅
DELETE paises                ✅
INSERT Suiza con accion = 0  ❌

la aplicación ejecuta:

ROLLBACK

Por lo tanto, Suiza vuelve a quedar en las tablas originales y no se completa la eliminación.

Frontend

El frontend se encuentra en:

public/index.html

La página permite utilizar todos los métodos del backend.

Listado de países

El usuario puede seleccionar:

5
10
20

registros por página.

También dispone de los botones:

Anterior
Siguiente

para recorrer los resultados.

Formulario para agregar país

Permite ingresar:

nombre

continente

población

PIB 2019

PIB 2020

Al enviar el formulario, JavaScript utiliza:

POST /paises

mediante fetch().

Formulario para eliminar país

El usuario debe ingresar el nombre del país.

Ejemplo:

Chile

El frontend realiza:

DELETE /paises?nombre=Chile

Si la operación es correcta, Chile se elimina de paises y paises_pib y queda registrado en paises_data_web como:

Chile | 0

Comunicación frontend - backend

El flujo general de la aplicación es:

Usuario
   ↓
HTML
   ↓
JavaScript
   ↓
fetch()
   ↓
Express
   ↓
pg / pg-cursor
   ↓
PostgreSQL

Los mensajes enviados por el backend se muestran en el frontend mediante alertas de Bootstrap.

Instalación

Desde la carpeta del proyecto ejecutar:

npm install

Si se instalan las dependencias manualmente:

npm install express pg pg-cursor dotenv

Ejecución

Ejecutar:

node index.js

La consola debería mostrar:

Servidor funcionando en http://localhost:3000

Luego abrir en el navegador:

http://localhost:3000

Pruebas recomendadas

Probar GET

Seleccionar 5 registros y utilizar el botón Siguiente para comprobar que la información se entrega en bloques mediante cursor.

Probar POST

Agregar un país que no exista y después comprobar:

SELECT * FROM paises;
SELECT * FROM paises_pib;
SELECT * FROM paises_data_web;

El nuevo país debe aparecer en las tres tablas y en paises_data_web debe tener:

accion = 1

Probar DELETE

Eliminar un país que no esté previamente registrado en paises_data_web.

Después comprobar:

SELECT *
FROM paises_data_web
WHERE nombre_pais = 'Chile';

Si Chile fue eliminado correctamente, debe aparecer:

Chile | 0

Probar ROLLBACK

Intentar eliminar un país que ya se encuentre registrado en paises_data_web.

La inserción del nuevo registro de auditoría producirá un error de clave duplicada y la aplicación ejecutará ROLLBACK.

El país no quedará eliminado.

Conclusión

La aplicación administra información de países mediante una API desarrollada con Node.js y PostgreSQL.

El uso de pg-cursor permite obtener la información por bloques, mientras que las transacciones aseguran que las operaciones de inserción y eliminación se completen totalmente o se reviertan cuando ocurre un error.

La tabla paises_data_web funciona como registro de acciones utilizando:

1 = inserción
0 = eliminación

De esta manera se implementan los requerimientos principales de backend y frontend solicitados en la evaluación.