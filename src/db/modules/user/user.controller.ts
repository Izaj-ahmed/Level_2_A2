import type { Request, Response } from "express";

import { userService } from "./user.service";


const createUser = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { name, email, password, age } = req.body;

    try {
        
        const result = await userService.createUserIntoDB(req.body)

        res.status(201).json({
            success: true,
            message: "User created successfully",
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


export const userController = {
    createUser
    
}