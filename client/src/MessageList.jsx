import React from 'react';
import PropTypes from 'prop-types';
import Message from './Message.jsx';
import Notification from './Notification.jsx';

// Returns a Message or Notification component according to the
// type of message. Instead of using a switch statement, the
// function uses an object structure to store all the cases
const getMsgComponent = ({ id, username, content, type }) => {
  const messageTypes = {
    // Return the content in italic
    meMessage: (
      <Message
        key={id}
        username={username}
        content={content}
        styling="italic"
      />
    ),
    // Adds a shrug to the content
    shrugMessage: (
      <Message
        key={id}
        username={username}
        content={`${content} ¯\\_(ツ)_/¯`}
      />
    ),
    // Display a pokemon card
    pokeMessage: (
      <Message
        key={id}
        username={username}
        content={
          <div>
            <div>{content.name}</div>
            <div>
              <img src={content.imageUrl} alt={content.name} />
            </div>
          </div>
        }
      />
    ),
    // Display a gif from Giphy
    gifMessage: (
      <Message
        key={id}
        username={username}
        content={
          <div>
            <div>{content.title}</div>
            <div>
              <img src={content.imageUrl} alt={content.title} />
            </div>
          </div>
        }
      />
    ),
    // If the command is unknown
    errorMessage: <Notification key={id} content={content} />,
  };

  return messageTypes[type];
};

// Creating an array of components. Each component is customized according
// to the type of message. Executing getMsgComponent to retrieve the right component
const MessageList = ({ messages }) => {
  const messageList = messages.map(message => getMsgComponent(message));

  return <main className="messages">{messageList}</main>;
};

// Doing type checking on the props
MessageList.propTypes = {
  messages: PropTypes.array,
};

export default MessageList;
