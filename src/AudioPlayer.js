// src/AudioPlayer.js (CORRIGIDO E ESTÁVEL)
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi'; // Importamos o Midi parser (se já estiver instalado)

// URL de SoundFont mais estável (GitHub pages ou Tone.js assets)
const stableSoundfontUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/29841/FluidR3_GM/'; 

const AudioPlayer = ({ midiBase64 }) => {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const sampler = useRef(null);
  const decodedMidi = useRef(null);

  // --- 1. Inicialização (Carrega o SoundFont, mas não toca) ---
  useEffect(() => {
    // Para evitar que a função seja executada várias vezes
    if (sampler.current) return; 

    setLoading(true);
    
    // Cria o sintetizador (Sampler)
    const newSampler = new Tone.Sampler({
      urls: {
        C4: "piano_c4.mp3", // Tocaríamos um sample de piano C4
      },
      baseUrl: stableSoundfontUrl, 
      onload: () => {
        sampler.current = newSampler;
        sampler.current.toDestination();
        setLoading(false);
        setReady(true);
      },
      onerror: (e) => {
        console.error("Erro ao carregar o SoundFont:", e);
        setError("Falha ao carregar sons do piano. Verifique o URL do SoundFont.");
        setLoading(false);
      }
    });

    // Função para decodificar o MIDI Base64 APÓS O LOAD
    if (midiBase64) {
      try {
        const xmlBytes = atob(midiBase64);
        // O ideal é usar uma biblioteca como 'js-midi-parser' para processar,
        // mas por enquanto, apenas salvamos a string decodificada.
        decodedMidi.current = xmlBytes; 
      } catch (e) {
        setError("Falha na decodificação MIDI.");
        console.error(e);
      }
    }
    
    return () => {
        if (sampler.current) sampler.current.dispose();
    };
  }, [midiBase64]);


  // --- 2. Função de Play (Acionada pelo Clique) ---
  const playComposition = async () => {
    if (loading || !ready) return;
    
    try {
        // CORREÇÃO DO ERRO DE SEGURANÇA: Inicia o contexto DEPOIS do clique do usuário
        await Tone.start(); 
        
        // **NOTA:** A lógica real para ler e agendar o MIDI precisaria de um parser MIDI.
        // Como o parser não está instalado, faremos o teste funcional do sintetizador.
        
        if (sampler.current) {
             sampler.current.triggerAttackRelease("C4", "2n"); 
             alert("Sintetizador OK! Áudio C4 reproduzido. Agora a API precisa de um parser MIDI.");
        }

    } catch (error) {
        setError("Erro ao iniciar o áudio: Verifique permissões do navegador.");
        console.error("Erro fatal no áudio:", error);
    }
  };


  // --- 3. Renderização Segura ---
  if (error) {
    return <p style={{ color: 'red' }}>Erro de Áudio: {error}</p>;
  }

  if (loading) {
    return <button disabled>Carregando Sons...</button>;
  }
  
  return (
    <div className="audio-player-controls">
      <button 
        onClick={playComposition} 
        className="play-button" 
        disabled={!midiBase64}
        style={{ width: '100%', backgroundColor: ready ? '#1a73e8' : '#888' }}
      >
        ▶ Tocar Composição (Sintetizador)
      </button>
    </div>
  );
};

export default AudioPlayer;