const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");
let db;

const server_database_connect = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server running http://localhost:3000/covid/");
    });
  } catch (error) {
    console.log(`DB error ${error.message}`);
    process.exit(1);
  }
};

server_database_connect();

// get method using query perimeters
const isStatus = (query) => {
  return (
    query.status !== undefined &&
    query.priority === undefined &&
    query.category === undefined
  );
};
const isPriority = (query) => {
  return (
    query.status === undefined &&
    query.priority !== undefined &&
    query.category === undefined
  );
};
const is_p_and_s = (query) => {
  return (
    query.status !== undefined &&
    query.priority !== undefined &&
    query.category === undefined
  );
};
const is_c_and_s = (query) => {
  return (
    query.status !== undefined &&
    query.priority === undefined &&
    query.category !== undefined
  );
};
const isCategory = (query) => {
  return (
    query.status === undefined &&
    query.priority === undefined &&
    query.category !== undefined
  );
};
const is_c_and_p = (query) => {
  return (
    query.status === undefined &&
    query.priority !== undefined &&
    query.category !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority, category } = request.query;
  let selectquery = "";
  switch (true) {
    case isStatus(request.query):
      selectquery = `
            SELECT * FROM todo WHERE status ='${status}'
            `;
      const s_res = await db.all(selectquery);
      if (s_res === undefined) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(s_res);
      }
      console.log("status");
      break;
    case isPriority(request.query):
      selectquery = `
            SELECT * FROM todo WHERE priority = '${priority}'
            `;
      const p_res = await db.all(selectquery);
      if (p_res === undefined) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(p_res);
      }
      console.log("prior");
      break;
    case is_p_and_s(request.query):
      selectquery = `
            SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}'
            `;
      const p_s_res = await db.all(selectquery);
      response.send(p_s_res);
      console.log("ps");
      break;
    case is_c_and_s(request.query):
      selectquery = `
            SELECT * FROM todo WHERE status = '${status}' AND category = '${category}'
            `;
      const c_s_res = await db.get(selectquery);
      response.send(c_s_res);
      console.log("c.s");
      break;
    case isCategory(request.query):
      selectquery = `
            SELECT * FROM todo WHERE category = '${category}'
            `;
      const c_res = await db.all(selectquery);
      if (c_res === undefined) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.send(c_res);
      }
      console.log("cate");
      console.log(c_res);

      break;
    case is_c_and_p(request.query):
      selectquery = `
            SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}'
            `;
      const c_p_res = await db.all(selectquery);
      response.send(c_p_res);
      console.log("cate.p");
      break;
    default:
      selectquery = `
            SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
            `;
      const def_res = db.all(selectquery);
      response.send(def_res);
      console.log(search_q);
      break;
  }
});

//based on id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getquery = `
    SELECT * FROM todo WHERE id = ${todoId}
    `;
  const get_res = await db.get(getquery);
  response.send(get_res);
});

//post the todo

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  const postquery = `
    INSERT INTO todo (id, todo, priority, status, category, due_date)
    VALUES (${id}, '${todo}', '${priority}', '${status}', "${category}", "${dueDate}")
    `;
  const pot_res = await db.run(postquery);
  res.send("Todo Successfully Added");
});

//update the todo base id

const hasstatus = (body) => {
  return (
    body.status !== undefined &&
    body.priority === undefined &&
    body.todo === undefined &&
    body.category === undefined &&
    body.dueDate === undefined
  );
};
const haspriority = (body) => {
  return (
    body.status === undefined &&
    body.priority !== undefined &&
    body.todo === undefined &&
    body.category === undefined &&
    body.dueDate === undefined
  );
};
const hascategory = (body) => {
  return (
    body.status === undefined &&
    body.priority === undefined &&
    body.todo === undefined &&
    body.category !== undefined &&
    body.dueDate === undefined
  );
};
const hastodo = (body) => {
  return (
    body.status === undefined &&
    body.priority === undefined &&
    body.todo !== undefined &&
    body.category === undefined &&
    body.dueDate === undefined
  );
};
const hasdate = (body) => {
  return (
    body.status === undefined &&
    body.priority === undefined &&
    body.todo === undefined &&
    body.category === undefined &&
    body.dueDate !== undefined
  );
};

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status, todo, priority, category, dueDate } = req.body;
  let putquery = "";

  switch (true) {
    case hasstatus(req.body):
      putquery = `
          UPDATE todo SET status = '${status}'
          WHERE id = ${todoId}
          `;
      const sres = await db.run(putquery);
      res.send("Status Updated");
      break;

    case haspriority(req.body):
      putquery = `
          UPDATE todo SET priority = '${priority}'
          WHERE id = ${todoId}
          `;
      const pres = await db.run(putquery);
      res.send("Priority Updated");
      break;
    case hascategory(req.body):
      putquery = `
          UPDATE todo SET category = '${category}'
          WHERE id = ${todoId}
          `;
      const catres = await db.run(putquery);
      res.send("Category Updated");
      break;
    case hastodo(req.body):
      putquery = `
          UPDATE todo SET todo = '${todo}'
          WHERE id = ${todoId}
          `;
      const todores = await db.run(putquery);
      res.send("Todo Updated");
      break;
    case hasdate(req.body):
      putquery = `
          UPDATE todo SET due_date = '${dueDate}'
          WHERE id = ${todoId}
          `;
      const dtres = await db.run(putquery);
      res.send("Due Date Updated");
      break;
    default:
      break;
  }
});

//delete the todo based on the todo id

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const del_query = `
     DELETE FROM todo WHERE id = ${todoId}
    `;
  const delres = await db.run(del_query);
  res.send("Todo Deleted");
});

//get todo based on query Date

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  const formated = new Date(date);
  const finaldate = format(formated, "yyyy-mm-dd");
  const d = `${formated.getFullYear()}-${
    formated.getMonth() + 1
  }-${formated.getDate()}`;
  const query = ` 
  SELECT 
  id,todo, priority, status, category, due_date as dueDate
   FROM
    todo 
    WHERE due_date = '${d}'`;
  const datetesponse = db.all(query);

  response.send(datetesponse);
});
