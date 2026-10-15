import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
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
  Sparkles,
  Lightbulb,
  History
} from 'lucide-react';
import { COMPONENT_INFO } from '../data/educationalContent';
import { ComponentInfo } from '../types/vonNeumann';
import { sounds } from '../utils/soundEffects';

interface EncyclopediaViewProps {
  onSelectComponentForInspect?: (id: string) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = () => {
  const [filter, setFilter] = useState<'ALL' | 'Sistema' | 'CPU Interno' | 'Buses'>('ALL');
  const [selectedComp, setSelectedComp] = useState<ComponentInfo>(COMPONENT_INFO['cpu']);

  const componentsList = Object.values(COMPONENT_INFO);
  const filteredList = filter === 'ALL' ? componentsList : componentsList.filter(c => c.category === filter);

  const getComponentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-purple-400" />;
      case 'ArrowLeftRight': return <ArrowLeftRight className="w-5 h-5 text-cyan-400" />;
      case 'ArrowRight': return <ArrowRight className="w-5 h-5 text-purple-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-yellow-400" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-emerald-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-rose-400" />;
      case 'ListOrdered': return <ListOrdered className="w-5 h-5 text-blue-400" />;
      case 'FileCode': return <FileCode className="w-5 h-5 text-amber-400" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-purple-400" />;
      case 'Inbox': return <Inbox className="w-5 h-5 text-teal-400" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-pink-400" />;
      default: return <HelpCircle className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-display font-bold text-white">
              Enciclopedia & Fichas Didácticas de la Arquitectura
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Aprende qué hace cada pieza, sus analogías con la vida cotidiana y por qué todos los ordenadores y smartphones modernos siguen este modelo.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {[
            { label: 'Todas', value: 'ALL' },
            { label: 'Sistema', value: 'Sistema' },
            { label: 'Dentro de CPU', value: 'CPU Interno' },
            { label: 'Buses', value: 'Buses' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                sounds.playClick();
                setFilter(tab.value as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.value
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Note: John von Neumann and 1945 */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
          <History className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
            <span>¿Quién fue John von Neumann y qué inventó en 1945?</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-mono">
              Hito Histórico
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            John von Neumann (1903–1957) fue un brillante matemático e ingeniero que propuso una idea revolucionaria:
            <strong> el concepto de programa almacenado</strong>. Antes de él, para que un ordenador hiciese una tarea diferente, los ingenieros debían recablear manualmente miles de cables.
            Von Neumann demostró que las <strong>instrucciones de un programa</strong> podían guardarse en la misma memoria <strong>RAM</strong> que los datos numéricos, permitiendo que un ordenador ejecute cualquier software cambiando simplemente lo que hay en memoria.
          </p>
        </div>
      </div>

      {/* Main Content Area: Side list + Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Cards list (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredList.map((comp) => {
            const isSelected = selectedComp.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => {
                  sounds.playSnap();
                  setSelectedComp(comp);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-850 border-amber-400/80 shadow-lg shadow-amber-950/30 scale-[1.01]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {getComponentIcon(comp.icon)}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                      {comp.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Categoría: {comp.category}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'
                }`}>
                  {isSelected ? 'Leyendo' : 'Ver'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right column: Selected Component Deep Dive (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl relative space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40">
                {getComponentIcon(selectedComp.icon)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                  {selectedComp.category}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  {selectedComp.name}
                </h3>
              </div>
            </div>

            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
              ID: {selectedComp.id.toUpperCase()}
            </span>
          </div>

          {/* Definition */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>¿Qué es y cuál es su misión?</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              {selectedComp.summary}
            </p>
          </div>

          {/* Everyday Life Analogy (ESO Focused) */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Analogía con la vida real (Para entenderlo fácil):</span>
            </h4>
            <div className="text-xs sm:text-sm text-amber-100/90 leading-relaxed bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl">
              {selectedComp.analogy}
            </div>
          </div>

          {/* Key characteristics bullets */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Detalles técnicos y funcionamiento:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {selectedComp.details.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Role in Instruction Cycle */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
            <strong className="text-cyan-300 block mb-1">
              Papel durante el ciclo de instrucción (Fetch &rarr; Decode &rarr; Execute):
            </strong>
            {selectedComp.roleInCycle}
          </div>
        </div>
      </div>
    </div>
  );
};
