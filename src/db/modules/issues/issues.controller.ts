import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssues = async (req: Request, res: Response) => {
    try {
        const result = await issuesService.createissuesIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "issues created successfully",
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

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const result = await issuesService.getAllIssuesFromDB(req.query)
        res.status(200).json({
            success: true,
            message: 'Issues retrieved successfully',
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

const getIssuesById = async (req: Request, res: Response) => {
    const { id } = req.params
    // console.log(id);
    try {
        
        const result = await issuesService.getIssuesByIdFromDB(id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issues not found",
                data: {}
            })
        }

        res.status(200).json({
            success: true,
            message: 'Issues retrived successfully',
            data: result.rows
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }

}

const updatedIssues =  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;
    try {
        const result = await issuesService.updatedIssuesIntoDB(req.body,id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                data: {}
            })
        }
        res.status(200).json({
            success: true,
            message: 'Issues updated successfully',
            data: result.rows
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })

    }

}

const deleteIssues = async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        
        const result = await issuesService.deleteIssuesFromDB(id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                data: {}
            })
        }
        res.status(200).json({
            success: true,
            message: 'Users deleted successfully',
            data: {}
        })
    } catch (error :any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
        
    }
}

export const issuesController = {
    createIssues,
    getAllIssues,
    getIssuesById,
    updatedIssues,
    deleteIssues
}