import React, { useState, useRef } from "react";

const AudioPlayer: React.FC = () => {
  const [isFileSelected, setIsFileSelected] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      );

      // Stop any previously playing source
      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      // Create a new buffer source node
      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = audioBuffer;
      sourceRef.current.connect(audioContextRef.current.destination);

      setIsFileSelected(true);
    }
  };

  const handlePlay = () => {
    if (sourceRef.current) {
      sourceRef.current.start();
      setIsFileSelected(false); // Disable play button after playback starts
    }
  };

  const handleStop = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      setIsFileSelected(true);
    }
  };

  return (
    <div>
      <h1>Audio Player</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handlePlay} disabled={!isFileSelected}>
        Play
      </button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
};

export default AudioPlayer;
