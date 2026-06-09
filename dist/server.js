
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/db/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(
      `
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
    await pool.query(
      `
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
    );
    console.log("Database connect successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/db/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password, age } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, age)VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
    [name, email, hashPassword, age]
  );
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDB
};

// src/db/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var userController = {
  createUser
};

// src/db/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRouter = router;

// src/db/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/db/modules/issues/issues.service.ts
var createissuesIntoDB = async (payload) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(`
        INSERT INTO issues (title, description, type, status, reporter_id ) VALUES ( $1,$2,$3,$4,$5) RETURNING *
        `, [title, description, type, status, reporter_id]);
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += ` ORDER BY created_at ${sort === "oldest" ? "ASC" : "DESC"}`;
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;
  const reporterIds = [
    ...new Set(issues.map((issue) => issue.reporter_id))
  ];
  if (reporterIds.length === 0) {
    return [];
  }
  const reportersResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
    `,
    [reporterIds]
  );
  const reportersMap = new Map(
    reportersResult.rows.map((user) => [user.id, user])
  );
  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reportersMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedIssues;
};
var getIssuesByIdFromDB = async (id) => {
  const result = await pool.query(
    `
            SELECT * FROM users WHERE id = $1;
            `,
    [id]
  );
  return result;
};
var updatedIssuesIntoDB = async (payload, id) => {
  const { name, password, age, is_active } = payload;
  const result = await pool.query(`
            UPDATE users SET 
            name = COALESCE($1, name), 
            password = COALESCE($2, password), 
            age = COALESCE($3, age), 
            is_active = COALESCE($4, is_active)
            WHERE id = $5 RETURNING *
            `, [name, password, age, is_active, id]);
  return result;
};
var deleteIssuesFromDB = async (id) => {
  const result = await pool.query(
    `
            DELETE FROM issues WHERE id = $1 RETURNING *
            `,
    [id]
  );
  return result;
};
var issuesService = {
  createissuesIntoDB,
  getAllIssuesFromDB,
  getIssuesByIdFromDB,
  updatedIssuesIntoDB,
  deleteIssuesFromDB
};

// src/db/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const result = await issuesService.createissuesIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "issues created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getIssuesById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getIssuesByIdFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issues not found",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var updatedIssues = async (req, res) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;
  try {
    const result = await issuesService.updatedIssuesIntoDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issues updated successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var deleteIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.deleteIssuesFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Users deleted successfully",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getIssuesById,
  updatedIssues,
  deleteIssues
};

// src/db/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", issuesController.createIssues), router2.get("/", issuesController.getAllIssues), router2.get("/:id", issuesController.getIssuesById), router2.put("/:id", issuesController.updatedIssues), router2.delete("/:id", issuesController.deleteIssues);
var issuesRouter = router2;

// src/db/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/db/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
var signUpUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt2.hash(password, 10);
  console.log(hashPassword);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role)VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserInttoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  console.log(user);
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid password");
  }
  return userData;
};
var authService = {
  signUpUserIntoDB,
  loginUserInttoDB
};

// src/db/modules/auth/auth.controller.ts
var signUpUser = async (req, res) => {
  try {
    const result = await authService.signUpUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserInttoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error
    });
  }
};
var authController = {
  signUpUser,
  loginUser
};

// src/db/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/signup", authController.signUpUser);
router3.post("/login", authController.loginUser);
var authRouter = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "express server",
    "author": "izaj ahmed"
  });
});
app.use("/api/users", userRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/auth", authRouter);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map