// src/Message.js (CÓDIGO ATUALIZADO)
import React from 'react';
import ScoreRenderer from './ScoreRenderer'; // O componente que desenha

// Função para criar o link de download a partir da string Base64
const createDownloadLink = (base64Data, filename, mimeType) => {
  // A string Base64 deve ser prefixada com o MIME type para funcionar
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return (
    <a 
      href={dataUri} 
      download={filename} 
      className="download-link"
      target="_blank" // Abre em nova aba para garantir o download
      rel="noopener noreferrer"
    >
      Baixar {filename}
    </a>
  );
};

function Message({ sender, text, musicxml_base64, png_base64, initial }) {
  const messageClass = sender === 'user' ? 'user' : 'ai';
  
  // Condição para mostrar os botões de download (usamos musicxml_base64 como chave)
  const showDownloads = musicxml_base64 || png_base64;

  return (
    <div className={`message-wrapper ${messageClass}`}>
      <div className={`message-content ${initial ? 'initial-message' : ''}`}>
        {/* 1. O texto da explicação */}
        {text}
        
        {/* 2. O RENDERIZADOR VISUAL (usa o MusicXML) */}
        {musicxml_base64 && (
          <div className="partitura-display">
            <ScoreRenderer musicxml_base64={musicxml_base64} />
          </div>
        )}

        {/* 3. A SEÇÃO DE DOWNLOADS */}
        {showDownloads && (
          <div className="download-section">
            <h4>Arquivos para Edição:</h4>
            
            {/* Botão de Download do MUSICXML */}
            {musicxml_base64 && createDownloadLink(
                musicxml_base64, 
                'ArcaDePandora_Partitura.xml', 
                'application/vnd.musicxml' // O MIME Type correto para XML
            )}
            
            {/* Botão de Download do PNG (se você decidir usar o PNG Base64) */}
            {png_base64 && createDownloadLink(
                png_base64, 
                'ArcaDePandora_Visual.png', 
                'image/png'
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Message;