import { pool } from "../../index";
import type { Iuser } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async (payload: Iuser) => {
    const { name, email, password, age } = payload;
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    

    const result = await pool.query(`
        INSERT INTO users (name, email, password, age)VALUES ($1,$2,$3,$4)
        RETURNING *
        `, [name, email, hashPassword, age]
    );
    delete result.rows[0].password

    return result
}


export const userService = {
    createUserIntoDB
}