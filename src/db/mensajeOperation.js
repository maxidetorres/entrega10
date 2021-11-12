const { connectionSqLite3 } = require('./connection/SQLite3')

const knexSqlite = require('knex')(connectionSqLite3)

exports.getAllMensajes = async () => {
   return await knexSqlite.from('mensaje').select('*')
}

exports.addMensaje = async (mensaje) => {
    return knexSqlite('mensaje').insert(mensaje);
}
