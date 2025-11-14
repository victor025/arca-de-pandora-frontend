import React, { useState, useRef, useEffect } from 'react';
import './App.css'; // Importa os estilos
import Message from './Message'; // Componente para exibir mensagens

function App() {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // NOVO ESTADO: Armazena o histórico da conversa no formato que o Gemini entende (role/content)
  // const [chatHistory, setChatHistory] = useState([]); 
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentInput.trim() === '') return;

    // 1. Mensagens para a Interface Visual
    const userMessageVisual = { text: currentInput, sender: 'user' };
    
    // 2. Mensagem do Usuário no formato que a API espera (para a Memória)
    const userMessageForAPI = { 
        role: "user", 
        content: currentInput 
    };

    setMessages(prevMessages => [...prevMessages, userMessageVisual]);
    setCurrentInput('');
    setIsLoading(true);

    // 3. CONSTRÓI O PAYLOAD: Junta o histórico anterior com a nova pergunta
    const payload = {
        messages: [...chatHistory, userMessageForAPI] // Envia o array de mensagens completo
    };


    try {
      const response = await fetch(
        // ATENÇÃO: Use o seu Production URL aqui
        'https://api.arcadepandora.cloud/webhook/7f60ab7c-a4d7-4b2f-9922-3b16e44d8240', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // 4. ENVIA O ARRAY DE MENSAGENS COMPLETO
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json(); // N8N envia a resposta final

      // 5. Resposta da IA para a Interface Visual
      const aiResponseVisual = {
        text: data.explanation || 'Não foi possível gerar uma explicação.',
        musicxml_base64: data.musicxml_base64 || null,
        png_base64: data.png_base64 || null,
        sender: 'ai',
      };
      
      // 6. Resposta da IA para a Memória (Armazena a explicação para contexto futuro)
      const aiResponseForAPI = {
          role: "model", 
          content: data.explanation // A IA usará este texto como contexto
      };
      
      // 7. ATUALIZA A MEMÓRIA: Adiciona a pergunta e a resposta à memória
      setChatHistory(prevHistory => [...prevHistory, userMessageForAPI, aiResponseForAPI]);
      setMessages(prevMessages => [...prevMessages, aiResponseVisual]);

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
              musicxml_base64={msg.musicxml_base64}
              png_base64={msg.png_base64}
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