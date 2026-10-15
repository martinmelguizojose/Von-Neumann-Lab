import React from 'react';
import { 
  X, 
  Lightbulb, 
  Sparkles, 
  Cpu, 
  Database, 
  Radio, 
  ArrowLeftRight, 
  ArrowRight, 
  Activity, 
  Calculator, 
  Sliders, 
  ListOrdered, 
  FileCode, 
  MapPin, 
  Inbox, 
  Boxes,
  HelpCircle
} from 'lucide-react';
import { COMPONENT_INFO } from '../data/educationalContent';

interface ComponentInfoModalProps {
  componentId: string | null;
  onClose: () => void;
}

export const ComponentInfoModal: React.FC<ComponentInfoModalProps> = ({ componentId, onClose }) => {
  if (!componentId) return null;
  const comp = COMPONENT_INFO[componentId];
  if (!comp) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-400" />;
      case 'Database': return <Database className="w-6 h-6 text-emerald-400" />;
      case 'Radio': return <Radio className="w-6 h-6 text-purple-400" />;
      case 'ArrowLeftRight': return <ArrowLeftRight className="w-6 h-6 text-cyan-400" />;
      case 'ArrowRight': return <ArrowRight className="w-6 h-6 text-purple-400" />;
      case 'Activity': return <Activity className="w-6 h-6 text-yellow-400" />;
      case 'Calculator': return <Calculator className="w-6 h-6 text-emerald-400" />;
      case 'Sliders': return <Sliders className="w-6 h-6 text-rose-400" />;
      case 'ListOrdered': return <ListOrdered className="w-6 h-6 text-blue-400" />;
      case 'FileCode': return <FileCode className="w-6 h-6 text-amber-400" />;
      case 'MapPin': return <MapPin className="w-6 h-6 text-purple-400" />;
      case 'Inbox': return <Inbox className="w-6 h-6 text-teal-400" />;
      case 'Boxes': return <Boxes className="w-6 h-6 text-pink-400" />;
      default: return <HelpCircle className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              {getIcon(comp.icon)}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                {comp.category}
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                {comp.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            ¿Qué es?
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            {comp.summary}
          </p>
        </div>

        {/* Everyday Life Analogy */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Analogía didáctica de la vida real:
          </span>
          <div className="text-xs sm:text-sm text-amber-100/90 leading-relaxed bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
            {comp.analogy}
          </div>
        </div>

        {/* Key bullets */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Aspectos clave:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {comp.details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cycle Role */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
          <strong className="text-cyan-300 block mb-1">
            Papel en el ciclo de reloj:
          </strong>
          {comp.roleInCycle}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
