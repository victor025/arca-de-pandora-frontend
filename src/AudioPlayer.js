import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi'; 

const AudioPlayer = ({ midiBase64 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sampler = useRef(null);
  const midiData = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // 1. Decodifica o MIDI Base64
      const binaryString = atob(midiBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      midiData.current = new Midi(bytes);
    } catch (e) {
      console.error("Erro MIDI:", e);
      setError("Falha ao ler MIDI.");
      setLoading(false);
      return;
    }

    // 2. Carrega o Piano da pasta LOCAL (/public/samples/piano)
    // O caminho começa com / porque é relativo à raiz do site
    const piano = new Tone.Sampler({
      urls: {
        A1: "A1.mp3",
        C4: "C4.mp3",
        A4: "A4.mp3",
        C7: "C7.mp3",
      },
      baseUrl: "/samples/piano/",  
      onload: () => {
        sampler.current = piano;
        sampler.current.toDestination();
        setLoading(false);
      },
      onerror: (e) => {
        console.error("Erro Sampler:", e);
        setError("Erro ao carregar sons.");
        setLoading(false);
      }
    });

    return () => {
      if (sampler.current) sampler.current.dispose();
    };
  }, [midiBase64]);

  const playComposition = async () => {
    if (loading || error || !midiData.current || !sampler.current) return;
    
    try {
      await Tone.start(); 
      const now = Tone.now();
      
      midiData.current.tracks.forEach(track => {
        track.notes.forEach(note => {
          sampler.current.triggerAttackRelease(
            note.name,
            note.duration,
            now + note.time
          );
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <p style={{color:'red', fontSize:'0.8em'}}>{error}</p>;

  return (
    <div className="audio-player-controls">
      <button 
        onClick={playComposition} 
        className="play-button"
        disabled={loading}
        style={{ 
            width: '100%', 
            backgroundColor: loading ? '#5f6368' : '#1a73e8',
            color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer'
        }}
      >
        {loading ? 'Carregando Piano...' : '▶ Tocar Áudio'}
      </button>
    </div>
  );
};

export default AudioPlayer;