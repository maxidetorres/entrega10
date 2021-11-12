const express = require('express')
const exphbs = require('express-handlebars');
const { Server: HttpServer } = require('http')
const { Server: Socket } = require('socket.io')
const session = require('express-session')
const config = require('config')
/* ------------------------------------------------*/
/*           Persistencia por MongoDB              */
/* ------------------------------------------------*/
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
/* ------------------------------------------------*/
const app = express()

app.use(session({
    store: MongoStore.create({
        //En Atlas connect App :  Make sure to change the node version to 2.2.12:
        mongoUrl: `mongodb+srv://${config.get('mongo.username')}:${config.get('mongo.password')}@${config.get('mongo.cluster')}.mongodb.net/${config.get('mongo.dbname')}?retryWrites=true&w=majority`,
        mongoOptions: advancedOptions
    }),
    secret: 'shhhhhhhhhhhhhhhhhhhhh',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000
    }
}))
const httpServer = new HttpServer(app)
const io = new Socket(httpServer)
const {connectionSql} = require('./db/connection/mySql')
const {connectionSqLite3} = require('./db/connection/SQLite3')
const knex = require('knex')(connectionSql)
const knexLite = require('knex')(connectionSqLite3)
const productSql = require('./db/productOperation')
const mensajeSql = require('./db/mensajeOperation')
const productFaker = require('./utils/productfaker')

const normalizeChat = require('./utils/normalizeObject')
const productos = [
    {title:"Escuadra",price:123.45,thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",id:1},
    {title:"Calculadora",price:234.56,thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png",id:2}
]
const mensajes = [{id:"hola@gmail.com",date:"10/10/2021", nombre:'algo', apellido:'otracosa',edad:30, alias:'sanco',avatar:'htpspsps', mensaje:"holaque tal"}]





/* knex.schema.dropTableIfExists('products')
.then(()=>console.log('Tabla de Productos borrada...'))
.catch(e=>{
    console.log('Error en drop:', e);
    knex.destroy();
    process.exit(500);
});
knexLite.schema.dropTableIfExists('mensaje')
.then(()=>console.log('Tabla de Mensaje borrada...'))
.catch(e=>{
    console.log('Error en drop:', e);
    knex.destroy();
    process.exit(500);
});

knexLite.schema.createTable('mensaje', table => {
    // table.increments('id'),
    table.string('id'),
    table.string('date'),
    table.string('nombre'),
    table.string('apellido'),
    table.integer('edad'),
    table.string('alias'),
    table.string('avatar'),
    table.string('mensaje')
}).then(()=>{
    console.log('Table de mensajes creada')
    return knexLite('mensaje').insert(mensajes);
})

knex.schema.createTable('products', table => {
    table.increments('id'),
    table.string('title'),
    table.float('price'),
    table.string('thumbnail')
})
.then(()=>{
    console.log('Tabla de Productos creada...');
    return knex('products').insert(productos);
}) */

let datoLogin 
//--------------------------------------------
// configuro el socket
io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');

    // carga inicial de productos que se saca de mySql
    const arrayProducts = await productSql.getAllProducts()
   
    socket.emit('productos', arrayProducts);

    // actualización de productos
    socket.on('update', async (producto) => {
        //Se gurda producto en tabla productos de bd chat en mysql
        await productSql.addProduct(producto)
        const arrayProductSql = await productSql.getAllProducts()
        io.sockets.emit('productos', arrayProductSql);
    })

    // se obtiene los mensajes que se encuentran en bd mensaje en Sqlite3
    const mensajes = await mensajeSql.getAllMensajes()
    const normalizChat = await normalizeChat.normalizeObject(mensajes)
    socket.emit('chat', normalizChat)

    socket.on('chat', async (msj) => {
        //Se guarda mensaje en tabla mensaje de bd mensaje en sqlite3
        await mensajeSql.addMensaje(msj)
        const mensajes1 = await mensajeSql.getAllMensajes()
        const normalizChat = await normalizeChat.normalizeObject(mensajes1)
        io.sockets.emit('chat', normalizChat)
    })
    
    socket.emit('login', datoLogin)
});

//--------------------------------------------
// agrego middlewares

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))


app.engine('hbs', exphbs());
app.set('views', './public/plantillas'); 
app.set('view engine', 'hbs');

app.get('/api/productos-test', async (req, res) => {
        // carga lista de productos desde generador faker
        const arrayProductFaker = await productFaker.generateProductFaker(5)
        console.log(arrayProductFaker)
        res.render('tabla-productos', { productos: arrayProductFaker })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/api/login', (req, res) => {
    const { username } = req.body
    console.log('USERNAME',username)
    if (req.session.username) {
         
        //res.send(`Ud se ha logeado como: ${req.session.username}.`)
    } else {
        req.session.username = username

        //res.send(`Bienvenido! ${req.session.username}`)
    }
    datoLogin = req.session.username
   return res.redirect('/')
})

app.get('/api/logout', (req, res) => {
    datoLogin = null
    const datoLogout = req.session.username
    req.session.destroy(err => {
        if (!err) return res.render('logout', {datoLogout})
        else res.send({ status: 'Logout ERROR', body: err })
    })
  
})

//--------------------------------------------
// inicio el servidor
const PORT = 8080
const connectedServer = httpServer.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`)
})
connectedServer.on('error', error => console.log(`Error en servidor ${error}`))


