/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  Sparkles,
  Play,
  Box,
  Layers,
  LayoutGrid,
  Lock,
  CheckCircle2,
  Award,
  Eye,
  GraduationCap
} from 'lucide-react';
import { PieceId, PlacedPiecesState } from './types/puzzle';
import { PUZZLE_PIECES } from './data/puzzlePieces';
import { ThreeCanvas } from './components/ThreeCanvas';
import { SketchUpToolbar } from './components/SketchUpToolbar';
import { PieceInspectorOverlay } from './components/PieceInspectorOverlay';
import { PuzzleBoard } from './components/PuzzleBoard';
import { ComputerLiveTest } from './components/ComputerLiveTest';
import { SimpleExplainerModal } from './components/SimpleExplainerModal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { Unlock3DModal } from './components/Unlock3DModal';
import { CertificateModal } from './components/CertificateModal';
import { VonNeumann3DScene } from './three/VonNeumann3DScene';
import { sounds } from './utils/soundEffects';

export default function App() {
  // Navigation: starts in Level 1 (2D Puzzle)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // LEVEL 1: Independent 2D Puzzle state
  const [placed2D, setPlaced2D] = useState<PlacedPiecesState>({
    cpu: false,
    memoria: false,
    io: false,
    buses: false,
    alu: false,
    uc: false,
    registros: false
  });
  const [is2DCompleted, setIs2DCompleted] = useState<boolean>(false);
  const [is3DUnlocked, setIs3DUnlocked] = useState<boolean>(false);

  // LEVEL 2: Independent 3D Studio state (must be assembled from scratch once unlocked!)
  const [placed3D, setPlaced3D] = useState<PlacedPiecesState>({
    cpu: false,
    memoria: false,
    io: false,
    buses: false,
    alu: false,
    uc: false,
    registros: false
  });
  const [is3DCompleted, setIs3DCompleted] = useState<boolean>(false);

  // Student identification for motherboard engraving & school diploma
  const [studentName, setStudentName] = useState<string>('');
  const [studentGroup, setStudentGroup] = useState<string>('3º ESO');

  // Modals & UI states
  const [selectedPieceId, setSelectedPieceId] = useState<PieceId | null>(null);
  const [activeInfoPieceId, setActiveInfoPieceId] = useState<string | null>(null);
  const [showLiveTestModal, setShowLiveTestModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showUnlock3DModal, setShowUnlock3DModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3600);
  };

  const sceneRef = useRef<VonNeumann3DScene | null>(null);

  // ----------------------------------------
  // 2D PUZZLE HANDLERS (Level 1)
  // ----------------------------------------
  const handlePlace2D = (pieceId: PieceId) => {
    setPlaced2D(prev => {
      const nextState = { ...prev, [pieceId]: true };
      const allCount = Object.values(nextState).filter(Boolean).length;
      if (allCount === 7) {
        setIs2DCompleted(true);
        setIs3DUnlocked(true);
        sounds.playSuccess();
        showToast('🎉 ¡Genial! Has completado el Puzzle 2D. ¡Desbloqueando Taller 3D!', 'success');
        setTimeout(() => {
          setShowUnlock3DModal(true);
        }, 750);
      }
      return nextState;
    });
  };

  const handleRemove2D = (pieceId: PieceId) => {
    setPlaced2D(prev => ({ ...prev, [pieceId]: false }));
  };

  const handleClear2D = () => {
    setPlaced2D({
      cpu: false,
      memoria: false,
      io: false,
      buses: false,
      alu: false,
      uc: false,
      registros: false
    });
  };

  // ----------------------------------------
  // 3D STUDIO HANDLERS (Level 2)
  // ----------------------------------------
  const handleTogglePieceMount3D = (pieceId: PieceId) => {
    setPlaced3D(prev => {
      const nextState = { ...prev, [pieceId]: !prev[pieceId] };
      if (sceneRef.current) {
        sceneRef.current.syncPlacedPieces(nextState);
      }
      const allCount = Object.values(nextState).filter(Boolean).length;
      if (allCount === 7) {
        setIs3DCompleted(true);
        sounds.playFanfare();
        showToast('🎓 ¡Placa Base 3D Completada! Abre la ventana para grabar tu nombre.', 'success');
        setTimeout(() => {
          setShowCertificateModal(true);
        }, 800);
      }
      return nextState;
    });
  };

  const handlePieceMountChanged3D = (pieceId: PieceId, isMounted: boolean) => {
    if (isMounted) {
      sounds.playSnap();
      showToast(`¡Bien! Has encajado ${PUZZLE_PIECES[pieceId]?.name} en su sitio 3D.`, 'success');
    } else {
      sounds.playClick();
      showToast(`Has retirado ${PUZZLE_PIECES[pieceId]?.name}.`, 'info');
    }
    setPlaced3D(prev => {
      const nextState = { ...prev, [pieceId]: isMounted };
      const allCount = Object.values(nextState).filter(Boolean).length;
      if (allCount === 7) {
        setIs3DCompleted(true);
        sounds.playFanfare();
        showToast('🎓 ¡Placa Base 3D Completada! Abre la ventana para grabar tu nombre.', 'success');
        setTimeout(() => {
          setShowCertificateModal(true);
        }, 800);
      }
      return nextState;
    });
  };

  const handleClear3D = () => {
    const nextState: PlacedPiecesState = {
      cpu: false,
      memoria: false,
      io: false,
      buses: false,
      alu: false,
      uc: false,
      registros: false
    };
    setPlaced3D(nextState);
    if (sceneRef.current) {
      sceneRef.current.syncPlacedPieces(nextState);
    }
  };

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sounds.playSnap();
  };

  // Student name plate updater in 3D
  const handleUpdateStudentName = (name: string, group: string) => {
    setStudentName(name);
    setStudentGroup(group);
    if (sceneRef.current) {
      sceneRef.current.setStudentName(name, group);
    }
  };

  const handleFocusPlateIn3D = () => {
    if (sceneRef.current) {
      sceneRef.current.focusOnStudentPlate();
    }
  };

  const placedCount2D = Object.values(placed2D).filter(Boolean).length;
  const placedCount3D = Object.values(placed3D).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Brand: Arquitectura Von Neumann + IES Beatriz Galindo La Latina */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 border-2 border-cyan-300">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                  Arquitectura <span className="text-cyan-400">Von Neumann</span>
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wider text-amber-300 bg-amber-950/90 border border-amber-500/50 rounded-full shadow-sm">
                  IES Beatriz Galindo La Latina
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Completa primero el Puzzle 2D para desbloquear el Taller 3D y obtener tu diploma grabado
              </p>
            </div>
          </div>

          {/* Level Switcher: Level 1 (2D Puzzle) vs Level 2 (3D Studio) */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {/* Level 1: Puzzle 2D */}
            <button
              onClick={() => {
                sounds.playClick();
                setViewMode('2d');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Nivel 1: Puzzle 2D</span>
              {is2DCompleted && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Nivel superado" />
              )}
            </button>

            {/* Level 2: 3D Studio (Locked until 2D is finished) */}
            <button
              onClick={() => {
                if (!is3DUnlocked) {
                  sounds.playError();
                  showToast('🔒 Completa y comprueba primero el Puzzle 2D para desbloquear el Taller 3D.', 'error');
                  return;
                }
                sounds.playClick();
                setViewMode('3d');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : is3DUnlocked
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-500 hover:text-slate-400 cursor-not-allowed opacity-80'
              }`}
              title={is3DUnlocked ? 'Taller 3D desbloqueado' : 'Bloqueado: Completa primero el Puzzle 2D'}
            >
              {is3DUnlocked ? (
                <Box className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Nivel 2: Taller 3D</span>
              {!is3DUnlocked && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 font-mono">
                  Bloqueado
                </span>
              )}
              {is3DCompleted && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Nivel superado" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Diploma / Certification button */}
            {is3DCompleted && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowCertificateModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                title="Ver diploma y placa grabada"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Diploma / Captura</span>
              </button>
            )}

            {viewMode === '2d' && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowLiveTestModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Comprobar 2D</span>
                <span className="sm:hidden">Comprobar</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Guía de uso"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {viewMode === '3d' && (
              <button
                onClick={() => {
                  sounds.playClick();
                  if (sceneRef.current) {
                    sceneRef.current.resetCamera();
                  }
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Centrar vista 3D"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col">
        {viewMode === '2d' ? (
          /* =========================================================
             LEVEL 1: 2D PUZZLE VIEW (Independent state: placed2D)
             ========================================================= */
          <div className="relative flex-1">
            <PuzzleBoard
              placedPieces={placed2D}
              onPlacePiece={handlePlace2D}
              onRemovePiece={handleRemove2D}
              onClearAll={handleClear2D}
              onOpenPieceInfo={(pieceId) => setActiveInfoPieceId(pieceId)}
              onRunTest={() => setShowLiveTestModal(true)}
            />
          </div>
        ) : (
          /* =========================================================
             LEVEL 2: 3D STUDIO VIEW (Independent state: placed3D)
             ========================================================= */
          <div className="relative flex-1 w-full h-[calc(100vh-62px)] min-h-[580px]">
            <ThreeCanvas
              onSceneReady={(scene) => {
                sceneRef.current = scene;
                if (studentName) {
                  scene.setStudentName(studentName, studentGroup);
                }
              }}
              placedPieces={placed3D}
              selectedPieceId={selectedPieceId}
              onSelectPiece={(pieceId) => {
                sounds.playClick();
                setSelectedPieceId(pieceId);
              }}
              onPieceMountChanged={handlePieceMountChanged3D}
              onWrongSlotClicked={(attempted, target) => {
                sounds.playError();
                showToast(`"${PUZZLE_PIECES[attempted]?.name}" no encaja aquí. ¡Colócala en ${PUZZLE_PIECES[target]?.name}!`, 'error');
              }}
            />

            {/* Floating Toast Notification for 3D interactions */}
            {toastMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
                <div className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md ${
                  toastMsg.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-950/50'
                    : toastMsg.type === 'info'
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-100 shadow-cyan-950/50'
                    : 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-950/50'
                }`}>
                  <span>{toastMsg.type === 'success' ? '✨' : toastMsg.type === 'info' ? 'ℹ️' : '💡'}</span>
                  <span>{toastMsg.text}</span>
                </div>
              </div>
            )}

            {/* Piece Inspector Card on selection in 3D */}
            <PieceInspectorOverlay
              selectedPieceId={selectedPieceId}
              isMounted={selectedPieceId ? !!placed3D[selectedPieceId] : false}
              onToggleMount={handleTogglePieceMount3D}
              onClose={() => setSelectedPieceId(null)}
            />

            {/* Bottom Unified Control Dock */}
            <SketchUpToolbar
              onSetCameraView={(view) => {
                if (sceneRef.current) sceneRef.current.setCameraView(view);
              }}
              onExplodedChange={(val) => {
                if (sceneRef.current) sceneRef.current.setExplodedView(val);
              }}
              onClearAll={handleClear3D}
              onRunTest={() => {
                if (sceneRef.current) sceneRef.current.isSimulating = true;
                setShowLiveTestModal(true);
              }}
              isAllPlaced={placedCount3D === 7}
              placedCount={placedCount3D}
            />
          </div>
        )}
      </main>

      {/* Live Verification & Boot Test Modal */}
      {showLiveTestModal && (
        <ComputerLiveTest
          placedPieces={viewMode === '2d' ? placed2D : placed3D}
          onClose={() => {
            if (sceneRef.current) sceneRef.current.isSimulating = false;
            setShowLiveTestModal(false);
          }}
          onOpenPieceHelp={(pieceId) => {
            setShowLiveTestModal(false);
            setActiveInfoPieceId(pieceId);
          }}
          onCompleteSuccess={() => {
            setShowLiveTestModal(false);
            if (viewMode === '2d') {
              setIs2DCompleted(true);
              setIs3DUnlocked(true);
              setShowUnlock3DModal(true);
            } else {
              setIs3DCompleted(true);
              setShowCertificateModal(true);
            }
          }}
          actionButtonLabel={
            viewMode === '2d' 
              ? '🎉 ¡Desbloquear Nivel 2: Taller 3D!' 
              : '🎓 ¡Grabar mi Nombre y Descargar Diploma!'
          }
        />
      )}

      {/* Unlock 3D Level Modal (Celebrates Level 1 completion) */}
      <Unlock3DModal
        isOpen={showUnlock3DModal}
        onProceedTo3D={() => {
          setShowUnlock3DModal(false);
          setViewMode('3d');
          sounds.playSnap();
          showToast('¡Bienvenido al Taller 3D! Monta la placa base desde cero.', 'success');
        }}
        onStayIn2D={() => setShowUnlock3DModal(false)}
      />

      {/* Official Certificate & Motherboard Engraving Modal (Celebrates Level 2 completion) */}
      <CertificateModal
        isOpen={showCertificateModal}
        studentName={studentName}
        studentGroup={studentGroup}
        onUpdateStudentName={handleUpdateStudentName}
        onClose={() => setShowCertificateModal(false)}
        onFocusPlateIn3D={() => {
          setViewMode('3d');
          handleFocusPlateIn3D();
        }}
        get3DScreenshot={() => {
          if (sceneRef.current) {
            return sceneRef.current.getScreenshot();
          }
          return '';
        }}
      />

      {/* Piece Definition & Analogy Modal */}
      <SimpleExplainerModal
        piece={activeInfoPieceId ? PUZZLE_PIECES[activeInfoPieceId] : null}
        onClose={() => setActiveInfoPieceId(null)}
      />

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
