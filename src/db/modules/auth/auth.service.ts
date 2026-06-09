import { pool } from "../../index";
import bcrypt from "bcryptjs";


const signUpUserIntoDB = async (payload: { name: string, email: string, password: string, role: string }) => {
    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    

    const result = await pool.query(`
        INSERT INTO users (name, email, password, role)VALUES ($1,$2,$3,$4)
        RETURNING *
        `, [name, email, hashPassword, role]
    );
    delete result.rows[0].password

    return result
}


const loginUserInttoDB = async (payload: { email: string, password: string }) => {
    const { email, password } = payload;

    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]
    )
    if (userData.rows.length === 0) {
        throw new Error("User not found")
    }
    const user = userData.rows[0];
    console.log(user);
    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword){
        throw new Error("Invalid password")
    }

    return userData
}

export const authService = {
    signUpUserIntoDB,
    loginUserInttoDB
}