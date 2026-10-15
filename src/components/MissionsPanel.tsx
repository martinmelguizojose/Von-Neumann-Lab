import React from 'react';
import confetti from 'canvas-confetti';
import { 
  Target, 
  Star, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  Cpu, 
  Network, 
  Monitor, 
  HelpCircle 
} from 'lucide-react';
import { Mission, ComponentType, CpuInternalType } from '../types/vonNeumann';
import { sounds } from '../utils/soundEffects';

interface MissionsPanelProps {
  missions: Mission[];
  systemComponents: Record<ComponentType, boolean>;
  cpuInternalParts: Record<CpuInternalType, boolean>;
  onGoToBuilder: () => void;
  onGoToSimulator: () => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  systemComponents,
  cpuInternalParts,
  onGoToBuilder,
  onGoToSimulator
}) => {
  // Check dynamically if missions criteria are met
  const isMission1Done = systemComponents.cpu && systemComponents.ram && systemComponents.data_bus;
  const isMission2Done = systemComponents.cpu && cpuInternalParts.alu && cpuInternalParts.cu && cpuInternalParts.pc && cpuInternalParts.ir && cpuInternalParts.mar && cpuInternalParts.mdr && cpuInternalParts.acc;
  const isMission3Done = systemComponents.data_bus && systemComponents.address_bus && systemComponents.control_bus;
  const isMission4Done = systemComponents.io_interface && isMission1Done && isMission3Done;
  const isMission5Done = missions[4]?.completed || false;

  const missionStatus = [isMission1Done, isMission2Done, isMission3Done, isMission4Done, isMission5Done];
  const completedCount = missionStatus.filter(Boolean).length;
  const totalStars = completedCount * 3;

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Network': return <Network className="w-5 h-5 text-purple-400" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-emerald-400" />;
      default: return <Award className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-display font-bold text-white">
              Centro de Misiones y Desafíos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Supera los retos de construcción y experimentación para convertirte en un auténtico <strong>Arquitecto Von Neumann</strong>.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Progreso Total</div>
            <div className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-1.5">
              <span>{completedCount} / 5 Misiones</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-amber-300 text-sm font-mono">{totalStars} / 15</span>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((mission, index) => {
          const isDone = missionStatus[index];
          return (
            <div
              key={mission.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getBadgeIcon(mission.badgeIcon)}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        {mission.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Insignia: {mission.badgeName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          isDone
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
                  <strong>Objetivo:</strong> {mission.objective}
                </p>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 mb-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Concepto didáctico:
                  </span>
                  <p className="italic">{mission.concept}</p>
                </div>

                <div className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-lg flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Pista:</strong> {mission.hint}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                  isDone ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Completado!</span>
                    </>
                  ) : (
                    <span>Pendiente</span>
                  )}
                </span>

                <button
                  onClick={() => {
                    sounds.playClick();
                    if (mission.id === 5) {
                      onGoToSimulator();
                    } else {
                      onGoToBuilder();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  <span>{mission.id === 5 ? 'Ir a Simular' : 'Ir al Taller'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diploma or Final Reward Banner if all are completed */}
      {completedCount === 5 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 text-center space-y-3 shadow-2xl">
          <div className="inline-block p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-amber-200">
            ¡DIPLOMA DE ARQUITECTO VON NEUMANN OBTENIDO!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            ¡Enhorabuena! Has demostrado dominar los componentes, el flujo de datos y el funcionamiento interno 
            de la arquitectura que mueve los ordenadores de todo el planeta.
          </p>
          <button
            onClick={() => {
              sounds.playSuccess();
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            }}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl"
          >
            🎉 Celebrar con Confeti
          </button>
        </div>
      )}
    </div>
  );
};
