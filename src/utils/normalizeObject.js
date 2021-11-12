const { normalize, denormalize, schema } = require("normalizr");
const util = require('util')

const print = (objeto) => {
  console.log(util.inspect(objeto, false, 12, true))
}
// Definimos un esquema de usuarios
const author = new schema.Entity('authors')

// Definimos un esquema de mensajes
const mensaje = new schema.Entity('mensajes',{
    author: author
  })

// Definimos un esquema de sala de chat
const chat = new schema.Entity('chats', {
  mensajes: [ mensaje ]
});
exports.normalizeObject = async(mensajes) =>{
    const arrayMensajes = []
    for (let i = 0 ; i < mensajes.length; i++){
        
        const msjNormalizr = {
            id: i,
            mensaje: mensajes[i].mensaje,
            date: mensajes[i].date,
            author: {
                id: mensajes[i].id,
                nombre: mensajes[i].nombre,
                apellido: mensajes[i].apellido,
                edad: mensajes[i].edad,
                alias: mensajes[i].alias,
                avat:mensajes[i].avatar
            }
        }
        arrayMensajes.push(msjNormalizr) 
    }
    console.log(arrayMensajes)

    const msjNormalize = {
        id: "chat",
        mensajes: arrayMensajes
    }
    console.log(' ------------- OBJETO ORIGINAL --------------- ')
    print(msjNormalize)
    console.log('ORIGINAL OBJ LENGTH',JSON.stringify(msjNormalize).length)

  
    console.log(' ------------- OBJETO NORMALIZADO --------------- ')
    const normalizedData = normalize(msjNormalize, chat);
    print(normalizedData)
    console.log('NORMALIZERDATA LENGTH',JSON.stringify(normalizedData).length)
    const totalCompresion = 100 - ((JSON.stringify(normalizedData).length * 100) / JSON.stringify(msjNormalize).length )

    const roundTotalCompresion = Math.round(totalCompresion * 100) / 100
    console.log('PORCENTAJE DE COMPRESION', roundTotalCompresion)
return { normalizedData, roundTotalCompresion }
}