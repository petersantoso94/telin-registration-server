require('dotenv').config()

const {
    Pool
} = require('pg')
const isProduction = process.env.NODE_ENV === 'production'
const dbHOST = process.env.NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${dbHOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
})

module.exports = {
    pool
}