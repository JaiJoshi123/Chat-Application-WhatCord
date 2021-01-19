if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express")
const app = express()
const path = require('path')
const session = require("express-session")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose");
const passport = require('passport')
const MongoStore = require('connect-mongo')(session);
const flash = require("connect-flash");


const http = require("http")
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server)

const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats")

const Chat = require("./models/chat")
const Room = require("./models/room");

const { storeInfo, getInfo } = require("./utils/userInfo");
const user = require("./models/user");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/what-cord';
mongoose.connect(dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("MONGOOSE CONNECTED")
});

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const secret = process.env.SECRET || "lolnoobsecret";

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'sessionsecretid',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

require("./passport-google")

io.on('connection', socket => {
    console.log("NEW CONNECTION")
    //console.log(socket)
    socket.on('joinRoom', async ({ user, room }) => {
        //console.log(room)
        const newRoom = await Room.findById(room._id)
        newRoom.users.push(user)
        await newRoom.save();
        socket.join(room.name)
        storeInfo(user, room);
        const chat = new Chat({
            author: "Bot",
            message: "Welcome to the server"
        })
        socket.emit("message", {chat,time: chat.time});
        const chat2 = new Chat({
            author: "Bot",
            message: `${user.displayName} has joined`
        })
        socket.broadcast.to(room.name).emit("message", {chat2,time: chat2.time});
        //console.log(newRoom)
        io.to(room.name).emit('roomUsers', {newRoom})
    })

    socket.on('chatMessage', async ({ msg, user, room }) => {
        //console.log(user)
        msg= msg.replace(/</g,' ');
        msg= msg.replace(/>/g,' ');
        //msg= msg.replace(/</g,' ');
        console.log(typeof(msg))
        const chat = new Chat({
            author: user.displayName,
            message: msg
        })
        await chat.save();
        const newRoom = await Room.findById(room._id)
        newRoom.messages.push(chat)
        await newRoom.save();
        //console.log(chat)
        io.to(room.name).emit('message', {chat,time: chat.time});
    })
    socket.on("disconnect", async(e) => {
        console.log("DISCONNECTING NOW")
        const chat = new Chat({
            author: "Bot",
            message: `${getInfo().user.displayName} left the server`
        })
        await Room.findByIdAndUpdate(getInfo().room._id, {$pull: {users: getInfo().user._id}})
        io.to(getInfo().room.name).emit("message", {chat,time: chat.time});
    })
})



app.use('/', userRoutes);
app.use('/chat', chatRoutes)

app.get('/', (req, res) => {
    //console.log(req.user)
    res.render('home');
})

app.all("*", (req, res, next) => {
    res.redirect('/')
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})
