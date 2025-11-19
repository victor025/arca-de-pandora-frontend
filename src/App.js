import React, { useState, useRef, useEffect } from 'react';
import './App.css'; 
import Message from './Message'; 

function App() {
  // 1. Estado unificado de mensagens (Visual + Memória)
  // Começamos com a instrução de sistema para manter o contexto localmente também
  const [messages, setMessages] = useState([
    {
      role: "system", 
      content: "Você é um assistente de composição musical especialista em Teoria Pós-Tonal, Contornos e Schillinger. Sua única função é retornar APENAS um objeto JSON válido." 
    }
  ]);
  
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

    setIsLoading(true);

    // 2. Criar a nova mensagem do usuário
    const newUserMessage = {
      role: "user",
      content: currentInput
    };

    // 3. Criar o histórico COMPLETO (Antigo + Novo) para enviar à API
    const historyToSend = [...messages, newUserMessage];

    // Atualiza a tela imediatamente
    setMessages(historyToSend);
    setCurrentInput(""); 

    try {
      const response = await fetch(
        'https://api.arcadepandora.cloud/webhook/7f60ab7c-a4d7-4b2f-9922-3b16e44d8240', 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // 4. ENVIA O HISTÓRICO COMPLETO (Array)
          // O N8N vai receber isso como body.messages
          body: JSON.stringify({
            messages: historyToSend 
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      // AQUI PODE OCORRER O ERRO DE JSON VAZIO SE O PYTHON FALHAR
      // Vamos tratar como texto primeiro para segurança
      const responseText = await response.text();
      if (!responseText) throw new Error("Resposta vazia do servidor.");
      
      const data = JSON.parse(responseText);

      // 5. Criar a mensagem de resposta da IA
      const modelResponseMessage = {
        role: "model",
        content: data.explanation, // Texto para memória e tela
        musicxml_base64: data.musicxml_base64 || null,
        midi_base64: data.midi_base64 || null,
        png_base64: data.png_base64 || null
      };

      // 6. Adicionar a resposta ao histórico (Memória cresce)
      setMessages([...historyToSend, modelResponseMessage]);

    } catch (error) {
      console.error("Erro:", error);
      setMessages(prev => [...prev, { role: "model", content: `Erro: ${error.message}` }]);
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
          {/* Filtramos a mensagem de 'system' para não aparecer no chat visualmente */}
          {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
            <Message
              key={index}
              sender={msg.role === 'user' ? 'user' : 'ai'}
              text={msg.content}
              musicxml_base64={msg.musicxml_base64}
              midi_base64={msg.midi_base64}
              png_base64={msg.png_base64}
            />
          ))}
          {isLoading && (
            <div className="message-wrapper ai">
              <div className="message-content loading"><span>Gerando...</span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area-wrapper">
          <textarea
            className="input-textarea"
            placeholder="Digite seu comando..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button className="send-button" onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;