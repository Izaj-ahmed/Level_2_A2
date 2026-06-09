import type { Request, Response } from "express"
import { authService } from "./auth.service"


const signUpUser = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { name, email, password, age } = req.body;

    try {
        
        const result = await authService.signUpUserIntoDB(req.body)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }

}


const loginUser = async (req: Request, res: Response)=>{
    try {

        const result = await authService.loginUserInttoDB(req.body)
        res.status(201).json({
            success: true,
            message: "User logged in successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })    
    }
}

export const authController ={
    signUpUser,
    loginUser
}