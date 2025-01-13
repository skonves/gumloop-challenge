import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Controls,
  Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import { RunButton } from "./components/RunButton";
import { RunReportPanel } from "./components/RunReportPanel";
import { Logo } from "./components/Logo";
import { SetNodesProvider } from "./components/ChangeHandlerContext";
import { Engine } from "./engine";
import { Button } from "./components/Inputs";
import { AppNode } from "./nodes/types";

type State = {
  nodes: AppNode[];
  edges: Edge[];
};

function decodeState(hash: string): State | undefined {
  if (!hash) return undefined;

  try {
    return JSON.parse(atob(hash));
  } catch (e) {
    return undefined;
  }
}

function getState(): State {
  const hashState = decodeState(window.location.hash.slice(1));
  if (hashState) return hashState;

  const localNodes = sessionStorage.getItem("nodes");
  const localEdges = sessionStorage.getItem("edges");

  return {
    nodes: localNodes ? (JSON.parse(localNodes) as AppNode[]) : initialNodes,
    edges: localEdges ? JSON.parse(localEdges) : initialEdges,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function id() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(getState().nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(getState().edges);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const state: State = useMemo(() => ({ nodes, edges }), [nodes, edges]);
  const debouncedState = useDebounce(state, 500);

  useEffect(() => {
    console.log("debouncedState", debouncedState);

    const hash = btoa(JSON.stringify(debouncedState));

    console.log("state", hash);

    const url = new URL(window.location.href);
    url.hash = hash;
    history.replaceState(null, "", url);

    sessionStorage.setItem("nodes", JSON.stringify(debouncedState.nodes));
    sessionStorage.setItem("edges", JSON.stringify(debouncedState.edges));

    // TODO: save to local storage
  }, [debouncedState]);

  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    return () => {
      if (engine) engine.close();
    };
  }, [engine]);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((edges) => {
        return addEdge(connection, edges);
      }),
    [setEdges]
  );

  const handleReset = () => {
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(null, "", url);

    sessionStorage.removeItem("nodes");
    sessionStorage.removeItem("edges");

    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  const loadSimple = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxNjYsInkiOjE5M30sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJldDd2bWZ5azQiLCJ0eXBlIjoiYXVkaW8tYnVmZmVyLXNvdXJjZSIsInBvc2l0aW9uIjp7IngiOjEwNSwieSI6LTg5LjV9LCJkYXRhIjp7ImZpbGUiOnt9fSwibWVhc3VyZWQiOnsid2lkdGgiOjQ4MSwiaGVpZ2h0IjoyMDB9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX1dLCJlZGdlcyI6W3sic291cmNlIjoiZXQ3dm1meWs0Iiwic291cmNlSGFuZGxlIjoiZXQ3dm1meWs0LW91dCIsInRhcmdldCI6ImRlc3RpbmF0aW9uIiwidGFyZ2V0SGFuZGxlIjoiZGVzdGluYXRpb24taW4iLCJpZCI6Inh5LWVkZ2VfX2V0N3ZtZnlrNGV0N3ZtZnlrNC1vdXQtZGVzdGluYXRpb25kZXN0aW5hdGlvbi1pbiJ9XX0"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadReverb = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMDAsInkiOjEwMH0sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fX0seyJpZCI6IjZnbDdsc3U1cCIsInR5cGUiOiJhdWRpby1idWZmZXItc291cmNlIiwicG9zaXRpb24iOnsieCI6LTE0Ni41MTQwOTUxNTI0MDI2LCJ5IjotNTE1Ljc2MzQ5MTAyNzgyMTh9LCJkYXRhIjp7ImZpbGUiOnt9fSwibWVhc3VyZWQiOnsid2lkdGgiOjQ4MSwiaGVpZ2h0IjoyMDB9LCJzZWxlY3RlZCI6dHJ1ZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoiaTJ0Njg1NjVxIiwidHlwZSI6ImdhaW4iLCJwb3NpdGlvbiI6eyJ4Ijo1MjUuMDc5NDE2MTUzMTE5MiwieSI6LTIwNC45NTAzNTI3NTY1NDAwNH0sImRhdGEiOnsiZ2FpbiI6MC43fSwibWVhc3VyZWQiOnsid2lkdGgiOjI1MCwiaGVpZ2h0Ijo5OH0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoieGEyeWpkOTNoIiwidHlwZSI6ImdhaW4iLCJwb3NpdGlvbiI6eyJ4IjozNzkuNDEyMjIzMjg0ODM0NSwieSI6LTMzLjAyOTE4OTA4MDU5OTQzfSwiZGF0YSI6eyJnYWluIjowLjV9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MjUwLCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJpM21kZWJtdTYiLCJ0eXBlIjoiZGVsYXkiLCJwb3NpdGlvbiI6eyJ4IjoxODguODU5MjA5MzU4Mjk5MzIsInkiOi0yMDQuMTAzNDUwNDcyNDIyMTR9LCJkYXRhIjp7ImRlbGF5VGltZSI6MC4xfSwibWVhc3VyZWQiOnsid2lkdGgiOjI5NywiaGVpZ2h0Ijo5OH0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfV0sImVkZ2VzIjpbeyJzb3VyY2UiOiI2Z2w3bHN1NXAiLCJzb3VyY2VIYW5kbGUiOiI2Z2w3bHN1NXAtb3V0IiwidGFyZ2V0IjoiZGVzdGluYXRpb24iLCJ0YXJnZXRIYW5kbGUiOiJkZXN0aW5hdGlvbi1pbiIsImlkIjoieHktZWRnZV9fNmdsN2xzdTVwNmdsN2xzdTVwLW91dC1kZXN0aW5hdGlvbmRlc3RpbmF0aW9uLWluIn0seyJzb3VyY2UiOiI2Z2w3bHN1NXAiLCJzb3VyY2VIYW5kbGUiOiI2Z2w3bHN1NXAtb3V0IiwidGFyZ2V0IjoiaTNtZGVibXU2IiwidGFyZ2V0SGFuZGxlIjoiaTNtZGVibXU2LWluIiwiaWQiOiJ4eS1lZGdlX182Z2w3bHN1NXA2Z2w3bHN1NXAtb3V0LWkzbWRlYm11NmkzbWRlYm11Ni1pbiJ9LHsic291cmNlIjoiaTNtZGVibXU2Iiwic291cmNlSGFuZGxlIjoiaTNtZGVibXU2LW91dCIsInRhcmdldCI6ImkydDY4NTY1cSIsInRhcmdldEhhbmRsZSI6ImkydDY4NTY1cS1pbiIsImlkIjoieHktZWRnZV9faTNtZGVibXU2aTNtZGVibXU2LW91dC1pMnQ2ODU2NXFpMnQ2ODU2NXEtaW4ifSx7InNvdXJjZSI6ImkydDY4NTY1cSIsInNvdXJjZUhhbmRsZSI6ImkydDY4NTY1cS1vdXQiLCJ0YXJnZXQiOiJpM21kZWJtdTYiLCJ0YXJnZXRIYW5kbGUiOiJpM21kZWJtdTYtaW4iLCJpZCI6Inh5LWVkZ2VfX2kydDY4NTY1cWkydDY4NTY1cS1vdXQtaTNtZGVibXU2aTNtZGVibXU2LWluIn0seyJzb3VyY2UiOiJpMnQ2ODU2NXEiLCJzb3VyY2VIYW5kbGUiOiJpMnQ2ODU2NXEtb3V0IiwidGFyZ2V0IjoieGEyeWpkOTNoIiwidGFyZ2V0SGFuZGxlIjoieGEyeWpkOTNoLWluIiwiaWQiOiJ4eS1lZGdlX19pMnQ2ODU2NXFpMnQ2ODU2NXEtb3V0LXhhMnlqZDkzaHhhMnlqZDkzaC1pbiJ9LHsic291cmNlIjoieGEyeWpkOTNoIiwic291cmNlSGFuZGxlIjoieGEyeWpkOTNoLW91dCIsInRhcmdldCI6ImRlc3RpbmF0aW9uIiwidGFyZ2V0SGFuZGxlIjoiZGVzdGluYXRpb24taW4iLCJpZCI6Inh5LWVkZ2VfX3hhMnlqZDkzaHhhMnlqZDkzaC1vdXQtZGVzdGluYXRpb25kZXN0aW5hdGlvbi1pbiJ9XX0"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadBinaural = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMDAsInkiOjEwMH0sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fX0seyJpZCI6IjEydHh5dWxhMiIsInR5cGUiOiJvc2NpbGxhdG9yIiwicG9zaXRpb24iOnsieCI6LTM4LjM3NjU4NjkzNDc2MDYxLCJ5IjotMjc4LjQ1MzM3NDk2ODQ5NTU1fSwiZGF0YSI6eyJ0eXBlIjoic2luZSIsImZyZXF1ZW5jeSI6NjB9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk2LCJoZWlnaHQiOjE2Mn0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoib29yYTZ1ZXk0IiwidHlwZSI6Im9zY2lsbGF0b3IiLCJwb3NpdGlvbiI6eyJ4IjoyOTkuODcyODY1MzUwNjg3NSwieSI6LTI3OC40NTMzNzQ5Njg0OTU1fSwiZGF0YSI6eyJ0eXBlIjoic2luZSIsImZyZXF1ZW5jeSI6Njh9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk2LCJoZWlnaHQiOjE2Mn0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoib3BqdTkzMmQ5IiwidHlwZSI6InN0ZXJlby1wYW5uZXIiLCJwb3NpdGlvbiI6eyJ4IjotMTIuNDk0NzAyNzIyOTQ1MzA2LCJ5IjotNzcuNjQ1NjUyNjM1NDQ1ODd9LCJkYXRhIjp7InBhbiI6LTF9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MjQ2LCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiI3YzgxYjMxdTAiLCJ0eXBlIjoic3RlcmVvLXBhbm5lciIsInBvc2l0aW9uIjp7IngiOjMyNS43NTQ3NDk1NjI1MDI3LCJ5IjotNzguNTM4MTMxNDAxMzcwNTV9LCJkYXRhIjp7InBhbiI6MX0sIm1lYXN1cmVkIjp7IndpZHRoIjoyNDYsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX1dLCJlZGdlcyI6W3sic291cmNlIjoiMTJ0eHl1bGEyIiwic291cmNlSGFuZGxlIjoiMTJ0eHl1bGEyLW91dCIsInRhcmdldCI6Im9wanU5MzJkOSIsInRhcmdldEhhbmRsZSI6Im9wanU5MzJkOS1pbiIsImlkIjoieHktZWRnZV9fMTJ0eHl1bGEyMTJ0eHl1bGEyLW91dC1vcGp1OTMyZDlvcGp1OTMyZDktaW4ifSx7InNvdXJjZSI6Im9wanU5MzJkOSIsInNvdXJjZUhhbmRsZSI6Im9wanU5MzJkOS1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX19vcGp1OTMyZDlvcGp1OTMyZDktb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifSx7InNvdXJjZSI6IjdjODFiMzF1MCIsInNvdXJjZUhhbmRsZSI6IjdjODFiMzF1MC1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX183YzgxYjMxdTA3YzgxYjMxdTAtb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifSx7InNvdXJjZSI6Im9vcmE2dWV5NCIsInNvdXJjZUhhbmRsZSI6Im9vcmE2dWV5NC1vdXQiLCJ0YXJnZXQiOiI3YzgxYjMxdTAiLCJ0YXJnZXRIYW5kbGUiOiI3YzgxYjMxdTAtaW4iLCJpZCI6Inh5LWVkZ2VfX29vcmE2dWV5NG9vcmE2dWV5NC1vdXQtN2M4MWIzMXUwN2M4MWIzMXUwLWluIn1dfQ"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadClub = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMTQuOTA3NzE4NDgzNDkyNDksInkiOjkzLjYxMDk3Nzc5Mjc4ODkzfSwiZGF0YSI6e30sIm1lYXN1cmVkIjp7IndpZHRoIjozNjAsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6IjZoaGViNWw2cCIsInR5cGUiOiJhdWRpby1idWZmZXItc291cmNlIiwicG9zaXRpb24iOnsieCI6MzEuMjM1MjE5Njc5Njk4NTAzLCJ5IjotNTk3LjcyODUyMjA1MjQxMjh9LCJkYXRhIjp7ImZpbGUiOnt9fSwibWVhc3VyZWQiOnsid2lkdGgiOjQ4MSwiaGVpZ2h0IjoyMDB9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6IjYzc3F5MTFocSIsInR5cGUiOiJiaXF1YWQtZmlsdGVyIiwicG9zaXRpb24iOnsieCI6LTUyLjg3ODg4MDg3OTc2ODYxNiwieSI6LTI3My45NTEzOTYzNDg0MDY5fSwiZGF0YSI6eyJ0eXBlIjoibG93cGFzcyIsImZyZXF1ZW5jeSI6NjAsIlEiOjV9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk2LCJoZWlnaHQiOjE5NH0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoiN2xxb3RoaWJzIiwidHlwZSI6ImJpcXVhZC1maWx0ZXIiLCJwb3NpdGlvbiI6eyJ4IjoyOTMuODYxNjg3OTI5MDUyOTUsInkiOi0zNzEuOTgzMDcwNzMwOTU1NH0sImRhdGEiOnsidHlwZSI6ImhpZ2hwYXNzIiwiZnJlcXVlbmN5IjoyMDAwLCJRIjo1fSwibWVhc3VyZWQiOnsid2lkdGgiOjI5NiwiaGVpZ2h0IjoxOTR9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6Im96OHNlYmljMyIsInR5cGUiOiJkZWxheSIsInBvc2l0aW9uIjp7IngiOjI5My44NjE2ODc5MjkwNTI5NSwieSI6LTE2Mi4zODM2MzUxODIyMDg2fSwiZGF0YSI6eyJkZWxheVRpbWUiOjAuMX0sIm1lYXN1cmVkIjp7IndpZHRoIjoyOTcsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6ImtvNDhiMmxiaSIsInR5cGUiOiJnYWluIiwicG9zaXRpb24iOnsieCI6MzE3LjYwMTY4OTU5NTUzNzQsInkiOi00OS41OTM2MjcwNjQ0MTU1NH0sImRhdGEiOnsiZ2FpbiI6MC4yfSwibWVhc3VyZWQiOnsid2lkdGgiOjI1MCwiaGVpZ2h0Ijo5OH0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfV0sImVkZ2VzIjpbeyJzb3VyY2UiOiI2aGhlYjVsNnAiLCJzb3VyY2VIYW5kbGUiOiI2aGhlYjVsNnAtb3V0IiwidGFyZ2V0IjoiNjNzcXkxMWhxIiwidGFyZ2V0SGFuZGxlIjoiNjNzcXkxMWhxLWluIiwiaWQiOiJ4eS1lZGdlX182aGhlYjVsNnA2aGhlYjVsNnAtb3V0LTYzc3F5MTFocTYzc3F5MTFocS1pbiIsInNlbGVjdGVkIjpmYWxzZX0seyJzb3VyY2UiOiI2aGhlYjVsNnAiLCJzb3VyY2VIYW5kbGUiOiI2aGhlYjVsNnAtb3V0IiwidGFyZ2V0IjoiN2xxb3RoaWJzIiwidGFyZ2V0SGFuZGxlIjoiN2xxb3RoaWJzLWluIiwiaWQiOiJ4eS1lZGdlX182aGhlYjVsNnA2aGhlYjVsNnAtb3V0LTdscW90aGliczdscW90aGlicy1pbiIsInNlbGVjdGVkIjpmYWxzZX0seyJzb3VyY2UiOiI3bHFvdGhpYnMiLCJzb3VyY2VIYW5kbGUiOiI3bHFvdGhpYnMtb3V0IiwidGFyZ2V0Ijoib3o4c2ViaWMzIiwidGFyZ2V0SGFuZGxlIjoib3o4c2ViaWMzLWluIiwiaWQiOiJ4eS1lZGdlX183bHFvdGhpYnM3bHFvdGhpYnMtb3V0LW96OHNlYmljM296OHNlYmljMy1pbiIsInNlbGVjdGVkIjpmYWxzZX0seyJzb3VyY2UiOiI2M3NxeTExaHEiLCJzb3VyY2VIYW5kbGUiOiI2M3NxeTExaHEtb3V0IiwidGFyZ2V0IjoiZGVzdGluYXRpb24iLCJ0YXJnZXRIYW5kbGUiOiJkZXN0aW5hdGlvbi1pbiIsImlkIjoieHktZWRnZV9fNjNzcXkxMWhxNjNzcXkxMWhxLW91dC1kZXN0aW5hdGlvbmRlc3RpbmF0aW9uLWluIiwic2VsZWN0ZWQiOmZhbHNlfSx7InNvdXJjZSI6Im96OHNlYmljMyIsInNvdXJjZUhhbmRsZSI6Im96OHNlYmljMy1vdXQiLCJ0YXJnZXQiOiJrbzQ4YjJsYmkiLCJ0YXJnZXRIYW5kbGUiOiJrbzQ4YjJsYmktaW4iLCJpZCI6Inh5LWVkZ2VfX296OHNlYmljM296OHNlYmljMy1vdXQta280OGIybGJpa280OGIybGJpLWluIn0seyJzb3VyY2UiOiJrbzQ4YjJsYmkiLCJzb3VyY2VIYW5kbGUiOiJrbzQ4YjJsYmktb3V0IiwidGFyZ2V0IjoiZGVzdGluYXRpb24iLCJ0YXJnZXRIYW5kbGUiOiJkZXN0aW5hdGlvbi1pbiIsImlkIjoieHktZWRnZV9fa280OGIybGJpa280OGIybGJpLW91dC1kZXN0aW5hdGlvbmRlc3RpbmF0aW9uLWluIn1dfQ"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const addAudioBufferSource = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "audio-buffer-source",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addBiquadFilter = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "biquad-filter",
          position: { x: 0, y: 0 },
          data: {
            type: "lowpass",
          },
        },
      ];
    });
  };

  const addDelay = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "delay",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addDynamicsCompressor = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "dynamics-compressor",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addGain = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "gain",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addOscillator = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "oscillator",
          position: { x: 0, y: 0 },
          data: {
            type: "sine",
          },
        },
      ];
    });
  };

  const addStereoPanner = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "stereo-panner",
          position: { x: 0, y: 0 },
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
        <div className="absolute top-[75px] left-4 bg-white flex flex-col z-50 gap-2">
          <h1>Audio Nodes</h1>
          <Button onClick={addAudioBufferSource}>Audio Buffer Source</Button>
          <Button onClick={addBiquadFilter}>Biquad Filter</Button>
          <Button onClick={addDelay}>Delay</Button>
          <Button onClick={addDynamicsCompressor}>Dynamics Compressor</Button>
          <Button onClick={addGain}>Gain</Button>
          <Button onClick={addOscillator}>Oscillator</Button>
          <Button onClick={addStereoPanner}>Stereo Panner</Button>
          <h1>Examples</h1>
          <Button onClick={loadSimple}>Simple Buffer</Button>
          <Button onClick={loadReverb}>Reverb</Button>
          <Button onClick={loadBinaural}>Binaural Beats</Button>
          <Button onClick={loadClub}>Outside the Club</Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
        {!!engine && (
          <RunReportPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            engine={engine}
          />
        )}
        <Controls />
      </ReactFlow>
    </SetNodesProvider>
  );
}
