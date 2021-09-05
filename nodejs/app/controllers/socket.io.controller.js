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

        socket.on("notifyCancelTransaction", (data) => {
            io.to(users[data.receiver]).emit("receiveNotifications", data);
        });
    });
}