## 基于Cloudflare workers的可多端同步的todolist web应用
Cloudflare workers的新手教程里有一个最简化版的todolist应用，它的数据存储只基于Cloudflare KV，实现了对于每一个用户（或者是设备）单独存储一份todolist数据
https://dash.cloudflare.com/cbc516f6ae8408f59ee579f9686e3747/workers-and-pages/create/integration/2f4ab7e9-ff61-4cde-90b3-9572912afd5c/version/0.2.0/integrations-setup

我在这个应用的基础上，做了许多改动，将数据存储改为Cloudflare D1 SQL，并重构了它的后端。使其实现了对于任何访问用户，存储共享的一份todolist数据，如果只有单个用户的话，这个应用就是最简单的实现todolist数据多端同步访问的方法。实际上我的设计目的也正是此。

## 如何部署在自己的Cloudflare workers上
具体细节可以参考CF家的官方workers教程，如下：https://developers.cloudflare.com/workers/

### 部署过程
简而言之，可以通过新建一个workers实例，将其中内容清空（因为workers现在还不支持从git仓库直接拉取源代码），然后将上述仓库中的三个主要文件内的代码覆盖原有代码。然后将workers实例绑定自己的D1实例

这里⚠️注意将index.js中的`const db = env.<your env>`修改为自己的D1数据库env变量
#### 数据库的表名及结构
关于具体的D1数据库教程请参考：https://developers.cloudflare.com/d1/

数据库表名为`todolist`

结构如下：
| 列名           | 数据类型   | 描述            | 备注           |     |
| ------------ | ------ | ------------- | ------------ | --- |
| id           | INTERGER    | 待办事项 ID    |   不需要自增       |     |
| todo_title   | TEXT | 待办事项标题或者分类        |              |     |
| todo_content | TEXT | 代办事项具体内容      |              |     |
| todo_status  | INTERGER | 此项任务的完成情况     |   完成和未完成用1和0来表示          |     |

基于控制台的建表语句如下：
```sql
CREATE TABLE todolist (
  id INTEGER,
  todo_title TEXT NOT NULL,
  todo_content TEXT NOT NULL,
  todo_status INTERGER
);
```
## 最后
这是一个非常简陋的web应用，将其直接暴露在外部网络中存在一定的风险，请各位在使用时做好防护，保护好个人隐私信息，本人对此应用遭受潜在的网络攻击后造成的一切损失不负任何责任。

