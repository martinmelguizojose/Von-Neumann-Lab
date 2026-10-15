import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Tv, 
  ArrowRight, 
  Star, 
  Smile, 
  X,
  Volume2
} from 'lucide-react';
import { PlacedPiecesState } from '../types/puzzle';
import { PUZZLE_PIECES } from '../data/puzzlePieces';
import { sounds } from '../utils/soundEffects';

interface ComputerLiveTestProps {
  placedPieces: PlacedPiecesState;
  onClose: () => void;
  onOpenPieceHelp: (pieceId: string) => void;
  onCompleteSuccess?: () => void;
  actionButtonLabel?: string;
}

export const ComputerLiveTest: React.FC<ComputerLiveTestProps> = ({
  placedPieces,
  onClose,
  onOpenPieceHelp,
  onCompleteSuccess,
  actionButtonLabel
}) => {
  // Check completion
  const missingPieces = Object.entries(placedPieces)
    .filter(([_, isPlaced]) => !isPlaced)
    .map(([id]) => PUZZLE_PIECES[id]);

  const isComplete = missingPieces.length === 0;

  // Animation phase for the functioning computer
  // 0: Boot, 1: Entrada (Teclado), 2: Bus a CPU, 3: UC coordina, 4: ALU calcula, 5: Memoria guarda, 6: Pantalla muestra
  const [animStep, setAnimStep] = useState<number>(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(false);

  useEffect(() => {
    if (isComplete) {
      sounds.playSuccess();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
      setIsPlayingAnim(true);
      setAnimStep(1);
    } else {
      sounds.playError();
    }
  }, [isComplete]);

  // Run automatic animation sequence if complete
  useEffect(() => {
    if (!isComplete || !isPlayingAnim) return;

    if (animStep >= 1 && animStep < 6) {
      const timer = setTimeout(() => {
        sounds.playBusPulse();
        setAnimStep(prev => prev + 1);
      }, 1600);
      return () => clearTimeout(timer);
    } else if (animStep === 6) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
      } catch {
        // Fallback
      }
    }
  }, [animStep, isPlayingAnim, isComplete]);

  const handleRestartAnim = () => {
    sounds.playClick();
    setAnimStep(1);
    setIsPlayingAnim(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isComplete ? (
          /* SUCCESS: Computer is functioning! */
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>¡Arquitectura de Von Neumann Completa y Funcional!</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center justify-center gap-2">
                <span>¡EL ORDENADOR ESTÁ ENCENDIDO!</span>
                <span className="text-2xl">🎉</span>
              </h3>
              <p className="text-slate-300 text-sm max-w-lg mx-auto">
                Mira cómo colaboran todas las piezas que has colocado para sumar <strong>2 + 3</strong> y mostrar el resultado en la pantalla.
              </p>
            </div>

            {/* Interactive Screen Display Simulation */}
            <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              {/* Retro scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />

              <div className="relative z-10 space-y-4">
                {/* Step badge */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                  <span>CICLO DE COMPUTACIÓN</span>
                  <span className="text-cyan-400 font-bold">PASO {animStep} DE 6</span>
                </div>

                {/* Animated visual stage */}
                <div className="py-4 min-h-[140px] flex flex-col items-center justify-center">
                  {animStep === 1 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-4xl">⌨️ ➡️ 2️⃣ , 3️⃣</div>
                      <h4 className="font-bold text-purple-400 text-base">
                        1. Entrada (Teclado)
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        Tú pulsas los números <strong>2</strong> y <strong>3</strong> en el teclado. La Interfaz de Entrada los convierte en impulsos eléctricos.
                      </p>
                    </div>
                  )}

                  {animStep === 2 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-4xl">🛣️ ⚡ ⚡ ⚡</div>
                      <h4 className="font-bold text-cyan-400 text-base">
                        2. Los Buses del Sistema (Autopistas Rectas)
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        Los datos viajan por el <strong>Bus directo CPU &harr; E/S (verde)</strong> y el <strong>Bus Troncal General (rojo/dorado)</strong> que comunica todo el sistema con la CPU.
                      </p>
                    </div>
                  )}

                  {animStep === 3 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-4xl">🚦 🗣️ "¡A sumar!"</div>
                      <h4 className="font-bold text-rose-400 text-base">
                        3. La Unidad de Control (UC)
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        El director de orquesta lee la instrucción y le ordena a la ALU: <em>"¡Prepara una suma!"</em>. Los <strong>Registros</strong> sostienen el 2 y el 3.
                      </p>
                    </div>
                  )}

                  {animStep === 4 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-4xl">🧮 2 + 3 = 5 💡</div>
                      <h4 className="font-bold text-green-400 text-base">
                        4. La ALU (Calculadora)
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        La ALU hace la operación matemática en un instante: <strong>2 + 3 = 5</strong>. El resultado 5 queda listo en el registro acumulador.
                      </p>
                    </div>
                  )}

                  {animStep === 5 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-4xl">💾 🗄️ [Celda 0x01] = 5</div>
                      <h4 className="font-bold text-emerald-400 text-base">
                        5. Memoria Principal (RAM)
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        A través del bus, el número <strong>5</strong> se almacena en la estantería de la Memoria RAM para no perderlo.
                      </p>
                    </div>
                  )}

                  {animStep === 6 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <div className="text-5xl">🖥️ ✨ 5 ✨</div>
                      <h4 className="font-bold text-emerald-300 text-lg">
                        6. Salida en Pantalla: ¡Éxito Total!
                      </h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        La interfaz de salida manda el 5 al monitor. ¡Tu ordenador Von Neumann funciona como los de verdad!
                      </p>
                    </div>
                  )}
                </div>

                {/* Step indicator bubbles */}
                <div className="flex justify-center items-center gap-2 pt-2 border-t border-slate-900">
                  {[1, 2, 3, 4, 5, 6].map(step => (
                    <button
                      key={step}
                      onClick={() => {
                        sounds.playClick();
                        setAnimStep(step);
                      }}
                      className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                        animStep === step
                          ? 'bg-cyan-500 text-slate-950 scale-110 shadow-lg shadow-cyan-500/50'
                          : animStep > step
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stars & Replay */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xs font-bold text-slate-200 ml-1">
                  ¡Arquitectura Superada!
                </span>
              </div>

                <button
                  onClick={handleRestartAnim}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir Animación</span>
                </button>

                {onCompleteSuccess ? (
                  <button
                    onClick={() => {
                      onClose();
                      onCompleteSuccess();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{actionButtonLabel || '¡Continuar al Siguiente Nivel!'}</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105"
                  >
                    Seguir Jugando
                  </button>
                )}
              </div>
            </div>
        ) : (
          /* INCOMPLETE: Friendly diagnostics for kids */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  ¡El ordenador aún no puede arrancar!
                </h3>
                <p className="text-xs text-slate-300">
                  Le faltan piezas esenciales de la Arquitectura de Von Neumann. ¡Mira cuáles son y arrástralas al tablero!
                </p>
              </div>
            </div>

            {/* List of missing pieces */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Piezas que faltan por colocar ({missingPieces.length}):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {missingPieces.map(piece => (
                  <div
                    key={piece.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <h4 className="font-bold text-xs text-white">
                          {piece.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {piece.category === 'cpu_interior' ? 'Dentro de la CPU' : 'En la Placa Base'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenPieceHelp(piece.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold"
                    >
                      ¿Qué es?
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
              💡 <strong>Pista para el alumno:</strong> Para que funcione un ordenador Von Neumann necesitas: 
              la <strong>CPU</strong> (con la <strong>ALU</strong>, la <strong>Unidad de Control</strong> y los <strong>Registros</strong> dentro), 
              la <strong>Memoria RAM</strong>, la <strong>Entrada/Salida</strong> y los <strong>Buses</strong> de conexión.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-colors"
              >
                Volver a colocar piezas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
