PROYECTO: CLIENTES SEQUELIZE DIFER

1.En .env ingresar la contraseña de PostgreSQL.

2. Instalar dependencias si fuera necesario:
   npm install

3. Ejecutar:
   node index.js

4. Abrir:
   http://localhost:3000

NOTA:
Sequelize crea automáticamente la tabla clientes_difer
mediante sequelize.sync().

Nombres físicos en PostgreSQL:
- Tabla: clientes_difer
- id_cliente
- nombre_cliente
- correo

Nombres usados por la API:
- id
- nombre
- email

Esto se consigue con la propiedad "field" del modelo Sequelize.
