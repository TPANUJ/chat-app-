import app from "./src/app.js";
import connectDB  from "./src/config/database.js";


connectDB();

const expressServer = app.listen(4400,()=> {
    console.log("server is running on port 3000");
    
})


import { Server }from "socket.io"


const io = new Server(expressServer,{

            cors: {
            origin: "http://127.0.0.1:5500",
            credentials: true
        }


})

io.on('connect', socket => {
    console.log(socket.id), "has joined the server!";
    
     socket.on('send name', (username) => {
        io.emit('send name', (username));
    });

    socket.on('send message', (chat) => {
        io.emit('send message', (chat));
    });
})