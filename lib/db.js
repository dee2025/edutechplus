// import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
// });

// export default pool;


import mysql from "mysql2/promise";

let pool;

if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,

        enableKeepAlive: true,
        connectTimeout: 10000,
    });
}

pool = global.mysqlPool;

export default pool;
