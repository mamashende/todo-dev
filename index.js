import { escapeHtml } from './escape.js';
import template from './template.html';

export default {
  async fetch(request, env) {
    const db = env.<your env >;

    async function getTodos() {
      const query = 'SELECT * FROM todolist';
      const { results } = await db.prepare(query).all();
      const data = { todos: results };

      const body = template.replace(
        '$TODOS',
        JSON.stringify(
          data.todos?.map(todo => ({
            id: escapeHtml(todo.id),
            title: escapeHtml(todo.todo_title),
            content: escapeHtml(todo.todo_content),
            status: !!todo.todo_status // 将整数转换为布尔值
          })) ?? []
        )
      );

      return new Response(body, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    async function updateTodos(request) {
      const body = await request.json();
      const { id, status } = body;

      if (id === undefined || status === undefined) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
      }

      const query = `
        UPDATE todolist
        SET todo_status = ?
        WHERE id = ?
      `;
      await db.prepare(query).bind(status ? 1 : 0, id).run(); // 将布尔值转换为整数

      return new Response(JSON.stringify(body), { status: 200 });
    }

    async function addTodo(request) {
      const body = await request.json();
      let { todo_title, todo_content, status } = body;
      todo_title = String(todo_title);
      todo_content = String(todo_content);
      status = status ? 1 : 0; // 将布尔值转换为整数

      const query0 = 'SELECT * FROM todolist';
      const { results } = await db.prepare(query0).all();
      const data = { todos: results };

      let maxId = data.todos.length === 0 ? 1 : Math.max(...data.todos.map(todo => todo.id)) + 1;

      const query = `
        INSERT INTO todolist (id, todo_title, todo_content, todo_status)
        VALUES (?, ?, ?, ?)
      `;
      await db.prepare(query).bind(maxId, todo_title, todo_content, status).run();

      const newTodo = { id: maxId, title: todo_title, content: todo_content, status: !!status };
      return new Response(JSON.stringify(newTodo), { status: 200 });
    }

    async function deleteTodo(request) {
      const body = await request.json();
      const { id } = body;

      const query = `
        DELETE FROM todolist
        WHERE id = ?
      `;
      await db.prepare(query).bind(id).run();

      return new Response(JSON.stringify({ id }), { status: 200 });
    }

    if (request.method === 'GET') {
      return getTodos();
    } else if (request.method === 'PUT') {
      return updateTodos(request);
    } else if (request.method === 'POST') {
      return addTodo(request);
    } else if (request.method === 'DELETE') {
      return deleteTodo(request);
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
