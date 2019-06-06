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

  updateUser = username => {
    const oldUsername = this.state.currentUser.name;
    this.setState({ currentUser: { name: username } });
    this.sendNotification(oldUsername, username);
  };

  handleOnMessage = evt => {
    const incomingMessage = JSON.parse(evt.data);

    switch (incomingMessage.type) {
      case 'clientInfo':
        this.updateUser(incomingMessage.username);
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

  sendNotification = (oldUsername, newUsername) => {
    const newNotification = {
      type: 'postNotification',
      content: `${oldUsername} has changed their name to ${newUsername}`,
    };
    this.socketServer.send(JSON.stringify(newNotification));
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
