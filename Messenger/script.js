document.addEventListener("DOMContentLoaded", () => {
    const authModal = document.getElementById("authModal");
    const authUsername = document.getElementById("authUsername");
    const authButton = document.getElementById("authButton");
    const authError = document.getElementById("authError");
    const chatContainer = document.getElementById("chatContainer");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const messagesArea = document.getElementById("messagesArea");
    const userCountElement = document.getElementById("userCount");
    const fileInput = document.getElementById("fileInput");
    const attachButton = document.getElementById("attachButton");

    const socket = io();
    let currentUser = null;

    function tryAuth() {
        const username = authUsername.value.trim();
        if (!username) {
            authError.textContent = "Введите имя";
            return;
        }
        authButton.disabled = true;
        authError.textContent = "Проверка...";
        socket.emit("auth", { username: username }, (response) => {
            authButton.disabled = false;
            if (response && response.success) {
                currentUser = username;
                authModal.style.display = "none";
                chatContainer.style.display = "flex";
                messageInput.focus();
            } else {
                authError.textContent = (response && response.error) || "Ошибка авторизации";
                authUsername.select();
            }
        });
    }

    authButton.addEventListener("click", tryAuth);
    authUsername.addEventListener("keypress", (e) => {
        if (e.key === "Enter") tryAuth();
    });

    socket.on("chat message", (msg) => {
        addMessageToChat(msg);
    });

    socket.on("system", (data) => {
        addSystemMessage(data.message, data.count);
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentUser) return;
        socket.emit("chat message", { text: text });
        messageInput.value = "";
    }

    function sendImage(file) {
        if (!currentUser) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("Файл слишком большой. Максимум 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL("image/jpeg", 0.7);
                socket.emit("chat message", { text: "", image: compressed });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function addMessageToChat(msg) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        if (msg.username !== currentUser) messageDiv.classList.add("incoming");

        const usernameDiv = document.createElement("div");
        usernameDiv.classList.add("message-username");
        usernameDiv.textContent = msg.username;
        messageDiv.appendChild(usernameDiv);

        if (msg.text) {
            const textDiv = document.createElement("div");
            textDiv.textContent = msg.text;
            messageDiv.appendChild(textDiv);
        }

        if (msg.image) {
            const img = document.createElement("img");
            img.src = msg.image;
            img.classList.add("message-image");
            img.onclick = () => window.open(msg.image, "_blank");
            messageDiv.appendChild(img);
        }

        if (msg.timestamp) {
            const timeDiv = document.createElement("div");
            timeDiv.classList.add("message-time");
            timeDiv.textContent = msg.timestamp;
            messageDiv.appendChild(timeDiv);
        }

        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function addSystemMessage(text, count) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", "system");
        messageDiv.textContent = text + (count !== undefined ? " (всего: " + count + ")" : "");
        messagesArea.appendChild(messageDiv);
        if (count !== undefined) userCountElement.textContent = count;
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });
    attachButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            sendImage(file);
            fileInput.value = "";
        }
    });
});