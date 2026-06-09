import { Pool } from "pg";
import config from "../config/index";

export const pool = new Pool({
    connectionString: config.connection_string,

})

// database create table 

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(25),
            email VARCHAR(30) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()

            )
            `
        );

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
           
            title TEXT,
            description TEXT,
            type VARCHAR(20),
            status VARCHAR(20) DEFAULT 'open',

            reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
            
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
            )
            `
        )
    console.log("Database connect successfully!");

        

    } catch (error) {
        console.log(error);

    }
};

