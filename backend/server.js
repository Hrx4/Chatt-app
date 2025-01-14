const express = require('express')
const dotenv = require('dotenv');
const bodyparser = require('body-parser')
// const cors = require("cors")
const connectDB = require('./config/db');
const colors = require("colors")
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors')
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();


const app = express()
app.use(cors());
app.use(bodyparser.json());
app.use(express.json());

app.get('/' , (req,res) => {
    res.send('Api is running')
});

app.use('/api/user',userRoutes);
app.use('/api/chat' ,chatRoutes);
app.use('/api/message' ,messageRoutes);


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000;


const server=app.listen(PORT , console.log(`Server is running on ${PORT}`.yellow.bold))

const io = require('socket.io')(server , {
    // pingTimeOut:60000,
    cors: {
        origin: '*'
    },
    transports: ["websocket", "polling"],
    
});

// const io = new Server(server)

io.on("connection" , (socket) => {
    console.log("connected socket");

    socket.on('setup' , (userData) =>{
        socket.join(userData.data._id)
        console.log(userData.data._id);
        socket.emit("connected")
    });
    socket.on('join chat', (room) => {
        socket.join(room)
        console.log("user joined " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));


    socket.on('new message' , (newMessageRecived) => {
        var chat = newMessageRecived.chat;
        if(!chat.users) return console.log('chat user not defined');

        chat.users.forEach(user => {
            if(user._id == newMessageRecived.sender._id) return;
            socket.in(user._id).emit("message recived", newMessageRecived);
        })
         
    })

})