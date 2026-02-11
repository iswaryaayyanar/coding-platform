import mysql from 'mysql2/promise';


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Ishu@272005',
  database: 'coding_platform_app_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;