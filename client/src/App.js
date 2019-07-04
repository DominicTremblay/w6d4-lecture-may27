import React, { Component } from 'react';
import './App.css';

import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx';
import ChatBar from './ChatBar.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: { name: '', color: 'black' },
      messages: [],
    };

    this.socketServer = new WebSocket('ws://localhost:3001');
  }

  handleOnMessage = evt => {
    const incomingMessage = JSON.parse(evt.data);

    switch (incomingMessage.type) {
      case 'clientInfo':
        // Updates client info
        break;

      default:
        this.updateMessages(incomingMessage);
    }
  };

  componentDidMount() {
    this.socketServer.onopen = e => {
      console.log('Client connected to socket server');
    };

    this.socketServer.onmessage = this.handleOnMessage;
  }

  updateMessages = newMessage => {
    const messageList = [...this.state.messages, newMessage];
    this.setState({ messages: messageList });
  };

  sendMessage = message => {
    const newMessage = {
      type: 'postMessage',
      username: this.state.currentUser.name,
      content: message,
    };
    this.socketServer.send(JSON.stringify(newMessage));
  };

  render() {
    return (
      <div>
        <NavBar username={this.state.currentUser.name} />
        <MessageList messages={this.state.messages} />
        <ChatBar
          username={this.state.currentUser.name}
          sendMessage={this.sendMessage}
          updateUser={this.updateUser}
        />
      </div>
    );
  }
}
export default App;
