// src/ScoreRenderer.js
import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

function ScoreRenderer({ musicxml_base64 }) {
  const osmdContainer = useRef(null);
  const osmdInstance = useRef(null);

  // Função para decodificar o Base64 para a string XML
  const decodeXML = (base64String) => {
    try {
      // 'atob' é a função do navegador que decodifica Base64
      return atob(base64String);
    } catch (e) {
      console.error('Erro ao decodificar Base64:', e);
      return null;
    }
  };

  useEffect(() => {
    if (musicxml_base64 && osmdContainer.current) {
      const xmlString = decodeXML(musicxml_base64);

      if (!xmlString) return;

      // Inicializa o OSMD
      osmdInstance.current = new OpenSheetMusicDisplay(osmdContainer.current, {
        autoResize: true,
        drawTitle: true,
        backend: 'svg', // Renderiza como SVG, que é nítido
        drawPartNames: false, // Desativa os nomes de pauta (Instr. Pc818...)
        drawPartAbbreviations: false, // Desativa a abreviação do nome de pauta
      });

      // Carrega e renderiza o XML
      osmdInstance.current
        .load(xmlString)
        .then(() => {
          osmdInstance.current.render();
        })
        .catch((e) => {
          console.error('Erro ao renderizar no OSMD:', e);
        });
    }

    // Limpa a instância ao desmontar o componente
    return () => {
      if (osmdInstance.current) {
        osmdInstance.current.clear();
      }
    };
  }, [musicxml_base64]); // Re-renderiza se o XML mudar

  // O 'div' onde a partitura será desenhada
  return <div ref={osmdContainer} style={{ backgroundColor: 'white', padding: '10px' }} />;
}

export default ScoreRenderer;