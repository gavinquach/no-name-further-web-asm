module.exports = (io) => {
    const users = {};

    getUserIdFromSocketId = (obj, socketid) => {
        return Object.keys(obj).find(userid => obj[userid] === socketid);
    }

    io.on("connection", (socket) => {
        // console.log("Made socket connection");

        socket.on("disconnect", () => {
            // console.log(`User ${users[getUserIdFromSocketId(users, socket.id)]} disconnected`);
            try {
                delete users[getUserIdFromSocketId(users, socket.id)];
            } catch (err) {
                return;
            }
        });

        socket.on("auth", (data) => {
            // console.log(`User ${data.id} connected`);
            // saving user id to object with socket ID
            users[data.id] = socket.id;
        });

        socket.on("notifyUser", (data) => {
            io.to(users[data.receiver]).emit("receiveNotifications", data);
        });

        socket.on("sendMessage", (msg) => {
            io.to(users[msg.receiver]).emit("receiveMessage", msg);
        });

        socket.on("chatWithUserRequest", (data) => {
            io.to(users[data.user]).emit("receivechatWithUserRequest", data);
        });

        socket.on("requestReloadNavBarNotifications", (user) => {
            io.to(users[user]).emit("receiveNavBarNotificationsReloadRequest", user);
        });

        socket.on("requestReloadNotifications", (user) => {
            io.to(users[user]).emit("receiveNotificationsReloadRequest", user);
        });

        socket.on("messageRead", (user) => {
            io.to(users[user]).emit("receiveMessageRead", user);
        });
    });
}