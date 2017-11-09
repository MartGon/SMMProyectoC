conn = new Mongo();
db = conn.getDB("myDatabase");

// O lo equivalente para poder ejecutar scripts

db.createCollection(peliculas, { nombre: <string>,
                                 path: <string>,
                                 resolucionH: <number>,
                                 resolucionV: <number>,
                                 duracion: <number>,
                                 framerate: <number>,
                                 codec: <string>,
                                 bitrate: <number>,  // en kbps/s
                                 gop: <number>,  // Número imágenes entre dos I. O sea un número y solo uno.
                                 entrelazado: <bool>
                               }
