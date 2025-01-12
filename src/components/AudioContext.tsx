// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useRef,
// } from "react";

// // Define the context type
// interface AudioContextProviderProps {
//   children: ReactNode;
// }

// interface AudioContextValue {
//   audioContext: AudioContext | null;
//   nodes: Map<string, AudioNode>;
// }

// // Create the context
// const AudioContextContext = createContext<AudioContextValue | undefined>(
//   undefined
// );

// // AudioContextProvider implementation
// export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({
//   children,
// }) => {
//   const audioContextRef = useRef<AudioContext | null>(null);

//   const [nodes] = useState<Map<string, AudioNode>>(new Map());

//   useEffect(() => {
//     if (!audioContextRef.current) {
//       console.log("creating audio context");
//       audioContextRef.current = new (window.AudioContext ||
//         window.webkitAudioContext)();

//       setValue({
//         audioContext: audioContextRef.current,
//         nodes,
//       });
//     }
//   }, [nodes]);

//   const [value, setValue] = useState<AudioContextValue>({
//     audioContext: audioContextRef.current,
//     nodes,
//   });

//   return (
//     <AudioContextContext.Provider value={value}>
//       {audioContextRef.current ? children : null}
//     </AudioContextContext.Provider>
//   );
// };

// export const useAudioNodes = (): Map<string, AudioNode> => {
//   const context = useContext(AudioContextContext);
//   if (!context) {
//     throw new Error(
//       "useAudioNodes must be used within an AudioContextProvider"
//     );
//   }

//   return context.nodes;
// };

// // Custom hook for consuming the context
// export const useAudioContext = (): AudioContext => {
//   const context = useContext(AudioContextContext);
//   if (!context?.audioContext) {
//     throw new Error(
//       "useAudioContext must be used within an AudioContextProvider"
//     );
//   }
//   return context.audioContext;
// };
