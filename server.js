const express = require('express');
const app = express();

const { createServer } = require('http');
const httpServer = createServer(app);

const {
    newConnection,
    removeConnection,
    getConnectionByEno
} = require('./connections');

// body-parser 설정
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// socket.io-client 지정
const clientIO = require('socket.io-client');
const clientSocket = clientIO('http://localhost:5000');


// POST
app.post('/enterprises/:eno/tables/:tno', (req, res) => {
    // console.log(req.body);
    clientSocket.emit('orderFromTable', {
        body: req.body,
        eno: Number(req.params.eno), tno: Number(req.params.tno)
    });
    res.send({ "status": "success" });
});

// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function (req, res) {
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
})




// 서버 설정
const { Server } = require('socket.io');
const io = new Server(httpServer, {
    cors: {
        // origin: 'http://localhost:3000',
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const PORT = process.env.PORT || 5000;


// 오청을 받았을 때
io.on('connection', socket => {
    console.log(`${socket.id} 접속`)

    // 업체가 시작되었을 때
    socket.on('POS-startUp', (eno) => {
        // console.log("< POS-startup >");

        const { error, connection } = newConnection({ socketId: socket.id, eno: eno })

        // console.log("error      : ", error);
        // console.log("connection : ", connection);
    })

    // 주문을 받을 때
    socket.on('orderFromTable', order => {
        // console.log("< order >");
        // console.log("+ order : ", order);
        const connection = getConnectionByEno(order.eno);

        // console.log("+ order : ", order.body);
        // console.log("+ connection : ", connection)
        order.body.orderdetails.map((value) => {
            value.tno = order.tno;
        })
        console.log(order.body.orderdetails);
        if (connection)
            io.to(connection.socketId).emit('orderToPos', { message: order.body.orderdetails });
        else
            console.log("아직 개시되지 않은 POS로 요청을 보냈습니다.")
    })

    // 접속을 종료할 때
    socket.on('disconnect', () => {
        // console.log("< disconnect >");

        const { error, connection } = removeConnection({ socketId: socket.id });

        // console.log("error : ", error);
        // console.log("connection : ", connection);
        console.log(`${socket.id} 종료`)
    })
})


// 서버 시작
httpServer.listen(PORT, () => {
    console.log(`Server is listening ot port: ${PORT}`)
})