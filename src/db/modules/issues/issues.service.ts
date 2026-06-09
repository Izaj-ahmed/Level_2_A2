import { pool } from "../../index";

const createissuesIntoDB = async (payload: any) => {
    // console.log(payload);
    const { title, description, type, status, reporter_id } = payload;
    
    

    const result = await pool.query(`
        INSERT INTO issues (title, description, type, status, reporter_id ) VALUES ( $1,$2,$3,$4,$5) RETURNING *
        `, [title, description, type, status, reporter_id])
    return result
}


const getAllIssuesFromDB = async (query: any) => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues`;
  const conditions: string[] = [];
  const values: any[] = [];

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

  sql += ` ORDER BY created_at ${
    sort === "oldest" ? "ASC" : "DESC"
  }`;

  const issuesResult = await pool.query(sql, values);

  const issues = issuesResult.rows;

  // get all reporter ids
  const reporterIds = [
    ...new Set(issues.map((issue) => issue.reporter_id)),
  ];

  if (reporterIds.length === 0) {
    return [];
  }

  // fetch reporters
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
    updated_at: issue.updated_at,
  }));

  return formattedIssues;
};

const getIssuesByIdFromDB = async (id : string) => {
    const result = await pool.query(`
            SELECT * FROM users WHERE id = $1;
            `, [id]
    )
    return result
}

const updatedIssuesIntoDB = async (payload: any,id : string)=>{
    const {name, password, age, is_active} = payload;
    const result = await pool.query(`
            UPDATE users SET 
            name = COALESCE($1, name), 
            password = COALESCE($2, password), 
            age = COALESCE($3, age), 
            is_active = COALESCE($4, is_active)
            WHERE id = $5 RETURNING *
            `, [name, password, age, is_active, id])
    return result
}

const deleteIssuesFromDB = async (id: string)=>{
    const result = await pool.query(`
            DELETE FROM issues WHERE id = $1 RETURNING *
            `, [id]
    )
    return result
}


export const issuesService = {
    createissuesIntoDB,
    getAllIssuesFromDB,
    getIssuesByIdFromDB,
    updatedIssuesIntoDB,
    deleteIssuesFromDB
}