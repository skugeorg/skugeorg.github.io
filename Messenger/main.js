const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const PORT = 8080;

app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 50 * 1024 * 1024,
    transports: ["websocket", "polling"]
});

const usedUsernames = new Set();

io.on("connection", (socket) => {
    console.log("Новое подключение:", socket.id);
    let currentUser = null;

    socket.on("auth", (data, callback) => {
        const username = (data.username || "").trim();
        if (username.length < 2) {
            callback({ success: false, error: "Имя должно содержать минимум 2 символа" });
            return;
        }
        if (usedUsernames.has(username)) {
            callback({ success: false, error: "Это имя уже занято. Выберите другое." });
            return;
        }
        currentUser = username;
        socket.username = username;
        usedUsernames.add(username);
        callback({ success: true });
        const count = io.of("/").sockets.size;
        io.emit("system", { message: username + " подключился", count: count });
    });

    socket.on("chat message", (msg) => {
        if (!socket.username) return;
        msg.username = socket.username;
        msg.timestamp = new Date().toLocaleTimeString();
        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        if (socket.username) {
            usedUsernames.delete(socket.username);
            const count = io.of("/").sockets.size;
            io.emit("system", { message: socket.username + " отключился", count: count });
        }
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("Сервер запущен на http://localhost:" + PORT);
});