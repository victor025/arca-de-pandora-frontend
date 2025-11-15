// src/AudioPlayer.js (CÓDIGO CORRIGIDO E FINAL)
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
// O import do 'Midi' foi removido para evitar erros de dependência

// URL de SoundFont que você criou no seu domínio
const soundfontUrl = 'https://audio.arcadepandora.cloud/acoustic_grand_piano/';

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
        // Assume que o sample de C4 está disponível no baseUrl
        C4: "C4.mp3", 
      },
      // CORREÇÃO: Usando a variável 'soundfontUrl' corretamente
      baseUrl: soundfontUrl, 
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
    
    // Decodifica o MIDI Base64 para uso futuro
    if (midiBase64) {
      try {
        const xmlBytes = atob(midiBase64);
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
        
        if (sampler.current) {
             // Toca a nota de teste
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
        ▶ Tocar Composição (C4 Teste)
      </button>
    </div>
  );
};

export default AudioPlayer;