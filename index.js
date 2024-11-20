import { escapeHtml } from './escape.js';
import template from './template.html';

export default {
  async fetch(request, env) {
    const db = env.oyzy; // 使用绑定的 D1 数据库

    

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
            status: !!todo.status
          })) ?? []
        )
      );
      //console.log(data);
      //console.log(data)
      return new Response(body, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    async function updateTodos(request) {
      const body = await request.json();
      //console.log(body)
      const { id, todo_title, todo_content, status } = body;
      //console.log({ id, todo_title, todo_content, status } )
      if (id === undefined || todo_title === undefined || todo_content === undefined ) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
      }

      const query = `
        UPDATE todolist
        SET id = ?,todo_title = ?, todo_content = ?, todo_status = ?
        WHERE id = ?
      `;
      await db.prepare(query).bind(todo_title, todo_content, status, id).run();

      return new Response(JSON.stringify(body), { status: 200 });
    }

    async function addTodo(request) {
      const body = await request.json();
      var { todo_title, todo_content, status } = body;
      //console.log(body);
      //console.log({ todo_title, todo_content });
      todo_title = String(todo_title);
      todo_content = String(todo_content);
      status = String(status);
      //console.log(todo_title, todo_content);
      // 查询现有的 todos
      const query0 = 'SELECT * FROM todolist';
      const { results } = await db.prepare(query0).all();
      const data = { todos: results };
    
      // 检查查询结果是否为空并计算最大 id
      let maxId;
      if (data.todos.length === 0) {
        //console.log('查询结果为空');
        maxId = 1; // 如果没有现有的 todos，设置 maxId 为 1
      } else {
        // 找出查询结果中 id 的最大值
        maxId = data.todos.reduce((max, todo) => {
          return todo.id > max ? todo.id : max;
        }, -Infinity);
        maxId += 1; // 新的 todo 的 id 应该是最大 id 加 1
      }
    
      //console.log('最大 id:', maxId);
    
      // 插入新的 todo
      const query = `
        INSERT INTO todolist (id,todo_title, todo_content, todo_status)
        VALUES (?, ?, ?, ?)
      `;
      await db.prepare(query).bind(maxId,todo_title, todo_content, status).run();
    
      // 返回插入后的数据
      const newTodo = { id: maxId, todo_title: todo_title, todo_content: todo_content, todo_status: status };
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