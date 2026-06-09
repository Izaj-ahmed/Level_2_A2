import { Router } from "express";
import { issuesController } from "./issues.controller";


const router = Router();

router.post('/', issuesController.createIssues),
router.get('/', issuesController.getAllIssues),
router.get('/:id', issuesController.getIssuesById),
router.put('/:id', issuesController.updatedIssues),
router.delete('/:id', issuesController.deleteIssues)

export const issuesRouter = router;