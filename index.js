const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require('path');

const port = process.env.PORT || 7000;
const app = express();
const router = express.Router();

const server = http.createServer(app);

const io = socketIO(server);

let listUserConnected = [];

io.on('connection', client => {
    client.on('joinChat', data => { 
        let returnJoin;
        if(data.nome == undefined || data.nome == '')
            returnJoin = { joined: false, message: 'Preencha seu nome para poder entrar na chamada.'}
        if(listUserConnected.findIndex(x => x.nome == data.nome) >= 0)
            returnJoin = { joined: false, message: 'Já existe alguem com seu nome dentro da sessão.'}
        
        if(returnJoin == undefined)
        {
            listUserConnected.push({id: client.id, nome: data.nome});
            returnJoin = {joined: true, listUserConnected, clientId: client.id};
        }
        
        client.emit('joinChat', returnJoin);
        if(returnJoin.joined)
            io.emit('userJoinInChat', listUserConnected);
    });

    client.on('chatLive', data => {
        io.emit('chatLiveAll', {clientId: client.id, myCam: data});
    });

    client.on('disconnect', () => { 
        let index = listUserConnected.findIndex(x => x.id == client.id);
        if(index < 0)
            return;

        listUserConnected.splice(index, 1);
        io.emit('leaveChat', listUserConnected);
    });
});

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/', router);
server.listen(port, () => console.log(`On port ${port}`));