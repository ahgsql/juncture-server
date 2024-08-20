import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import ExpressBridge from "../bridges/ExpressBridge.js";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const STATE_FILE_PATH = path.join(process.cwd(), 'state.json');


class Juncture {
    constructor(port = 3000, defaultState = {}, config = {}) {
        this.port = port;
        this.defaultState = defaultState;
        this.state = this.loadStateFromFile();
        var defaultConfig = {
            maxListeners: 10,
            staticFolder: "/public"
        }
        this.config = Object.assign(defaultConfig, config);

        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
            maxHttpBufferSize: 1e8,
        });
        this.io.setMaxListeners(this.config.maxListeners);
        this.bridge = new ExpressBridge(this.io);
        // Statik dosyaları servis etmek için
        this.app.use(express.static(path.join(process.cwd(), '/public')));
    }


    loadStateFromFile() {
        try {
            const data = fs.readFileSync(STATE_FILE_PATH, 'utf8');
            const state = JSON.parse(data);
            return this.validateState(state, this.defaultState);
        } catch (err) {
            console.error("State dosyası yüklenemedi:", err);
            fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(this.defaultState, null, 2), 'utf8');
            return this.defaultState;
        }
    }

    saveStateToFile() {
        try {
            fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf8');
        } catch (err) {
            console.error("State dosyası kaydedilemedi:", err);
        }
    }

    validateState(state, defaultState) {
        for (const key in defaultState) {
            if (!(key in state)) {
                state[key] = defaultState[key];
            } else if (typeof defaultState[key] === 'object' && defaultState[key] !== null) {
                state[key] = this.validateState(state[key], defaultState[key]);
            }
        }
        return state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveStateToFile();
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Juncture server started on port ${this.port}`);
        });
    }
}

export default Juncture;