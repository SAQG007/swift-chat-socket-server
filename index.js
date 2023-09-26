const express = require('express');
var http = require('http');
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(express.json());

const createdRooms = {};

io.on("connection", (socket) => {
    console.log("Connected");
    console.log(socket.id, "has joined");
    socket.on("create-chat", (creatorName, roomName) => {
        const roomId = generateRandomString(6);

        createdRooms[roomId] = {
            name: roomName,
            createdBy: creatorName,
            members: [creatorName],
        };

        socket.join(roomId);
        socket.emit("generated-roomId", roomId);
    });
    socket.on("join-chat", (userName, roomId) => {
        // conditions to check if the room already exists or not
        // the roomId is the generated id by the generateRandomString() function
        if(createdRooms[roomId]) {
            createdRooms[roomId].members.push(userName);
            socket.emit("chat-room-name", createdRooms[roomId].name);
            socket.join(roomId);
        }
        else {
            socket.emit("room-not-found");
        }
    });
    socket.on('message', (roomId, message) => {
        socket.to(roomId).emit('message', message);
    });
    socket.on('leave', (memberName, roomId) => {
        socket.leave(roomId);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log("Server Started");
});

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}
