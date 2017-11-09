# SMM Proyecto C
## Implementación de un servicio de códecs a la carta accesible desde kodi


Puntos a cumplir del proyecto:

- Implementación de un servidor para la api rest con Node.js.
- Disponer de algunos vídeos con distintos códecs, framerates, bitrates…
- Crear la estructura del json para que kodi la pueda interpretar correctamente.
- Hacer el addon para kodi, en el que se haga la clasificación.

Otros:

- Diseñar un algoritmo para calcular qué vídeo se ve objetivamente mejor, sin tener muy cuenta los parámetros. También podríamos hacer pruebas subjetivas para ver la calidad de nuestro algoritmo. En principio nosotros le daríamos cierto peso a ciertos parámetros del vídeo para calcular la calidad total.
- Calcular el ancho de banda del cliente y así recomendar el vídeo más adecuado para él.
- Implementar una opción para el usuario para poder subir un vídeo a nuestro servicio. Deberíamos poder descartarlo si es algo que ya tenemos (por sus parámetros) o aceptarlo en caso contrario, siempre dentro de un umbral de calidad.

Primer Paso del proceso:
- Implementación de un servidor para la api rest con Node.js     9/11/2017
