const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/',(req, resp) => {
    resp.send({'message':'ok'});
});

app.post('/login', (req, resp) => {
    var body = req.body;
    if(body.username == 'usuario' && body.password == '123456'){
        var token = jwt.sign({username: 'usuario', role: 'admin'}, SEGREDO, {expiresIn: '1h'});
        resp.status(200).send({token});
    }else{
        resp.status(401).send({message: 'Error in username or password'});
    }
});

function cobrarTokenJWT(req, resp, next){
    if(req.url == '/login'){
        next();
    }

    var token = req.headers['x-acess-token'];
    try{
        var decodificado = jwt.verify(token, SEGREDO);
        next();
    } catch (e){
        resp.status(500).send({message: 'token invalido'});
    }
}

app.use(cobrarTokenJWT);

var tasks = [];

//Incluir uma tarefa
app.post('/tasks', (req, resp) => {
    const body = req.body;
    const task = {
        id: uuid(),
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    };
    tasks.push(task);
    resp.status(201).send(task);
});

//Lista todas as tarefas
app.get('/tasks', (req, resp) => {
    resp.status(200).send(tasks);
});

app.get('/tasks/:taskId', (req, resp) => {    
    const task = tasks.find(t => t.id == req.params.taskId);

    if(task){
        resp.status(200).send(task);
    } else {
        resp.status(404).send();
    }
});

app.put('/tasks/:taskId', (req, resp) => {
    const { body } = req;
    const task = tasks.find(t => t.id == req.params.taskId);

    if(task){
        task.title = body.title;
        task.description = body.description;
        task.isDone = body.isDone;
        task.isPriority = body.isPriority;
        resp.status(200).send(task);
    } else {
        resp.status(404).send();
    }
});

app.delete('/tasks/:taskId', (req, resp) => {
    var task = tasks.find(t => t.id == req.params.taskId);

    if(task){
        tasks = tasks.filter(t => t.id != req.params.taskId);
        resp.status(200).send(task);
    }else{
        resp.status(404).send();
    }
});

app.listen(3000);