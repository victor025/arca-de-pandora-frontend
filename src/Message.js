import React from 'react';
import ScoreRenderer from './ScoreRenderer'; // Componente que desenha a partitura
import AudioPlayer from './AudioPlayer'; // <-- IMPORTAÇÃO DO NOVO SINTETIZADOR

// Função auxiliar para criar o link de download a partir da string Base64
const createDownloadLink = (base64Data, filename, mimeType) => {
  // A string Base64 é prefixada com o MIME type para ser um Data URI válido
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

// Certifique-se de que ele não usa nenhuma variável de memória
function Message({ sender, text, musicxml_base64, png_base64, midi_base64, initial }) {
  const messageClass = sender === 'user' ? 'user' : 'ai';
  
  // Condição para mostrar os botões de download e a seção de partitura
  const showDownloads = musicxml_base64 || png_base64 || midi_base64; 
  
  return (
    <div className={`message-wrapper ${messageClass}`}>
      <div className={`message-content ${initial ? 'initial-message' : ''}`}>
        {/* O texto da explicação */}
        {text}
        
        {/* PLAYER DE ÁUDIO MIDI (NOVO BLOCO - Componente AudioPlayer) */}
        {midi_base64 && (
          <div className="audio-player-section">
            <h4>Reprodução de Áudio:</h4>
            {/* AGORA USAMOS O COMPONENTE CUSTOMIZADO QUE USARÁ O TONE.JS */}
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
            
            {/* Link de Download do MUSICXML */}
            {musicxml_base64 && createDownloadLink(
                musicxml_base64, 
                'ArcaDePandora_Partitura.xml', 
                'application/vnd.musicxml'
            )}

            {/* Link de Download do MIDI */}
            {midi_base64 && createDownloadLink( 
                midi_base64, 
                'ArcaDePandora_Audio.mid', 
                'audio/midi' 
            )}
            
            {/* Link de Download do PNG */}
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