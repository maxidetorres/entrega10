const socket = io();

const author = new normalizr.schema.Entity('authors')

const mensaje =new normalizr.schema.Entity('mensajes',{
    author: author
  })
const chat = new normalizr.schema.Entity('chats', {
    mensajes: [ mensaje ]
  })


const formAgregarProducto = document.getElementById('formAgregarProducto')
formAgregarProducto.addEventListener('submit', e => {
    e.preventDefault()

    const producto = {
        title: formAgregarProducto[0].value,
        price: formAgregarProducto[1].value,
        thumbnail: formAgregarProducto[2].value
    }

    socket.emit('update', producto);

    formAgregarProducto.reset()
})

socket.on('productos', manejarEventoProductos);
socket.on('chat',manejarChat);
socket.on('login',menejarLogin)

async function manejarEventoProductos(productos) {

    const recursoRemoto = await fetch('plantillas/tabla-productos.hbs')

    const textoPlantilla = await recursoRemoto.text()

    const functionTemplate = Handlebars.compile(textoPlantilla)

    const html = functionTemplate({ productos })

    document.getElementById('productos').innerHTML = html
}

async function manejarChat(normlizrMsj){
    console.log("HOLA")
    console.log(normlizrMsj)
    const {normalizedData, roundTotalCompresion} = normlizrMsj
const denormalizedData = normalizr.denormalize(normalizedData.result, chat, normalizedData.entities);
console.log('CHARANNN',denormalizedData.mensajes)
  const recursoRemoto = await fetch('plantillas/chat.hbs')

  const textoPlantilla = await recursoRemoto.text()
  const functionTemplate = Handlebars.compile(textoPlantilla)
  const mensajes = denormalizedData.mensajes
  const html = functionTemplate({ mensajes , roundTotalCompresion})

 
  document.getElementById('chat').innerHTML = html

  const formChat = document.getElementById('formChat')
    formChat.addEventListener('submit', e => {
    

    console.log("ENTRO A ADD EVENT CHAT")
    e.preventDefault()

    const chat = {
        id: formChat[0].value,
        date: new Date().toLocaleString('es-AR'),
        nombre: formChat[1].value,
        apellido: formChat[2].value,
        edad: formChat[3].value,
        alias: formChat[4].value,
        avatar: formChat[5].value,
        mensaje: formChat[6].value

    }
    socket.emit('chat', chat);
    })
}


async function menejarLogin(datoLogin) {

    const recursoRemoto = await fetch('plantillas/logged.hbs')

    const textoPlantilla = await recursoRemoto.text()

    const functionTemplate = Handlebars.compile(textoPlantilla)

    const html = functionTemplate({ datoLogin })

    document.getElementById('login').innerHTML = html
}






