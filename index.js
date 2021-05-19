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
        if(listUserConnected.findIndex(x => x.nome == data.nome) >= 0)
            returnJoin = { joined: false, message: 'Já existe alguem com seu nome dentro da sessão.'}
        
        if(returnJoin == undefined)
        {
            listUserConnected.push({id: client.id, nome: data.nome});
            returnJoin = {joined: true, listUserConnected, clientId: client.id};
        }
        /*console.log('---------joinChat--------')
        console.log(data);
        console.log(returnJoin);
        console.log('---------joinChat--------')*/
        client.emit('joinChat', returnJoin);
        console.log(listUserConnected);
        if(returnJoin.joined)
            io.emit('userJoinInChat', listUserConnected);
    });

    client.on('chatLive', data => {
        //console.log('sas');
        io.emit('chatLiveAll', {clientId: client.id, myCam: data});
    });

    client.on('disconnect', () => { 
        console.log('Cliente '+client.id);
        let index = listUserConnected.findIndex(x => x.id == client.id);
        if(index < 0)
            return;
        console.log(index);
        listUserConnected.splice(index, 1);
        console.log(listUserConnected);
        io.emit('leaveChat', listUserConnected);
    });
});

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/', router);
server.listen(port, () => console.log(`On port ${port}`));