import React from 'react';
import { 
  Calculator, 
  Sliders, 
  MapPin, 
  ListOrdered, 
  FileCode, 
  Inbox, 
  Boxes, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { RegisterState, AluState, ControlUnitState, CpuInternalType } from '../types/vonNeumann';
import { COMPONENT_INFO } from '../data/educationalContent';
import { sounds } from '../utils/soundEffects';

interface CpuInternalInspectorProps {
  installedParts: Record<CpuInternalType, boolean>;
  onTogglePart?: (part: CpuInternalType) => void;
  registers: RegisterState;
  alu: AluState;
  controlUnit: ControlUnitState;
  onOpenInfo: (componentId: string) => void;
  isInteractiveInstall?: boolean;
  onClose?: () => void;
}

export const CpuInternalInspector: React.FC<CpuInternalInspectorProps> = ({
  installedParts,
  onTogglePart,
  registers,
  alu,
  controlUnit,
  onOpenInfo,
  isInteractiveInstall = false,
  onClose
}) => {
  const partsList: { id: CpuInternalType; name: string; role: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'cu',
      name: 'Unidad de Control (UC)',
      role: 'Director de orquesta: decodifica instrucciones y emite señales de sincronización.',
      icon: <Sliders className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300'
    },
    {
      id: 'alu',
      name: 'Unidad Aritmético-Lógica (ALU)',
      role: 'Calculadora interna: suma, resta y realiza operaciones lógicas.',
      icon: <Calculator className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
    },
    {
      id: 'pc',
      name: 'Contador de Programa (PC)',
      role: 'Apunta a la celda de memoria de la siguiente instrucción a ejecutar.',
      icon: <ListOrdered className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300'
    },
    {
      id: 'ir',
      name: 'Registro de Instrucción (IR)',
      role: 'Guarda la instrucción en ejecución para que la UC la decodifique.',
      icon: <FileCode className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300'
    },
    {
      id: 'mar',
      name: 'Reg. Dirección Memoria (MAR)',
      role: 'Almacena la dirección que viajará por el Bus de Direcciones.',
      icon: <MapPin className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300'
    },
    {
      id: 'mdr',
      name: 'Reg. Datos Memoria (MDR)',
      role: 'Retiene los datos o instrucciones que entran o salen por el Bus de Datos.',
      icon: <Inbox className="w-5 h-5 text-teal-400" />,
      color: 'border-teal-500/40 bg-teal-950/20 text-teal-300'
    },
    {
      id: 'acc',
      name: 'Acumulador (ACC)',
      role: 'Almacena los operandos y el resultado inmediato de las operaciones de la ALU.',
      icon: <Boxes className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/40 bg-pink-950/20 text-pink-300'
    }
  ];

  const allPartsInstalled = Object.values(installedParts).every(Boolean);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Silicon wafer texture effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                Interior de la CPU (Procesador)
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Microarquitectura
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Observa y comprende la cooperación entre la Unidad de Control, la ALU y los Registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Assembly helper banner if in install mode */}
      {isInteractiveInstall && (
        <div className="relative z-10 my-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Taller de la CPU:</strong> Haz clic en cada pieza para instalarla o quitarla de la pastilla de silicio.
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playSuccess();
              if (onTogglePart) {
                (Object.keys(installedParts) as CpuInternalType[]).forEach(k => {
                  if (!installedParts[k]) onTogglePart(k);
                });
              }
            }}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs whitespace-nowrap transition-colors"
          >
            Instalar Todas
          </button>
        </div>
      )}

      {/* Grid of CPU Sections */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        {/* 1. Unidad de Control (Left Side - 4 cols) */}
        <div className={`lg:col-span-4 rounded-xl border p-4 transition-all ${
          installedParts.cu 
            ? 'bg-slate-950/80 border-rose-500/40 shadow-lg shadow-rose-950/20' 
            : 'bg-slate-950/40 border-dashed border-slate-700 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-bold text-sm text-rose-300">
                Unidad de Control (UC)
              </h3>
            </div>
            <button
              onClick={() => onOpenInfo('cu')}
              className="text-slate-400 hover:text-rose-300"
              title="Ver definición y analogía"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {installedParts.cu ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Fase del Ciclo de Reloj:
                </span>
                <div className="mt-1 flex items-center gap-2 font-mono font-bold text-sm text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{controlUnit.phase || 'IDLE (En Espera)'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Acción Actual del Decodificador:
                </span>
                <p className="mt-1 text-slate-200 text-xs leading-relaxed">
                  {controlUnit.stepDescription || 'Esperando inicio del ciclo de reloj...'}
                </p>
              </div>

              {/* Micro-signals active */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Líneas de Control Activas:
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalAddressBus ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>ADDR_ENABLE</span>
                    <span>{controlUnit.microSignalAddressBus ? '1' : '0'}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalDataBus ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>DATA_ENABLE</span>
                    <span>{controlUnit.microSignalDataBus ? '1' : '0'}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalControlRead ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>READ_RAM</span>
                    <span>{controlUnit.microSignalControlRead ? '1' : '0'}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalControlWrite ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>WRITE_RAM</span>
                    <span>{controlUnit.microSignalControlWrite ? '1' : '0'}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalAluActive ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>ALU_CALC</span>
                    <span>{controlUnit.microSignalAluActive ? '1' : '0'}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center justify-between ${
                    controlUnit.microSignalIoWrite || controlUnit.microSignalIoRead ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-500/40' : 'bg-slate-800/40 text-slate-500'
                  }`}>
                    <span>IO_SIGNAL</span>
                    <span>{controlUnit.microSignalIoWrite || controlUnit.microSignalIoRead ? '1' : '0'}</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs">Unidad de Control no instalada</p>
              {isInteractiveInstall && onTogglePart && (
                <button
                  onClick={() => onTogglePart('cu')}
                  className="mt-3 px-3 py-1.5 bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs hover:bg-rose-600/50"
                >
                  Instalar UC
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Registros Internos (Middle - 4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-cyan-300">
                Banco de Registros
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Memoria Ultrarrápida
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* PC Register */}
            <div className={`p-2 rounded-lg border transition-all ${
              installedParts.pc ? 'bg-slate-900/90 border-blue-500/30' : 'border-dashed border-slate-700 opacity-40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-slate-200">PC (Contador de Programa)</span>
                </div>
                <button onClick={() => onOpenInfo('pc')} className="text-slate-500 hover:text-blue-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Próxima dirección:</span>
                <span className="px-2 py-0.5 bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold rounded">
                  0x0{registers.pc} (Celda {registers.pc})
                </span>
              </div>
            </div>

            {/* IR Register */}
            <div className={`p-2 rounded-lg border transition-all ${
              installedParts.ir ? 'bg-slate-900/90 border-amber-500/30' : 'border-dashed border-slate-700 opacity-40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">IR (Registro Instrucción)</span>
                </div>
                <button onClick={() => onOpenInfo('ir')} className="text-slate-500 hover:text-amber-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Instrucción actual:</span>
                <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold rounded text-[11px]">
                  {registers.ir || 'VACÍO'}
                </span>
              </div>
            </div>

            {/* MAR Register */}
            <div className={`p-2 rounded-lg border transition-all ${
              installedParts.mar ? 'bg-slate-900/90 border-purple-500/30' : 'border-dashed border-slate-700 opacity-40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-bold text-slate-200">MAR (Reg. Dirección Memoria)</span>
                </div>
                <button onClick={() => onOpenInfo('mar')} className="text-slate-500 hover:text-purple-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Dirección solicitada:</span>
                <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold rounded">
                  0x0{registers.mar}
                </span>
              </div>
            </div>

            {/* MDR Register */}
            <div className={`p-2 rounded-lg border transition-all ${
              installedParts.mdr ? 'bg-slate-900/90 border-teal-500/30' : 'border-dashed border-slate-700 opacity-40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-bold text-slate-200">MDR (Reg. Datos Memoria)</span>
                </div>
                <button onClick={() => onOpenInfo('mdr')} className="text-slate-500 hover:text-teal-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Dato en tránsito:</span>
                <span className="px-2 py-0.5 bg-teal-950/80 border border-teal-500/40 text-teal-300 font-bold rounded text-[11px]">
                  {registers.mdr || 'VACÍO'}
                </span>
              </div>
            </div>

            {/* Accumulator (ACC) */}
            <div className={`p-2 rounded-lg border transition-all ${
              installedParts.acc ? 'bg-slate-900/90 border-pink-500/30' : 'border-dashed border-slate-700 opacity-40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-bold text-slate-200">ACC (Acumulador)</span>
                </div>
                <button onClick={() => onOpenInfo('acc')} className="text-slate-500 hover:text-pink-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">Resultado actual:</span>
                <span className="px-2 py-0.5 bg-pink-950/80 border border-pink-500/40 text-pink-300 font-bold rounded text-sm">
                  {registers.acc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALU (Right Side - 4 cols) */}
        <div className={`lg:col-span-4 rounded-xl border p-4 transition-all ${
          installedParts.alu 
            ? 'bg-slate-950/80 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
            : 'bg-slate-950/40 border-dashed border-slate-700 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-bold text-sm text-emerald-300">
                ALU (Unidad Aritmético-Lógica)
              </h3>
            </div>
            <button
              onClick={() => onOpenInfo('alu')}
              className="text-slate-400 hover:text-emerald-300"
              title="Ver definición y analogía"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {installedParts.alu ? (
            <div className="space-y-3 text-xs">
              {/* ALU Visual V-Shape Diagram */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                {/* Inputs */}
                <div className="flex justify-between w-full px-4 mb-2 text-center font-mono">
                  <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Operando A</span>
                    <span className="text-emerald-300 font-bold">{alu.operandA}</span>
                  </div>
                  <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Operando B</span>
                    <span className="text-emerald-300 font-bold">{alu.operandB}</span>
                  </div>
                </div>

                {/* V shape graphic for ALU */}
                <div className={`w-36 py-2 px-3 text-center rounded-lg border font-mono font-bold transition-all ${
                  alu.active
                    ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 animate-pulse shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}>
                  <span className="text-xs block">OPERACIÓN</span>
                  <span className="text-base text-emerald-400">{alu.operation !== 'IDLE' ? alu.operation : 'ESPERA'}</span>
                </div>

                {/* Arrow down to result */}
                <div className="w-0.5 h-3 bg-emerald-500/60 my-1" />

                {/* Result output */}
                <div className="bg-emerald-950/80 border border-emerald-500/40 px-4 py-1.5 rounded-lg text-center font-mono w-full">
                  <span className="text-[10px] text-slate-400 block">Resultado Salida</span>
                  <span className="text-base text-emerald-300 font-bold">{alu.result}</span>
                </div>
              </div>

              {/* Status Flags */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Banderas de Estado (Flags):
                </span>
                <div className="flex gap-2 mt-2">
                  <div className={`flex-1 p-1.5 rounded border text-center font-mono ${
                    alu.flagZero ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-slate-800/30 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-[10px] block">Flag Cero (Z)</span>
                    <span className="font-bold">{alu.flagZero ? '1 (Activo)' : '0'}</span>
                  </div>
                  <div className={`flex-1 p-1.5 rounded border text-center font-mono ${
                    alu.flagNegative ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-slate-800/30 border-slate-800 text-slate-500'
                  }`}>
                    <span className="text-[10px] block">Flag Negativo (N)</span>
                    <span className="font-bold">{alu.flagNegative ? '1 (Activo)' : '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs">ALU no instalada</p>
              {isInteractiveInstall && onTogglePart && (
                <button
                  onClick={() => onTogglePart('alu')}
                  className="mt-3 px-3 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs hover:bg-emerald-600/50"
                >
                  Instalar ALU
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assembly parts toggle bar if in install mode */}
      {isInteractiveInstall && onTogglePart && (
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-2">
            Interruptores de piezas de la CPU (Montaje individual):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {partsList.map(part => {
              const installed = installedParts[part.id];
              return (
                <button
                  key={part.id}
                  onClick={() => {
                    sounds.playSnap();
                    onTogglePart(part.id);
                  }}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    installed
                      ? 'bg-slate-800 border-emerald-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {part.icon}
                    {installed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] font-display">{part.id.toUpperCase()}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${installed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {installed ? 'Instalado' : 'Falta'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
