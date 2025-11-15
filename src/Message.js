import React from 'react';
import ScoreRenderer from './ScoreRenderer'; // Componente que desenha a partitura

// Função auxiliar para criar o link de download a partir da string Base64
const createDownloadLink = (base64Data, filename, mimeType) => {
  // A string Base64 é prefixada com o MIME type para ser um Data URI válido
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return (
    <a 
      key={filename} // Adiciona uma chave para o React
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
function Message({ sender, text, musicxml_base64, png_base64, midi_base64, initial }) { // <-- ATUALIZADO: Adiciona midi_base64
  const messageClass = sender === 'user' ? 'user' : 'ai';
  
  // Condição para mostrar os botões de download e a seção de partitura
  const showDownloads = musicxml_base64 || png_base64 || midi_base64;

  // Cria o URI de dados para o elemento <audio>
  const midiDataUri = midi_base64 ? `data:audio/midi;base64,${midi_base64}` : null;
  
  return (
    <div className={`message-wrapper ${messageClass}`}>
      <div className={`message-content ${initial ? 'initial-message' : ''}`}>
        {/* O texto da explicação */}
        {text}
        
        {/* PLAYER DE ÁUDIO MIDI (NOVO BLOCO) */}
        {midiDataUri && (
          <div className="audio-player-section">
            <h4>Reprodução de Áudio:</h4>
            {/* O elemento <audio> nativo do HTML com a fonte Base64 */}
            <audio controls src={midiDataUri} style={{ width: '100%' }}>
              Seu navegador não suporta a reprodução de MIDI.
            </audio>
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
            <h4>Arquivos para Download:</h4>
            
            {/* Link de Download do MUSICXML */}
            {musicxml_base64 && createDownloadLink(
                musicxml_base64, 
                'ArcaDePandora_Partitura.xml', 
                'application/vnd.musicxml' // O MIME Type correto
            )}

            {/* Link de Download do MIDI */}
            {midi_base64 && createDownloadLink(
                midi_base64, 
                'ArcaDePandora_Audio.mid', 
                'audio/midi' // O MIME Type para MIDI
            )}
            
            {/* Link de Download do PNG (se você decidir implementá-lo no futuro) */}
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