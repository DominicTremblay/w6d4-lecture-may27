import React from 'react';
import PropTypes from 'prop-types';
import Message from './Message.jsx';
import Notification from './Notification.jsx';

// Returns a Message or Notification component according to the
// type of message. Using a switch statement to return the right component

const getMsgComponent = ({ id, username, content, type }) => {
  switch (type) {
    case 'meMessage':
      return (
        <Message
          key={id}
          username={username}
          content={content}
          styling="italic"
        />
      );
      break;
    case 'shrugMessage':
      return (
        <Message
          key={id}
          username={username}
          content={`${content} ¯\\_(ツ)_/¯`}
        />
      );
      break;
    case 'pokeMessage':
      return (
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
      );
      break;
    case 'gifMessage':
      return (
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
      );
      break;

    default:
      return <Notification key={id} content={content} />;
  }
};

// Creating an array of components. Each component is customized according
// to the type of message. Executing getMsgComponent to retrieve the right component

const MessageList = ({ messages }) => {
  const msgComponents = messages.map(msgObj => getMsgComponent(msgObj));

  return <main className="messages">{msgComponents}</main>;
};

// Doing type checking on the props
MessageList.propTypes = {
  messages: PropTypes.array,
};

export default MessageList;
