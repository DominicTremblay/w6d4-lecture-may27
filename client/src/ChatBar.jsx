import React from 'react';
import PropTypes from 'prop-types';

const ChatBar = props => {
  const handleKeyDown = e => {
    const commitKey = e.key === 'Enter' || e.key === 'Tab';
    const content = e.target.value;
    const inputType = e.target.name;
    const sameUsername = content === props.username;
    const emptyContent = content === '';
    const sendMessage = commitKey && inputType === 'message' && !emptyContent;
    const updateUser = commitKey && inputType === 'username' && !sameUsername;

    const updateFcts = {
      username: props.updateUser,
      message: props.sendMessage,
    };

    if (sendMessage) {
      props.sendMessage(content);
      e.target.value = '';
    } else if (updateUser) {
      props.updateUser(content);
    }
  };

  const { username } = props;

  const anonymous = new RegExp(/anonymous/i);

  const isAnonymous = username.match(anonymous) ? '' : username;

  return (
    <footer className="chatbar">
      <input
        className="chatbar-username"
        name="username"
        placeholder="Your Name (Optional)"
        defaultValue={isAnonymous}
        onKeyDown={handleKeyDown}
      />
      <input
        className="chatbar-message"
        name="message"
        placeholder="Type a message and hit ENTER"
        onKeyDown={handleKeyDown}
      />
    </footer>
  );
};

ChatBar.propTypes = {
  username: PropTypes.string,
  sendMessage: PropTypes.func,
};

export default ChatBar;
