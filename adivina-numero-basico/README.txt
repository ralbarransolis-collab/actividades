JUEGO ADIVINA EL NÚMERO - VERSIÓN BÁSICA

1. Abra esta carpeta en Visual Studio Code.
2. Abra una terminal dentro de la carpeta.
3. Ejecute: npm install
4. Ejecute: npm start
5. Abra en el navegador: http://localhost:3000

ESTRUCTURA
- app.js: servidor, rutas y lógica del juego.
- views/inicio.ejs: formulario del nombre.
- views/jugar.ejs: formulario de los intentos y resultado.
- views/historial.ejs: tabla de partidas.
- data/partidas.json: almacenamiento permanente.

NOTA
Esta versión utiliza una variable global llamada partidaActual. Es una solución
básica pensada para aprendizaje y para un solo jugador conectado a la vez.
