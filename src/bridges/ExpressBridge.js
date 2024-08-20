class ExpressBridge {
    constructor(io) {
        this.io = io;
        this.handlers = {};
    }

    registerHandler(command, handler) {
        const resultEvent = `${command}-result`;
        const errorEvent = `${command}-error`;

        this.handlers[command] = (args, socket) => {
            handler(args)
                .then((data) => {
                    socket.emit(resultEvent, data);
                })
                .catch((error) => {
                    console.error(`Error handling command ${command}:`, error);
                    socket.emit(errorEvent, { message: error.message });
                });
        };

        this.io.on('connection', (socket) => {
            socket.on(command, (args) => {
                this.handlers[command](args, socket);
            });
        });
    }
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}

export default ExpressBridge;