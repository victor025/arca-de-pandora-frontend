import React, { useState, useRef, useEffect } from 'react';
import './App.css'; // Importa os estilos
import Message from './Message'; // Componente para exibir mensagens

function App() {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentInput.trim() === '') return;

    const userMessage = { text: currentInput, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // ESTE É O URL DE PRODUÇÃO DO SEU N8N
      // (Você precisa colar o seu "Production URL" do Webhook aqui)
      const response = await fetch(
        'https://api.arcadepandora.cloud/webhook/7f60ab7c-a4d7-4b2f-9922-3b16e44d8240', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: userMessage.text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json(); // N8N envia a resposta final

      // Agora pegamos a explicação E o MusicXML
      const aiResponse = {
        text: data.explanation || 'Não foi possível gerar uma explicação.',
        musicxml_base64: data.musicxml_base64 || null, // A partitura
        sender: 'ai',
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);

    } catch (error) {
      console.error('Erro ao comunicar com o N8N:', error);
      setMessages(prevMessages => [...prevMessages, { text: `Ocorreu um erro: ${error.message}`, sender: 'ai' }]);
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
          <Message
            sender="ai"
            text="Olá! Eu sou a Arca de Pandora. Me dê um comando de composição."
            initial={true}
          />
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender={msg.sender}
              text={msg.text}
              musicxml_base64={msg.musicxml_base64} // Passa o XML para a mensagem
            />
          ))}
          {isLoading && (
            <div className="message-wrapper ai">
              <div className="message-content loading">
                <span>Gerando música...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* A área de input (prompter) */}
        <div className="input-area-wrapper">
          <textarea
            className="input-textarea"
            placeholder={isLoading ? "Aguarde..." : "Digite seu comando aqui..."}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isLoading || currentInput.trim() === ''}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;