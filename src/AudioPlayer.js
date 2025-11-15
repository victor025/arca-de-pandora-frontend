// src/AudioPlayer.js (CORRIGIDO)
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

const soundfontUrl = 'https://dood.space/audio/sfz-assets/salamander/'; 

const AudioPlayer = ({ midiBase64 }) => {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  
  const sampler = useRef(null);

  // --- 1. Carregar o Sampler (Motor de Áudio) Apenas Uma Vez ---
  useEffect(() => {
    // Esta função carrega o SoundFont quando o componente é montado
    const initializeAudio = async () => {
      try {
        await Tone.start(); // Inicia o contexto de áudio
        
        // Cria o sintetizador (Sampler)
        const newSampler = new Tone.Sampler({
          urls: {
            C4: "C4.mp3", // Tocaríamos um sample de piano C4
          },
          baseUrl: soundfontUrl, // URL onde os samples estão
          onload: () => {
            sampler.current = newSampler;
            setLoading(false);
            setReady(true);
          },
          onerror: (e) => {
            console.error("Erro ao carregar o SoundFont:", e);
            setError("Falha ao carregar o som. Verifique a conexão.");
            setLoading(false);
          }
        }).toDestination();
        
      } catch (e) {
        setError("Falha ao iniciar o contexto de áudio do navegador.");
        setLoading(false);
      }
    };
    
    initializeAudio();

    // Cleanup function
    return () => {
      if (sampler.current) {
        sampler.current.dispose();
      }
    };
  }, []);

  // --- 2. Função de Play (Executada pelo botão) ---
  const playComposition = () => {
    if (ready && sampler.current) {
      // **A LÓGICA DE MIDI PARSE REAL ENTRARIA AQUI**
      // Por enquanto, tocamos uma nota simples para provar que a infraestrutura está viva.
      sampler.current.triggerAttackRelease("C4", "2n"); 
    }
  };


  // --- 3. Renderização Segura ---
  if (error) {
    return <p style={{ color: 'red' }}>Erro de Áudio: {error}</p>;
  }

  if (loading) {
    return <button disabled>Carregando Sons...</button>;
  }
  
  // O componente só renderiza o botão se estiver pronto
  return (
    <div className="audio-player-controls">
      <button 
        onClick={playComposition} 
        className="play-button" 
        disabled={!midiBase64}
        style={{ width: '100%' }}
      >
        {ready ? '▶ Tocar Composição (C4 Teste)' : 'Aguarde...'}
      </button>
    </div>
  );
};

export default AudioPlayer;