const options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'ecommerce'
    }
}

const optionsSqlite = {
    client: 'sqlite3',
    connection: {
        filename:"./ecommerce/DB/ecommerce.sqlite"
    },
    useNullAsDefault:true
}
module.exports = {options, optionsSqlite}