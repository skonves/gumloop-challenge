import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Controls,
  ControlButton,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import { RunButton } from "./components/RunButton";
import { RunReportPanel } from "./components/RunReportPanel";
import { Logo } from "./components/Logo";
// import { useAudioContext, useAudioNodes } from "./components/AudioContext";
import { SetNodesProvider } from "./components/ChangeHandlerContext";
import { Engine } from "./engine";

export default function App() {
  // const audioContext = useAudioContext();
  // const audioNodes = useAudioNodes();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    return () => {
      if (engine) engine.close();
    };
  }, [engine]);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((edges) => {
        console.log(connection);
        return addEdge(connection, edges);
      }),
    [setEdges]
  );

  const addAudioBufferSource = () => {
    setNodes((nodes) => {
      const id = Math.random().toString(36).substr(2, 9);

      // const audioBufferSource = audioContext.createBufferSource();

      // audioNodes.set(id, audioBufferSource);

      return [
        ...nodes,
        {
          id,
          type: "audio-buffer-source",
          position: { x: 250, y: 250 },
          data: {},
        },
      ];
    });
  };

  const handleRun = useCallback(() => {
    setIsPanelOpen(true);

    const eng = new Engine(nodes, edges);
    eng.run();
    setEngine(eng);
  }, [edges, nodes]);

  return (
    // <AudioPlayer />
    <SetNodesProvider setNodes={setNodes}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Logo />
        <RunButton onRun={handleRun} />
        {!!engine && (
          <RunReportPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            engine={engine}
          />
        )}
        <Controls>
          <ControlButton onClick={addAudioBufferSource}>
            [audio buffer source]
          </ControlButton>
        </Controls>
      </ReactFlow>
    </SetNodesProvider>
  );
}
