import React, { useState } from 'react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello!', sender: 'other' },
    { id: 2, text: 'Hi there!', sender: 'me' },
    // Add more messages as needed
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() !== '') {
      setMessages([...messages, { id: messages.length + 1, text: input, sender: 'me' }]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary p-4 rounded-md">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-2 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === 'me' ? 'bg-info text-on-accent' : 'bg-secondary-light text-textprimary'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-1 p-2 rounded-l-lg focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-accent text-on-accent px-4 rounded-r-md hover:bg-accent-hover transition-colors duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
