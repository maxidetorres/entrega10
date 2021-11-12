const { connectionSql } = require('./connection/mySql')

const knex = require('knex')(connectionSql)

exports.getAllProducts = async () => {
   return await knex.from('products').select('*')
}

exports.addProduct = async (product) => {
    return knex('products').insert(product);
}
