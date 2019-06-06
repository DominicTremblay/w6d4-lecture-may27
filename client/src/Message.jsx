import React from 'react';

const Message = props => {
  const { username, content, styling } = props;
  return (
    <div className="message">
      <span className="message-username">{username}</span>
      <span className="message-content" style={{ fontStyle: styling }}>
        {content}
      </span>
    </div>
  );
};

export default Message;
