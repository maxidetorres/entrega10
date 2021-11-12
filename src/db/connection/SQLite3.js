exports.connectionSqLite3 = {
    client: 'sqlite3',
    connection: {
        filename: '../mensaje.sqlite'
    },
    useNullAsDefault: true
}

console.log('Conectando a la base de datos SQLITE3');
