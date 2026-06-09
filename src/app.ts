import express, { type Application, type Request, type Response } from 'express';


import { userRouter } from './db/modules/user/user.route';
import { issuesRouter } from './db/modules/issues/issues.route';
import { authRouter } from './db/modules/auth/auth.route';

export const app: Application = express()



app.use(express.json())




app.get('/', (req: Request, res: Response) => {
    //   res.send('express!');
    res.status(200).json({
        "message": "express server",
        "author": "izaj ahmed"
    });
});


//  data inset and retrive from database

app.use('/api/users', userRouter);

app.use('/api/issues', issuesRouter);
app.use('/api/auth', authRouter)



// updated user data



// delete user data





export default app;
