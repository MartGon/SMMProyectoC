var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
// O lo equivalente para poder ejecutar scripts

var pelicula = new Schema({ 
							 nombre: { type: String },
							 path: { type: String },
							 resolucionH: { type: Number },
							 resolucionV: { type: Number },
							 duracion: { type: Number },
							 framerate: { type: Number },
							 codec: { type: String },
							 bitrate: { type: Number },  // en kbps/s
							 gop: { type: Number },  // Número imágenes entre dos I. O sea un número y solo uno.
							 entrelazado: { type: Boolean },
							 original: { type: String },
							 calidad: { type: Number}
						   });

module.exports = mongoose.model('Pelicula', pelicula);