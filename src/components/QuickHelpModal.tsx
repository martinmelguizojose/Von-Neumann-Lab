import React from 'react';
import { X, Sparkles, Cpu, Play, CheckCircle2 } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                ¿Cómo jugar al Puzzle de Von Neumann?
              </h3>
              <p className="text-[11px] text-slate-400">
                Instrucciones fáciles para el alumnado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 text-sm block">1. Arrastra las piezas a sus zócalos</span>
            <p className="leading-relaxed">
              En la bandeja de la derecha tienes las piezas del ordenador. Arrástralas con el ratón o el dedo a su silueta correspondiente en la placa base verde.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 text-sm block">2. Monta el interior de la CPU</span>
            <p className="leading-relaxed">
              Primero coloca la <strong>CPU</strong> en su zócalo dorado. Al colocarla, verás que dentro tiene 3 huecos para sus piezas vitales: la <strong>ALU</strong> (la calculadora), la <strong>Unidad de Control</strong> (el director) y los <strong>Registros</strong> (los bolsillos rápidos).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400 text-sm block">3. Conecta la Memoria, la E/S y los Buses</span>
            <p className="leading-relaxed">
              Coloca la <strong>Memoria Principal</strong> (para guardar datos), las <strong>Interfaces de Entrada y Salida</strong> (teclado y pantalla) y los <strong>Buses</strong> (los cables por donde viaja la información).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 text-sm block">4. ¡Pulsa el botón verde para probar!</span>
            <p className="leading-relaxed">
              Pulsa <strong>"¡COMPROBAR Y ENCENDER!"</strong>. Si todo está bien montado, el ordenador encenderá y verás una animación de cómo suma <strong>2 + 3 = 5</strong> y lo muestra en pantalla. Si falta algo, ¡te dirá qué pieza te has olvidado!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            ¡Entendido, a jugar! 🎮
          </button>
        </div>
      </div>
    </div>
  );
};
