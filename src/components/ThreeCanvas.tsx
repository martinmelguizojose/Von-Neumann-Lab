import React, { useEffect, useRef } from 'react';
import { VonNeumann3DScene } from '../three/VonNeumann3DScene';
import { PieceId, PlacedPiecesState } from '../types/puzzle';

interface ThreeCanvasProps {
  onSceneReady: (scene: VonNeumann3DScene) => void;
  placedPieces: PlacedPiecesState;
  selectedPieceId: PieceId | null;
  onSelectPiece: (pieceId: PieceId | null) => void;
  onPieceMountChanged: (pieceId: PieceId, isMounted: boolean) => void;
  onWrongSlotClicked: (attemptedPiece: string, targetSlot: string) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onSceneReady,
  placedPieces,
  selectedPieceId,
  onSelectPiece,
  onPieceMountChanged,
  onWrongSlotClicked
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneInstanceRef = useRef<VonNeumann3DScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new VonNeumann3DScene(containerRef.current);
    scene.onSelectPiece = onSelectPiece;
    scene.onPieceMountChanged = onPieceMountChanged;
    scene.onWrongSlotClicked = onWrongSlotClicked;
    scene.selectedPieceId = selectedPieceId;
    scene.syncPlacedPieces(placedPieces);
    sceneInstanceRef.current = scene;
    (window as any).__scene = scene;
    onSceneReady(scene);

    return () => {
      scene.dispose();
    };
  }, []);

  // Sync placed pieces state and selection whenever it changes
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.syncPlacedPieces(placedPieces);
      sceneInstanceRef.current.selectedPieceId = selectedPieceId;
      sceneInstanceRef.current.onPieceMountChanged = onPieceMountChanged;
      sceneInstanceRef.current.onWrongSlotClicked = onWrongSlotClicked;
    }
  }, [placedPieces, selectedPieceId, onPieceMountChanged, onWrongSlotClicked]);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-950 overflow-hidden select-none flex flex-col" style={{ width: '100%', height: '100%' }}>
      {/* 3D Canvas element */}
      <div 
        ref={containerRef} 
        className="w-full flex-1 cursor-grab active:cursor-grabbing" 
        style={{ width: '100%', height: '100%', minHeight: '580px' }}
      />

      {/* Navigation & Interaction hints (Visor 3D) */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl max-w-xs">
        <span className="font-bold text-amber-400 text-xs">🎮 CÓMO JUGAR Y COLOCAR PIEZAS:</span>
        <span className="text-emerald-300 font-semibold">• 1. Pincha y arrastra cualquier pieza a su hueco de la placa</span>
        <span className="text-cyan-300 font-semibold">• 2. O haz clic en la pieza y luego clic en su zócalo</span>
        <span className="text-slate-400 pt-1">• Clic en fondo + arrastrar: Orbitar 360°</span>
        <span className="text-slate-400">• Clic der / Shift: Desplazar (Pan) • Rueda: Zoom</span>
      </div>
    </div>
  );
};
