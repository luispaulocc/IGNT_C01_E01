const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());


const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find( user => user.username === username)

  if(!user){
    return response.status(404).json({erros:"User not foud!"})
  }

  request.user = user
  return next()
}



app.post('/users', (request, response) => {
  const {name,username}=request.body
  const id= uuidv4()

  const userAlreadyExists=users.some((users) => users.username===username);

  if(userAlreadyExists){
      return response.status(400).json({error:"User Already Exists"});
  }

  users.push({
      id:id,
      name,
      username,
      todos:[]
  })
  //return response.status(201).json({mensagem:"Registro efetuado com sucesso",id:id}).send()


  return response.status(201).json({id:id, name:name, username:username, todos:[]}).send()

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user}=request
    return response.status(200).json(user.todos).send()
});


app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {title, done, deadline}= request.body
    const {user}=request
    const id = uuidv4()

    const todoOperation={
          id:id,
          title:title,
          done:done?done:false,
          deadline: new Date(deadline),
          created_at:new Date()
    }
    user.todos.push(todoOperation)  
    return response.status(201).json({created_at: todoOperation.created_at, 
                                      deadline: todoOperation.deadline, 
                                      done:todoOperation.done, 
                                      id: todoOperation.id, 
                                      title: todoOperation.title}).send() 
                                    
    })


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {title, deadline}= request.body
    const {user}=request
    const {id}=request.params


    todoIndex = user.todos.findIndex(todo => todo.id === id)

    if (todoIndex > -1){
        user.todos[todoIndex].title=title,
        user.todos[todoIndex].deadline= new Date(deadline)
        return response.status(201).json({deadline:user.todos[todoIndex].deadline,
                                          done:user.todos[todoIndex].done,
                                          title:user.todos[todoIndex].title }).send()
    }else{
      return response.status(404).json({error:"Todo not Found"}).send()
    }

});



app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user}=request
  const {id}=request.params

  todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex > -1){
    user.todos[todoIndex].done=true
    return response.status(201).json({created_at:user.todos[todoIndex].created_at,
                                      deadline:user.todos[todoIndex].deadline,
                                      done:user.todos[todoIndex].done,
                                      id:user.todos[todoIndex].id,
                                      title:user.todos[todoIndex].title
                                       }).send() 
  }else{
    return response.status(404).json({error:"Todo not Found"}).send()
  }
});



app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user}= request
  const {id} = request.params

  const indexTodo = user.todos.findIndex(todo => todo.id === id);

  if(indexTodo > -1){  
    user.todos.splice(indexTodo,1);

    return response.status(204).json({sucesso:"Registro removido com sucesso", id:id}).send()
  }else{
    return response.status(404).json({error:"Todo not Found"}).send()
  }  
  // Complete aqui
});

module.exports = app;