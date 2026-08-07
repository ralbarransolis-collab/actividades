ACTIVIDAD RELACIONES N-N CON SEQUELIZE

BASE DE DATOS
-------------
Nombre: cine_nn_db

Crear:
CREATE DATABASE cine_nn_db;

CONFIGURACIÓN
-------------
1. Copiar .env.example
2. Renombrar la copia como .env
3. Cambiar DB_PASS por tu contraseña de PostgreSQL.

INSTALAR
--------
npm install

EJECUTAR
--------
npm start

o:
node index.js

Abrir:
http://localhost:3000


MODELOS
-------
Pelicula:
- id
- titulo
- anio

Actor:
- id
- nombre
- fecha_nacimiento

Tabla intermedia:
peliculas_actores
- pelicula_id
- actor_id


ENDPOINTS
---------
GET /peliculas
Lista películas con actores.

POST /peliculas
Ejemplo:
{
  "titulo": "Interestelar",
  "anio": 2014
}

También permite opcionalmente:
{
  "titulo": "Interestelar",
  "anio": 2014,
  "actor_ids": [1, 2]
}

GET /actores
Lista actores con películas.

POST /actores
{
  "nombre": "Ana Torres",
  "fecha_nacimiento": "1990-05-15"
}

POST /asignar-actor
{
  "pelicula_id": 1,
  "actor_id": 2
}


TRANSACCIÓN
-----------
POST /asignar-actor usa sequelize.transaction().

Dentro de la transacción:
1. Comprueba que la película exista.
2. Comprueba que el actor exista.
3. Comprueba que la relación no exista.
4. Inserta en peliculas_actores.

Si algo falla, Sequelize hace ROLLBACK automáticamente.
Si todo funciona, hace COMMIT.


PRUEBA DE RELACIÓN N-N
----------------------
1. Crear una película.
2. Crear dos actores.
3. Asignar ambos actores a esa película.
4. Crear una segunda película.
5. Asignar uno de los actores también a la segunda película.

Así se demuestra:
- una película tiene muchos actores;
- un actor puede estar en muchas películas.


PRUEBA DEL ROLLBACK
-------------------
Asigna una combinación válida una vez.

Luego intenta asignar exactamente el mismo actor
a la misma película otra vez.

Debe responder:
"El actor ya está asignado a esta película"

La segunda relación no se inserta.


PANTALLAZOS PARA ENTREGAR
-------------------------
1. GET /peliculas mostrando actores:
   http://localhost:3000/peliculas

2. Frontend después de crear una película o actor.

3. Mensaje exitoso de asignación actor -> película.

4. Opcional: pgAdmin mostrando:
   peliculas
   actores
   peliculas_actores
