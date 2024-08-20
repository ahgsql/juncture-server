import { Server, Socket } from 'socket.io';

class ExpressBridge {
    private io: Server;
    private handlers: { [key: string]: (args: any, socket: Socket) => void };

    constructor(io: Server) {
        this.io = io;
        this.handlers = {};
    }

    registerHandler(command: string, handler: (args: any) => Promise<any>): void {
        const resultEvent = `${command}-result`;
        const errorEvent = `${command}-error`;

        this.handlers[command] = (args: any, socket: Socket) => {
            handler(args)
                .then((data) => {
                    socket.emit(resultEvent, data);
                })
                .catch((error: Error) => {
                    console.error(`Error handling command ${command}:`, error);
                    socket.emit(errorEvent, { message: error.message });
                });
        };

        this.io.on('connection', (socket: Socket) => {
            socket.on(command, (args: any) => {
                this.handlers[command](args, socket);
            });
        });
    }

    broadcast(event: string, data: any): void {
        this.io.emit(event, data);
    }
}

export default ExpressBridge;