import React, { useState, useRef, useEffect } from 'react';
import './App.css'; 
import Message from './Message'; 
import { v4 as uuidv4 } from 'uuid'; // Gera o ID único

function App() {
  // Mensagem inicial visual
  const [messages, setMessages] = useState([
    {
      sender: 'ai', 
      text: "Olá! Sou a Arca de Pandora. Digite um comando (ex: 'Crie uma melodia')." 
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Gera um ID de sessão único quando a página carrega.
  // O N8N usará isso para lembrar da conversa deste usuário específico.
  const [sessionId] = useState(uuidv4()); 
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentInput.trim() === '') return;

    const userMessage = { text: currentInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        // ATUALIZE ESTA LINHA COM O SEU NOVO URL:
        'https://api.arcadepandora.cloud/webhook/27f6fde4-3853-4997-991a-947a50e3fc30', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // O payload continua o mesmo (prompt + sessionId)
          body: JSON.stringify({ 
            prompt: userMessage.text,
            sessionId: sessionId 
          }), 
        }
      );

      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

      const responseText = await response.text();
      if (!responseText) throw new Error("Resposta vazia do servidor.");
      
      const data = JSON.parse(responseText);

      const aiResponse = {
        text: data.explanation || 'Sem explicação.',
        musicxml_base64: data.musicxml_base64 || null,
        midi_base64: data.midi_base64 || null,
        png_base64: data.png_base64 || null,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Erro:', error);
      setMessages(prev => [...prev, { text: `Erro: ${error.message}`, sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender={msg.sender}
              text={msg.text}
              musicxml_base64={msg.musicxml_base64}
              midi_base64={msg.midi_base64}
              png_base64={msg.png_base64}
            />
          ))}
          {isLoading && (
            <div className="message-wrapper ai"><div className="message-content loading"><span>Compondo...</span></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area-wrapper">
          <textarea
            className="input-textarea"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button className="send-button" onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default App;