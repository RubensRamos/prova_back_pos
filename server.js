const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.use(express.json());
//app.use(express.urlencoded({extended: true}));

app.get('/',(req, resp) => {
    resp.send({'message':'ok'});
});

app.post('/login', (req, resp) => {
    var body = req.body;
    if(body.username == 'usuario' && body.password == 'teste123'){
        var token = jwt.sign({username: 'usuario', role: 'admin'}, SEGREDO, {expiresIn: '1h'});
        resp.send({auth: true, token});
    }else{
        resp.status(403).send({auth: false, message: 'usuario invalido'});
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
    resp.status(201);
    resp.send(task);
});

//Lista todas as tarefas
app.get('/tasks', (req, resp) => {
    resp.send(tasks);
});

app.get('/tasks/:taskId', (req, resp) => {    
    const task = tasks.find(t => t.id == req.params.taskId);

    if(task){
        resp.status(200);
        resp.send(task);
    } else {
        resp.status(404);
        resp.send();
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
        resp.send(task);
    } else {
        resp.status(404);
        resp.send();
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