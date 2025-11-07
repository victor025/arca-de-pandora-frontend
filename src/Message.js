// src/Message.js
import React from 'react';
import ScoreRenderer from './ScoreRenderer'; // Importe o novo componente

function Message({ sender, text, musicxml_base64, initial }) {
  const messageClass = sender === 'user' ? 'user' : 'ai';

  return (
    <div className={`message-wrapper ${messageClass}`}>
      <div className={`message-content ${initial ? 'initial-message' : ''}`}>
        {/* O texto da explicação */}
        {text}
        
        {/* SE A MENSAGEM TIVER O XML, RENDERIZE A PARTITURA! */}
        {musicxml_base64 && (
          <div className="partitura-display">
            <ScoreRenderer musicxml_base64={musicxml_base64} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;