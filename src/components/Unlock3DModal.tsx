import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Box, 
  Award, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Unlock3DModalProps {
  isOpen: boolean;
  onProceedTo3D: () => void;
  onStayIn2D: () => void;
}

export const Unlock3DModal: React.FC<Unlock3DModalProps> = ({
  isOpen,
  onProceedTo3D,
  onStayIn2D
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playFanfare();
      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback if canvas-confetti is not loaded
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-emerald-500/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-center space-y-5">
        
        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold font-mono tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fase 1: Puzzle 2D Superado con Éxito</span>
        </div>

        {/* Big icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 text-white border-2 border-emerald-200">
          <Box className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wide">
            ¡Taller 3D Desbloqueado!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Has ensamblado y comprobado correctamente todos los bloques de la <strong>Arquitectura de Von Neumann</strong> en 2D.
          </p>
        </div>

        {/* Level 2 challenge briefing */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Misión de la Fase 2: Taller 3D Profesional</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            Ahora debes montar el ordenador <strong>en tres dimensiones desde cero</strong> en la bancada de trabajo.
          </p>
          <div className="pt-1 flex items-center gap-2 text-amber-300 font-semibold">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Al completar el 3D podrás grabar tu nombre en la placa base y descargar tu acreditación oficial para el profesor.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onStayIn2D();
            }}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Quedarme en el Puzzle 2D
          </button>

          <button
            onClick={() => {
              sounds.playSnap();
              onProceedTo3D();
            }}
            className="w-full sm:w-auto flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-display font-bold text-sm shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Ir al Taller 3D (Montar desde cero)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
