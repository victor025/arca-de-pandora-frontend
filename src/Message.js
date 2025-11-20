import React from 'react';
import ScoreRenderer from './ScoreRenderer';
import AudioPlayer from './AudioPlayer';

const createDownloadLink = (base64Data, filename, mimeType) => {
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return (
    <a key={filename} href={dataUri} download={filename} className="download-link" target="_blank" rel="noreferrer">
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
        {text}
        
        {/* ÁUDIO */}
        {midi_base64 && (
          <div className="audio-player-section" style={{marginTop: '10px'}}>
            <AudioPlayer midiBase64={midi_base64} /> 
          </div>
        )}
        
        {/* PARTITURA VISUAL */}
        {musicxml_base64 && (
          <div className="partitura-display">
            <ScoreRenderer musicxml_base64={musicxml_base64} />
          </div>
        )}

        {/* DOWNLOADS */}
        {showDownloads && (
          <div className="download-section">
            <h4 style={{marginTop: '10px', marginBottom: '5px', fontSize: '0.9em'}}>Downloads:</h4>
            <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                {musicxml_base64 && createDownloadLink(musicxml_base64, 'Partitura.xml', 'application/vnd.musicxml')}
                {midi_base64 && createDownloadLink(midi_base64, 'Audio.mid', 'audio/midi')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;