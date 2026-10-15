import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  MonitorSpeaker, 
  Cable, 
  Calculator, 
  Sliders, 
  Boxes, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Play, 
  Plus, 
  X,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Layers,
  Info,
  Lightbulb,
  MousePointerClick
} from 'lucide-react';
import { PieceId, PlacedPiecesState, PuzzlePiece } from '../types/puzzle';
import { PUZZLE_PIECES } from '../data/puzzlePieces';
import { sounds } from '../utils/soundEffects';

interface PuzzleBoardProps {
  placedPieces: PlacedPiecesState;
  onPlacePiece: (pieceId: PieceId) => void;
  onRemovePiece: (pieceId: PieceId) => void;
  onClearAll: () => void;
  onOpenPieceInfo: (pieceId: string) => void;
  onRunTest: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  placedPieces,
  onPlacePiece,
  onRemovePiece,
  onClearAll,
  onOpenPieceInfo,
  onRunTest
}) => {
  // Selected piece for click-to-place
  const [selectedPieceId, setSelectedPieceId] = useState<PieceId | null>(null);
  
  // Track inspected piece for the small info tab per user request:
  // "Cada vez que le pinchas a una pieza salga una pestaña pequeña con el mensaje de la información.
  // Cuando lo cierras, ya no vuelve a aparecer la información, hasta que vuelves a pinchar en la pieza"
  const [inspectedPieceId, setInspectedPieceId] = useState<PieceId | null>(null);

  // Track hovered slot: marks whenever the mouse passes over it
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3200);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, pieceId: PieceId) => {
    e.dataTransfer.setData('text/plain', pieceId);
    sounds.playClick();
    setSelectedPieceId(pieceId);
    setInspectedPieceId(pieceId);
  };

  const handleDragOver = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    setHoveredSlot(slotName);
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, expectedSlot: string, targetPieceId: PieceId) => {
    e.preventDefault();
    setHoveredSlot(null);
    const draggedPieceId = e.dataTransfer.getData('text/plain') as PieceId;

    if (!draggedPieceId) return;

    if (draggedPieceId === targetPieceId) {
      sounds.playSnap();
      onPlacePiece(targetPieceId);
      showFeedback(`¡Excelente! Has encajado ${PUZZLE_PIECES[targetPieceId].name} en su sitio.`, 'success');
      setSelectedPieceId(null);
    } else {
      sounds.playError();
      showFeedback(`¡Uy! La pieza "${PUZZLE_PIECES[draggedPieceId]?.name}" no va aquí. ¡Prueba en su zócalo correspondiente!`, 'error');
    }
  };

  // Click-to-place handler (tap a piece to select, tap a slot to mount)
  const handleSlotClick = (expectedSlot: string, targetPieceId: PieceId) => {
    if (placedPieces[targetPieceId]) {
      return;
    }

    if (selectedPieceId) {
      if (selectedPieceId === targetPieceId) {
        sounds.playSnap();
        onPlacePiece(targetPieceId);
        showFeedback(`¡Perfecto! Has colocado ${PUZZLE_PIECES[targetPieceId].name}.`, 'success');
        setSelectedPieceId(null);
      } else {
        sounds.playError();
        showFeedback(`"${PUZZLE_PIECES[selectedPieceId]?.name}" no encaja en este zócalo. ¡Intenta en otro!`, 'error');
      }
    } else {
      showFeedback('Selecciona primero una pieza en la bandeja o arrástrala con el ratón.', 'error');
    }
  };

  const piecesList = Object.values(PUZZLE_PIECES);
  const placedCount = Object.values(placedPieces).filter(Boolean).length;
  const isAllPlaced = placedCount === piecesList.length;

  // CPU Subpieces status
  const cpuSubCount = (placedPieces.alu ? 1 : 0) + (placedPieces.uc ? 1 : 0) + (placedPieces.registros ? 1 : 0);

  // Helper to determine if a slot is marked when mouse hovers over it
  const isSlotHovered = (slotKey: string) => hoveredSlot === slotKey;

  // RENDER INTERNAL CPU SUB-SLOTS (ALU, UC, REGISTROS)
  // These 3 slots are ALWAYS inside the CPU (either in the preparation workbench or on the motherboard!)
  // They are clearly colored in Green (ALU), Rose (UC), and Yellow/Amber (Registros)
  const renderCpuInternalSlots = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Compartimentos internos del Microprocesador ({cpuSubCount}/3):</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {cpuSubCount === 3 ? '✓ CPU Completa' : 'Faltan subpiezas'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Sub-slot 1: ALU (Vibrant Green) */}
          <div
            onMouseEnter={() => setHoveredSlot('slot_alu')}
            onMouseLeave={() => setHoveredSlot(null)}
            onDragOver={(e) => handleDragOver(e, 'slot_alu')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'slot_alu', 'alu')}
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick('slot_alu', 'alu');
            }}
            className={`p-3 rounded-2xl border-2 transition-all relative flex flex-col justify-between min-h-[96px] ${
              placedPieces.alu
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50'
                : isSlotHovered('slot_alu')
                ? 'bg-emerald-900/60 border-emerald-400 border-solid scale-[1.03] shadow-xl shadow-emerald-500/30'
                : 'bg-emerald-950/30 border-dashed border-emerald-500/70 hover:border-emerald-400 cursor-pointer'
            }`}
          >
            {placedPieces.alu ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-300">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">ALU</span>
                      <span className="text-[10px] text-emerald-300 font-semibold">Calculadora</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onRemovePiece('alu');
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    title="Retirar ALU"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[9px] text-emerald-300 font-mono pt-1">
                  ✓ Sumas, restas y lógica
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-1 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">
                    {isSlotHovered('slot_alu') ? '⚡ Soltar ALU' : 'Hueco ALU'}
                  </span>
                </div>
                <span className="text-[9px] text-emerald-300/80 font-medium">
                  {isSlotHovered('slot_alu') ? 'Zona activa detectada' : 'La Calculadora'}
                </span>
              </div>
            )}
          </div>

          {/* Sub-slot 2: UC (Vibrant Rose/Red) */}
          <div
            onMouseEnter={() => setHoveredSlot('slot_uc')}
            onMouseLeave={() => setHoveredSlot(null)}
            onDragOver={(e) => handleDragOver(e, 'slot_uc')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'slot_uc', 'uc')}
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick('slot_uc', 'uc');
            }}
            className={`p-3 rounded-2xl border-2 transition-all relative flex flex-col justify-between min-h-[96px] ${
              placedPieces.uc
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50'
                : isSlotHovered('slot_uc')
                ? 'bg-rose-900/60 border-rose-400 border-solid scale-[1.03] shadow-xl shadow-rose-500/30'
                : 'bg-rose-950/30 border-dashed border-rose-500/70 hover:border-rose-400 cursor-pointer'
            }`}
          >
            {placedPieces.uc ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">UC</span>
                      <span className="text-[10px] text-rose-300 font-semibold">Unidad Control</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onRemovePiece('uc');
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    title="Retirar UC"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[9px] text-rose-300 font-mono pt-1">
                  ✓ Director de orquesta
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-1 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">
                    {isSlotHovered('slot_uc') ? '⚡ Soltar UC' : 'Hueco UC'}
                  </span>
                </div>
                <span className="text-[9px] text-rose-300/80 font-medium">
                  {isSlotHovered('slot_uc') ? 'Zona activa detectada' : 'Unidad de Control'}
                </span>
              </div>
            )}
          </div>

          {/* Sub-slot 3: Registros (Vibrant Yellow/Amber) */}
          <div
            onMouseEnter={() => setHoveredSlot('slot_registros')}
            onMouseLeave={() => setHoveredSlot(null)}
            onDragOver={(e) => handleDragOver(e, 'slot_registros')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'slot_registros', 'registros')}
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick('slot_registros', 'registros');
            }}
            className={`p-3 rounded-2xl border-2 transition-all relative flex flex-col justify-between min-h-[96px] ${
              placedPieces.registros
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50'
                : isSlotHovered('slot_registros')
                ? 'bg-amber-900/60 border-amber-400 border-solid scale-[1.03] shadow-xl shadow-amber-500/30'
                : 'bg-amber-950/30 border-dashed border-amber-500/70 hover:border-amber-400 cursor-pointer'
            }`}
          >
            {placedPieces.registros ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">Registros</span>
                      <span className="text-[10px] text-amber-300 font-semibold">Bolsillos Rápidos</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onRemovePiece('registros');
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    title="Retirar Registros"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[9px] text-amber-300 font-mono pt-1">
                  ✓ PC, IR, Acumulador
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-1 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Boxes className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">
                    {isSlotHovered('slot_registros') ? '⚡ Soltar Registros' : 'Hueco Registros'}
                  </span>
                </div>
                <span className="text-[9px] text-amber-300/80 font-medium">
                  {isSlotHovered('slot_registros') ? 'Zona activa detectada' : 'Bolsillos Rápidos'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const inspectedPiece = inspectedPieceId ? PUZZLE_PIECES[inspectedPieceId] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧩</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              Puzzle 2D: Monta tu Ordenador Von Neumann
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pasa el ratón sobre cualquier hueco para marcarlo. Puedes montar las subpiezas de la CPU (ALU, UC, Registros) <strong>en el banco de preparación</strong> antes de llevarte el microprocesador a la placa, o colocar primero la CPU en la placa y completarla allí.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              onClearAll();
              showFeedback('Todas las piezas desmontadas. ¡A montar desde cero!', 'success');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Desmontar Todo</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRunTest();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-bold text-sm shadow-xl shadow-emerald-500/25 transition-transform hover:scale-105 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>¡COMPROBAR Y ENCENDER!</span>
          </button>
        </div>
      </div>

      {/* Floating Feedback Notification */}
      {feedbackMsg && (
        <div className={`p-3 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
            : 'bg-amber-950 border-amber-500/60 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <span>{feedbackMsg.type === 'success' ? '🎉' : '💡'}</span>
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Play Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 8 cols (Workbench for CPU if unmounted + Motherboard) */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. CPU WORKBENCH (Visible when CPU is unmounted) */}
          {!placedPieces.cpu && (
            <div className="bg-slate-900/90 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>Banco de Preparación del Microprocesador (CPU)</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40 font-mono font-bold">
                        {cpuSubCount}/3 piezas
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Monta la <strong>ALU</strong>, la <strong>UC</strong> y los <strong>Registros</strong> dentro del microprocesador antes de llevarlo a la placa, o llévate la CPU primero.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playSnap();
                    onPlacePiece('cpu');
                    showFeedback('¡Microprocesador instalado en la placa base!', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Llevar CPU a la Placa</span>
                </button>
              </div>

              {/* RENDER INTERNAL CPU SLOTS ON WORKBENCH */}
              {renderCpuInternalSlots()}
            </div>
          )}

          {/* 2. MOTHERBOARD (PLACA BASE 2D) */}
          <div className="pcb-grid border-4 border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative min-h-[520px] flex flex-col justify-between">
            
            {/* Motherboard Header Banner */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-bold uppercase tracking-wider text-white">
                  PLACA BASE // ARQUITECTURA DE VON NEUMANN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-cyan-300 font-mono">
                  Zócalos en placa: {(placedPieces.cpu ? 1 : 0) + (placedPieces.memoria ? 1 : 0) + (placedPieces.io ? 1 : 0) + (placedPieces.buses ? 1 : 0)} / 4
                </span>
              </div>
            </div>

            {/* Motherboard Sockets */}
            <div className="space-y-5 relative z-10 flex-1 flex flex-col justify-between">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
                
                {/* 1. CPU SOCKET (7 cols) */}
                <div 
                  onMouseEnter={() => setHoveredSlot('slot_cpu')}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onDragOver={(e) => handleDragOver(e, 'slot_cpu')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'slot_cpu', 'cpu')}
                  onClick={() => handleSlotClick('slot_cpu', 'cpu')}
                  className={`sm:col-span-7 rounded-3xl border-3 p-4 sm:p-5 transition-all relative ${
                    placedPieces.cpu
                      ? 'bg-slate-900/95 border-amber-500 shadow-xl shadow-amber-950/30'
                      : isSlotHovered('slot_cpu')
                      ? 'bg-amber-950/50 border-amber-400 scale-[1.01] shadow-xl shadow-amber-500/25'
                      : 'bg-slate-950/80 border-dashed border-amber-600/40 hover:border-amber-400 cursor-pointer'
                  }`}
                >
                  {/* Socket Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${placedPieces.cpu ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-white">
                          {placedPieces.cpu ? 'CPU (Microprocesador Central)' : 'Zócalo de CPU (Socket 1)'}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {placedPieces.cpu ? 'El Cerebro de la Arquitectura' : 'Zócalo principal para alojar el microprocesador'}
                        </p>
                      </div>
                    </div>

                    {placedPieces.cpu ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPieceInfo('cpu');
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400"
                          title="Información"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            onRemovePiece('cpu');
                            showFeedback('Has retirado la CPU de la placa (vuelve al banco de preparación).', 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 flex items-center gap-1"
                          title="Mover CPU al banco de preparación"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Retirar a banco</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isSlotHovered('slot_cpu') ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSlotHovered('slot_cpu') ? '⚡ Zócalo Activo' : 'Hueco Vacío'}
                      </span>
                    )}
                  </div>

                  {!placedPieces.cpu ? (
                    <div className="py-7 text-center space-y-2">
                      <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center transition-colors ${
                        isSlotHovered('slot_cpu')
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                          : 'border-slate-700 bg-slate-900/60 text-slate-500'
                      }`}>
                        <Cpu className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-semibold text-slate-200">
                        {isSlotHovered('slot_cpu') ? '¡Suelta la CPU para encajarla!' : 'Zócalo de CPU'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isSlotHovered('slot_cpu') ? 'Zona de colocación activa' : 'Aloja el microprocesador con su ALU, UC y Registros'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {renderCpuInternalSlots()}
                    </div>
                  )}
                </div>

                {/* 2. RAM SOCKET (5 cols) */}
                <div
                  onMouseEnter={() => setHoveredSlot('slot_memoria')}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onDragOver={(e) => handleDragOver(e, 'slot_memoria')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'slot_memoria', 'memoria')}
                  onClick={() => handleSlotClick('slot_memoria', 'memoria')}
                  className={`sm:col-span-5 rounded-3xl border-3 p-4 sm:p-5 transition-all relative flex flex-col justify-between ${
                    placedPieces.memoria
                      ? 'bg-slate-900/95 border-emerald-500 shadow-xl shadow-emerald-950/30'
                      : isSlotHovered('slot_memoria')
                      ? 'bg-emerald-950/50 border-emerald-400 scale-[1.01] shadow-xl shadow-emerald-500/25'
                      : 'bg-slate-950/80 border-dashed border-emerald-600/40 hover:border-emerald-400 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${placedPieces.memoria ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm sm:text-base text-white">
                            {placedPieces.memoria ? 'Memoria Principal (RAM)' : 'Ranura de Memoria (RAM Slot)'}
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            {placedPieces.memoria ? 'Almacén de Datos + Instrucciones' : 'Ranura para almacenar datos y programas'}
                          </p>
                        </div>
                      </div>

                      {placedPieces.memoria ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPieceInfo('memoria');
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-400"
                            title="Información"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              onRemovePiece('memoria');
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                            title="Retirar memoria"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isSlotHovered('slot_memoria') ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isSlotHovered('slot_memoria') ? '⚡ Ranura Activa' : 'Ranura Vacía'}
                        </span>
                      )}
                    </div>

                    {!placedPieces.memoria ? (
                      <div className="py-7 text-center space-y-2">
                        <div className={`w-24 h-12 mx-auto rounded-xl border flex items-center justify-center transition-colors ${
                          isSlotHovered('slot_memoria')
                            ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                            : 'border-slate-700 bg-slate-900/60 text-slate-500'
                        }`}>
                          <div className="flex gap-1.5">
                            <span className="w-1.5 h-6 bg-emerald-500/50 rounded-sm" />
                            <span className="w-1.5 h-6 bg-emerald-500/50 rounded-sm" />
                            <span className="w-1.5 h-6 bg-emerald-500/50 rounded-sm" />
                            <span className="w-1.5 h-6 bg-emerald-500/50 rounded-sm" />
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-200">
                          {isSlotHovered('slot_memoria') ? '¡Suelta la Memoria RAM aquí!' : 'Ranura de Memoria'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {isSlotHovered('slot_memoria') ? 'Zona de colocación activa' : 'Guarda las variables y programas en ejecución'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Memoria Principal Conectada</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-400">
                            En el modelo Von Neumann, programas y datos comparten este espacio físico.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-center">
                          <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300">
                            Dirección 00: 5
                          </div>
                          <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300">
                            Dirección 01: 3
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {placedPieces.memoria && (
                    <span className="text-[10px] text-emerald-400 text-center block mt-2">
                      ✓ Bus de Datos &harr; Bus de Direcciones
                    </span>
                  )}
                </div>
              </div>

              {/* 3. BUSES DEL SISTEMA */}
              <div
                onMouseEnter={() => setHoveredSlot('slot_buses')}
                onMouseLeave={() => setHoveredSlot(null)}
                onDragOver={(e) => handleDragOver(e, 'slot_buses')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'slot_buses', 'buses')}
                onClick={() => handleSlotClick('slot_buses', 'buses')}
                className={`rounded-3xl border-3 p-4 transition-all relative ${
                  placedPieces.buses
                    ? 'bg-slate-900/95 border-cyan-400 shadow-xl shadow-cyan-950/30'
                    : isSlotHovered('slot_buses')
                    ? 'bg-cyan-950/50 border-cyan-400 scale-[1.01] shadow-xl shadow-cyan-500/25'
                    : 'bg-slate-950/80 border-dashed border-cyan-600/40 hover:border-cyan-400 cursor-pointer'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${placedPieces.buses ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Cable className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        {placedPieces.buses ? 'Buses de Comunicación del Sistema' : 'Canal de Buses (Líneas de Comunicación)'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {placedPieces.buses 
                          ? 'Autopistas de líneas rectas que unen CPU, Memoria y E/S' 
                          : 'Autopistas para transportar datos, direcciones y órdenes'}
                      </p>
                    </div>
                  </div>

                  {placedPieces.buses ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPieceInfo('buses');
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-400"
                        title="Información"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          onRemovePiece('buses');
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                        title="Retirar buses"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isSlotHovered('slot_buses') ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSlotHovered('slot_buses') ? '⚡ Canal Activo' : 'Canal Vacío'}
                    </span>
                  )}
                </div>

                {!placedPieces.buses ? (
                  <div className="py-3 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-200">
                      {isSlotHovered('slot_buses') ? '¡Suelta los Buses aquí!' : 'Canal de Interconexión'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isSlotHovered('slot_buses') ? 'Zona de colocación activa' : 'Conecta la CPU con la Memoria y con los Periféricos'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] text-center pt-1">
                    <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                      ⚡ Bus CPU &harr; E/S (Verde)
                    </div>
                    <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                      🛣️ Bus CPU &harr; RAM (Datos/Dir/Ctrl)
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300">
                      🚦 Bus Troncal General
                    </div>
                  </div>
                )}
              </div>

              {/* 4. INTERFACES DE ENTRADA Y SALIDA (E/S) */}
              <div
                onMouseEnter={() => setHoveredSlot('slot_io')}
                onMouseLeave={() => setHoveredSlot(null)}
                onDragOver={(e) => handleDragOver(e, 'slot_io')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'slot_io', 'io')}
                onClick={() => handleSlotClick('slot_io', 'io')}
                className={`rounded-3xl border-3 p-4 sm:p-5 transition-all relative ${
                  placedPieces.io
                    ? 'bg-slate-900/95 border-purple-500 shadow-xl shadow-purple-950/30'
                    : isSlotHovered('slot_io')
                    ? 'bg-purple-950/50 border-purple-400 scale-[1.01] shadow-xl shadow-purple-500/25'
                    : 'bg-slate-950/80 border-dashed border-purple-600/40 hover:border-purple-400 cursor-pointer'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${placedPieces.io ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                      <MonitorSpeaker className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        {placedPieces.io ? 'Interfaces de Entrada y Salida (E/S)' : 'Bahía de Conexión de Periféricos (E/S)'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {placedPieces.io 
                          ? 'Teclado y Ratón (Entrada) ⌨️ | Pantalla y Altavoz (Salida) 🖥️' 
                          : 'Conexión con el exterior (teclado, ratón, pantalla)'}
                      </p>
                    </div>
                  </div>

                  {placedPieces.io ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Periféricos Conectados
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPieceInfo('io');
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-purple-400"
                        title="Información"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          onRemovePiece('io');
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                        title="Retirar E/S"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isSlotHovered('slot_io') ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSlotHovered('slot_io') ? '⚡ Bahía Activa' : 'Bahía Vacía'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols (Bandeja de Piezas + Pestaña de Información Pequeña) */}
        <div className="lg:col-span-4 space-y-4">

          {/* PESTAÑA PEQUEÑA DE INFORMACIÓN (Aparece al pinchar en una pieza; se cierra con la X y no vuelve a salir sola) */}
          {inspectedPiece && (
            <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl relative animate-in fade-in slide-in-from-top-3 duration-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${inspectedPiece.bgLight} border ${inspectedPiece.borderColor}`}>
                    <span className="text-xl">
                      {inspectedPiece.id === 'cpu' && '🧠'}
                      {inspectedPiece.id === 'memoria' && '🗄️'}
                      {inspectedPiece.id === 'io' && '🖥️'}
                      {inspectedPiece.id === 'buses' && '🛣️'}
                      {inspectedPiece.id === 'alu' && '🧮'}
                      {inspectedPiece.id === 'uc' && '🚦'}
                      {inspectedPiece.id === 'registros' && '📦'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      Ficha de la Pieza
                    </span>
                    <h4 className="font-display font-bold text-sm text-white">
                      {inspectedPiece.name}
                    </h4>
                  </div>
                </div>

                {/* Close Button 'X' (Closes until piece is clicked again) */}
                <button
                  onClick={() => setInspectedPieceId(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Cerrar ficha de información"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Kid friendly definition */}
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                {inspectedPiece.kidDescription}
              </p>

              {/* Everyday analogy */}
              <div className="text-xs text-amber-200 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-2xl flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{inspectedPiece.analogy}</p>
              </div>

              {/* Interaction tip */}
              <div className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5 pt-1">
                <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {inspectedPiece.category === 'cpu_interior'
                    ? 'Colócala dentro del microprocesador (en el banco o en la placa).'
                    : 'Arrastra o haz clic en su zócalo para colocarla.'}
                </span>
              </div>
            </div>
          )}

          {/* Piezas Tray */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Bandeja de Piezas
                </h3>
                <p className="text-xs text-slate-400">
                  {piecesList.length - placedCount > 0 
                    ? `${piecesList.length - placedCount} piezas listas para colocar` 
                    : '¡Todas las piezas están montadas! 🎉'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                {placedCount} / 7
              </span>
            </div>

            {/* Quick instructions for students */}
            <div className="p-3 rounded-2xl bg-slate-950 text-xs text-slate-300 leading-relaxed border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 block">¿Cómo colocar las piezas?</span>
              <p>
                1. <strong>Pincha en una pieza</strong> para ver su información y seleccionarla.<br />
                2. <strong>Arrastra</strong> la pieza o haz clic en su zócalo para encajarla.<br />
                3. Las subpiezas de la CPU se montan dentro del microprocesador.
              </p>
            </div>

            {/* List of pieces */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {piecesList.map((piece) => {
                const isPlaced = !!placedPieces[piece.id];
                const isSelected = selectedPieceId === piece.id;

                return (
                  <div
                    key={piece.id}
                    draggable={!isPlaced}
                    onDragStart={(e) => !isPlaced && handleDragStart(e, piece.id)}
                    onClick={() => {
                      if (isPlaced) return;
                      sounds.playClick();
                      setSelectedPieceId(piece.id);
                      setInspectedPieceId(piece.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      isPlaced
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : isSelected
                        ? 'bg-blue-950/80 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02] cursor-pointer'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-600 hover:bg-slate-850 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${piece.bgLight} border ${piece.borderColor}`}>
                        <span className="text-lg">
                          {piece.id === 'cpu' && '🧠'}
                          {piece.id === 'memoria' && '🗄️'}
                          {piece.id === 'io' && '🖥️'}
                          {piece.id === 'buses' && '🛣️'}
                          {piece.id === 'alu' && '🧮'}
                          {piece.id === 'uc' && '🚦'}
                          {piece.id === 'registros' && '📦'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                            {piece.name}
                          </h4>
                          {piece.category === 'cpu_interior' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/30 font-semibold">
                              Interna CPU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {piece.kidDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          setSelectedPieceId(piece.id);
                          setInspectedPieceId(piece.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-400"
                        title="Ver ficha de información"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>

                      {isPlaced ? (
                        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                          ✓ Montada
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                          isSelected 
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {isSelected ? 'Seleccionada' : 'Seleccionar'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Victory banner when all 7 pieces are mounted */}
              {isAllPlaced && (
                <div className="py-6 text-center space-y-3 bg-slate-950/80 rounded-2xl border border-emerald-500/40 p-4">
                  <div className="text-3xl">🌟 🚀 🌟</div>
                  <h4 className="font-display font-bold text-sm text-white">
                    ¡Arquitectura de Von Neumann Completa!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Has colocado la CPU con todas sus subpiezas (ALU, UC, Registros), la Memoria RAM, las E/S y los Buses.
                  </p>
                  <button
                    onClick={onRunTest}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-bold text-sm shadow-xl shadow-emerald-500/30 transition-transform hover:scale-105 cursor-pointer"
                  >
                    ¡ENCENDER EL ORDENADOR! 🖥️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
