require('dotenv').config()

const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express()
const server = require('http').createServer(app)

var cookieParser = require('cookie-parser');
var path = require('path');

const io = require('socket.io')(server)
const PORT = process.env.PORT || 8080

const AccountRouter = require('./router/AccountRouter')
const MesageRouter = require('./router/MesageRouter')

// Connect DB
require('./db/connect');

// app.use(express.json());
// app.use(express.urlencoded({ extended: false}));
// app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));
//app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

app.use(cookieParser());
app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/account', AccountRouter)
app.use('/api/message', MesageRouter)


app.get('/chat', (req, res) => {
    const account = req.session.account;
    console.log(account)
    if (!account) {
        return res.redirect('/login');
    }
    res.sendFile(__dirname + '/views/chat.html')
})

app.get('/login', (req, res) => {
    console.log(req.session.account)
    if (req.session.account) {
        return res.redirect('/chat')
    }
    else {
        res.sendFile(__dirname + `/views/login.html`)
    }

})

app.get('/register', (req, res) => { res.sendFile(__dirname + '/views/register.html') })


io.on('connection', client => {

    let users = Array
        .from(io.sockets.sockets.values())
        .map(socket => {
            return {
                id: socket.id,
                fullName: socket.fullName,
                _id: socket._id
            }
        })

    client.on('send-message', (data) => {

        let sendUserSocket = data.to;
        
        let  value  = {
            message : data.message,
            date : data.date , 
            image : data.base64Image
        }

        client.to(sendUserSocket).emit('msg-receive', value)
    })

    client.on('disconnect', () => {
        client.broadcast.emit('user-leave', client.id);
    })

    client.on('register-name', account => {

        client.fullName = account.fullName;
        client._id = account._id
        //console.log(client._id)

        // gửi thông tin đăng kí tên cho tất cả user còn lại 
        client.broadcast.emit('register-name', {
            id: client.id,
            fullName: client.fullName,
            _id: client._id
        })
    })

    // gửi danh sách online cho người mới 
    client.emit('list-users', users)

    // gửi thông tin người mới cho những người trước đó
    client.broadcast.emit('new-user', {
        id: client.id,
        fullName: client.fullName,
        _id: client._id
    })
    
})

server.listen(PORT, () => { console.log('http://127.0.0.1:' + PORT); })