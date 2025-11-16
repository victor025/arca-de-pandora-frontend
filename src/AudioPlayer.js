// src/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi'; // Importa o leitor de MIDI

const AudioPlayer = ({ midiBase64 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Usamos 'useRef' para manter as instâncias do piano e dos dados MIDI
  const sampler = useRef(null);
  const midiData = useRef(null);

  // Este useEffect carrega o piano E decodifica o MIDI
  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1. Decodifica o MIDI Base64 para um formato que o @tonejs/midi pode ler
    try {
      // Converte Base64 para um Array de Bytes (Uint8Array)
      const binaryString = atob(midiBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Converte o array de bytes em dados MIDI
      midiData.current = new Midi(bytes);
    } catch (e) {
      console.error("Erro ao decodificar o MIDI Base64:", e);
      setError("Falha ao ler o arquivo MIDI.");
      setLoading(false);
      return;
    }

    // 2. Cria o sintetizador (Sampler) com os sons LOCAIS
    const piano = new Tone.Sampler({
      urls: {
        A1: "A1.mp3",
        C4: "C4.mp3",
        A4: "A4.mp3",
        C7: "C7.mp3",
      },
      // Aponta para os samples na sua pasta 'public/'
      // SEM CORS! É O MESMO DOMÍNIO.
      baseUrl: "/samples/piano/", 
      onload: () => {
        sampler.current = piano;
        sampler.current.toDestination();
        setLoading(false);
      },
      onerror: (e) => {
        console.error("Erro ao carregar o SoundFont local:", e);
        setError("Falha ao carregar sons do piano (erro 404).");
        setLoading(false);
      }
    });

    return () => {
      // Limpa o sampler quando o componente é desmontado
      if (sampler.current) sampler.current.dispose();
    };
  }, [midiBase64]); // Este hook roda toda vez que um NOVO midi_base64 é recebido

  // 3. Função de Play (Acionada pelo Clique)
  const playComposition = async () => {
    if (loading || error || !midiData.current || !sampler.current) return;
    
    try {
      await Tone.start(); // Inicia o áudio (exigido pelo navegador)
      
      const now = Tone.now();
      
      // Itera sobre as notas do arquivo MIDI e as agenda
      midiData.current.tracks.forEach(track => {
        track.notes.forEach(note => {
          sampler.current.triggerAttackRelease(
            note.name,        // ex: "C4"
            note.duration,    // ex: 0.5
            now + note.time   // O tempo exato na música
          );
        });
      });

    } catch (error) {
      setError("Erro ao tocar a síntese MIDI.");
      console.error("Erro no play do Tone.js:", error);
    }
  };

  // 4. Renderização Segura
  if (error) {
    return <p style={{ color: 'red' }}>Erro de Áudio: {error}</p>;
  }
  
  // O componente só renderiza o botão se o MIDI e o Sampler estiverem prontos
  const ready = !loading && sampler.current && midiData.current;

  return (
    <div className="audio-player-controls">
      <button 
        onClick={playComposition} 
        className="play-button" // Você pode estilizar isso no App.css
        disabled={!ready}
        style={{ width: '100%', backgroundColor: ready ? '#1a73e8' : '#5f6368', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {loading ? 'Carregando Piano...' : '▶ Tocar Áudio'}
      </button>
    </div>
  );
};

export default AudioPlayer;