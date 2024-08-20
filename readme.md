# Juncture Server

Juncture Server is a TypeScript module that bridges React with Node.js applications, providing graphical user interfaces for Node.js apps. It works in conjunction with the juncture-bridge library to enable seamless communication between frontend and backend.

## Features

- Easy integration with Express server
- Real-time communication using Socket.IO
- TypeScript support
- Can be used in both JavaScript and TypeScript projects
- Supports both import and require syntax
- Seamless integration with React via juncture-bridge

## Installation

```bash
npm install juncture-server
```

For React integration, also install juncture-bridge:

```bash
npm install juncture-bridge
```

## Basic Usage

### Setting Up the Server with Default State

You can initialize Juncture with a default state and configuration. Here's an example:

```javascript
import Juncture from 'juncture-server';

let defaultState = {
    counter: 0,
    message: ""
}

const app = new Juncture(3000, defaultState);

const bridge = app.bridge;

// Backend (Node.js)

// Simple command handler
bridge.registerHandler('greet', async (args) => {
  const greeting = `Hello, ${args.name}!`;
  app.setState({ ...app.getState(), message: greeting });
  return greeting;
});

// Stream example
bridge.registerHandler('count', async (args) => {
  const { countTo } = args;
  for (let i = 1; i <= countTo; i++) {
    app.setState({ ...app.getState(), counter: i });
    bridge.broadcast('counterUpdate', i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return 'Counting completed!';
});

app.start();
```

This setup allows you to define a default state and use it in your handlers. The handlers demonstrate how the state is updated and used.

### Frontend (React)

First, create a bridge instance:

```javascript
// utils/bridge.js
import ReactBridge from "juncture-bridge";

const bridge = new ReactBridge("http://localhost:3000");
export default bridge;
```

Then, use the bridge in your React components:

```jsx
import React, { useState, useEffect } from 'react';
import bridge from "../utils/bridge";

function App() {
  const [message, setMessage] = useState('');
  const [counter, setCounter] = useState(0);

  const handleGreeting = () => {
    bridge.execute("greet", { name: "World" })
      .then(setMessage)
      .catch(console.error);
  };

  const handleCounting = () => {
    bridge.execute("count", { countTo: 5 })
      .then(console.log)
      .catch(console.error);
  };

  useEffect(() => {
    bridge.on("counterUpdate", (data) => {
      setCounter(data);
    });

    bridge.on("stateUpdate", (newState) => {
      setMessage(newState.message);
      setCounter(newState.counter);
    });

    return () => {
      bridge.off("counterUpdate");
      bridge.off("stateUpdate");
    };
  }, []);

  return (
    <div>
      <button onClick={handleGreeting}>Greet</button>
      <p>{message}</p>
      <button onClick={handleCounting}>Start Counting</button>
      <p>Current count: {counter}</p>
    </div>
  );
}

export default App;
```

## API

### `Juncture`

#### Constructor

```typescript
new Juncture(port?: number, defaultState?: any, config?: Partial<JunctureConfig>)
```

- `port`: The port the server will run on (default: 3000)
- `defaultState`: Initial state (default: {})
- `config`: Configuration options

#### Methods

- `start()`: Starts the server
- `setState(newState: any)`: Updates the state
- `getState()`: Returns the current state

### `ExpressBridge`

#### Methods

- `registerHandler(command: string, handler: (args: any) => Promise<any>)`: Registers a new command handler
- `broadcast(event: string, data: any)`: Broadcasts an event to all connected clients

### `ReactBridge` (from juncture-bridge)

#### Constructor

```typescript
new ReactBridge(url: string)
```

- `url`: URL of the Juncture server

#### Methods

- `execute(command: string, args: any): Promise<any>`: Executes a command on the server
- `on(event: string, callback: (data: any) => void)`: Listens for an event
- `off(event: string)`: Stops listening for an event

## License

MIT
