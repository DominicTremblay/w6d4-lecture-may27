import React from 'react';
import PropTypes from 'prop-types';
import Message from './Message.jsx';
import Notification from './Notification.jsx';

// Returns a Message or Notification component according to the
// type of message. Instead of using a switch statement, the
// function uses an object structure to store all the cases

// Creating an array of components. Each component is customized according
// to the type of message. Executing getMsgComponent to retrieve the right component

// Doing type checking on the props
MessageList.propTypes = {
  messages: PropTypes.array,
};

export default MessageList;
