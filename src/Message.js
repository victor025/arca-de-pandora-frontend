// src/Message.js
import React from 'react';
import ScoreRenderer from './ScoreRenderer';
import AudioPlayer from './AudioPlayer'; // <--- IMPORTA O NOVO PLAYER

// (A função createDownloadLink permanece a mesma)
const createDownloadLink = (base64Data, filename, mimeType) => {
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return (
    <a 
      key={filename} 
      href={dataUri} 
      download={filename} 
      className="download-link"
      target="_blank" 
      rel="noopener noreferrer"
    >
      Baixar {filename}
    </a>
  );
};

function Message({ sender, text, musicxml_base64, png_base64, midi_base64, initial }) {
  const messageClass = sender === 'user' ? 'user' : 'ai';
  const showDownloads = musicxml_base64 || png_base64 || midi_base64; 

  return (
    <div className={`message-wrapper ${messageClass}`}>
      <div className={`message-content ${initial ? 'initial-message' : ''}`}>
        {/* O texto da explicação */}
        {text}
        
        {/* PLAYER DE ÁUDIO MIDI (SUBSTITUÍDO) */}
        {midi_base64 && (
          <div className="audio-player-section">
            <h4>Reprodução de Áudio:</h4>
            {/* AGORA USAMOS O COMPONENTE CUSTOMIZADO */}
            <AudioPlayer midiBase64={midi_base64} /> 
          </div>
        )}
        
        {/* O RENDERIZADOR VISUAL (usa o MusicXML) */}
        {musicxml_base64 && (
          <div className="partitura-display">
            <ScoreRenderer musicxml_base64={musicxml_base64} />
          </div>
        )}

        {/* A SEÇÃO DE DOWNLOADS */}
        {showDownloads && (
          <div className="download-section">
            <h4>Arquivos:</h4>
            
            {musicxml_base64 && createDownloadLink(
                musicxml_base64, 
                'ArcaDePandora_Partitura.xml', 
                'application/vnd.musicxml'
            )}

            {midi_base64 && createDownloadLink(
                midi_base64, 
                'ArcaDePandora_Audio.mid', 
                'audio/midi' 
            )}
            
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