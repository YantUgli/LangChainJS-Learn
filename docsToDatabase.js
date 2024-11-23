import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Konfigurasi database
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

// Fungsi untuk membuat koneksi
async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Database connected successfully!');
        return connection;
    } catch (error) {
        console.error('Error connecting to database:', error.message);
        throw error;
    }
}

// Contoh penggunaan
(async () => {
    const connection = await connectToDatabase();

    // Contoh query
    const [rows] = await connection.execute('SELECT nama FROM m_mata_pelajaran');
    console.log(rows);

    await connection.end(); // Tutup koneksi
})();

// (async () => {
//     const connection = await connectToDatabase();

//     // Query untuk mengambil nama mata pelajaran yang unik
//     const [rows] = await connection.execute(`
//       SELECT nama
//       FROM m_mata_pelajaran
//       GROUP BY nama
//     `);
//     console.log(rows);

//     await connection.end(); // Tutup koneksi
// })();


// (async () => {
//     const connection = await connectToDatabase();

//     // Query untuk mengambil nama mata pelajaran yang unik
//     const [rows] = await connection.execute('SELECT DISTINCT nama FROM m_mata_pelajaran');
//     console.log(rows);

//     await connection.end(); // Tutup koneksi
// })();
