conn = new Mongo();
db = conn.getDB("myDatabase");

// O lo equivalente para poder ejecutar scripts

db.createCollection(peliculas, { nombre: <string>,
                                 path: <string>,
                                 duracion: <number>,
                                 framerate: <number>,
                                 codec: <string>,
                                 bitrate: <number>,  // en kbps/s
                                 gop: <number>,  // Número imágenes entre dos I. O sea un número y solo uno.
                                 entrelazado: <bool>
                               }
