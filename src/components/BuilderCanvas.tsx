import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Cpu, 
  Database, 
  Radio, 
  ArrowLeftRight, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Wrench, 
  Sparkles, 
  Maximize2,
  Trash2,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ComponentType, CpuInternalType } from '../types/vonNeumann';
import { COMPONENT_INFO } from '../data/educationalContent';
import { sounds } from '../utils/soundEffects';
import { CpuInternalInspector } from './CpuInternalInspector';

interface BuilderCanvasProps {
  systemComponents: Record<ComponentType, boolean>;
  cpuInternalParts: Record<CpuInternalType, boolean>;
  onToggleComponent: (comp: ComponentType) => void;
  onToggleCpuPart: (part: CpuInternalType) => void;
  onAssembleAll: () => void;
  onClearAll: () => void;
  onOpenInfo: (id: string) => void;
  onGoToSimulator: () => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  systemComponents,
  cpuInternalParts,
  onToggleComponent,
  onToggleCpuPart,
  onAssembleAll,
  onClearAll,
  onOpenInfo,
  onGoToSimulator
}) => {
  const [showCpuModal, setShowCpuModal] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    tested: boolean;
    success: boolean;
    errors: string[];
    warnings: string[];
    successMessage?: string;
  } | null>(null);

  // Check how many CPU parts are installed
  const cpuPartsInstalledCount = Object.values(cpuInternalParts).filter(Boolean).length;
  const cpuFullyAssembled = cpuPartsInstalledCount === 7;

  // Run hardware diagnostic test (POST / BIOS test)
  const handleTestComputer = () => {
    sounds.playClick();
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!systemComponents.cpu) {
      errors.push('Falta la CPU (Procesador): El ordenador carece de cerebro central para procesar instrucciones.');
    } else {
      if (!cpuInternalParts.cu) {
        errors.push('Falta la Unidad de Control (UC) en la CPU: No hay director de orquesta que decodifique instrucciones ni gobierne el reloj.');
      }
      if (!cpuInternalParts.alu) {
        errors.push('Falta la ALU en la CPU: El ordenador no podrá calcular sumas, restas ni comparaciones lógicas.');
      }
      if (!cpuInternalParts.pc || !cpuInternalParts.ir || !cpuInternalParts.mar || !cpuInternalParts.mdr || !cpuInternalParts.acc) {
        errors.push('Faltan registros internos en la CPU: Se necesitan PC, IR, MAR, MDR y el Acumulador para retener datos temporales.');
      }
    }

    if (!systemComponents.ram) {
      errors.push('Falta la Memoria Principal (RAM): No hay espacio para almacenar conjuntamente el programa y los datos.');
    }

    if (!systemComponents.data_bus) {
      errors.push('Falta el Bus de Datos: No hay autopista física para transferir las instrucciones y datos entre la CPU y la Memoria.');
    }

    if (!systemComponents.address_bus) {
      errors.push('Falta el Bus de Direcciones: La CPU no puede indicar qué celda de la RAM desea leer o escribir.');
    }

    if (!systemComponents.control_bus) {
      errors.push('Falta el Bus de Control: La memoria no puede recibir las señales de LECTURA (Read) o ESCRITURA (Write).');
    }

    if (!systemComponents.io_interface) {
      warnings.push('Aviso de E/S: El ordenador puede calcular internamente, pero no tiene interfaces para comunicarse con teclado ni pantalla exterior.');
    }

    if (errors.length === 0) {
      sounds.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
      setDiagnosticResult({
        tested: true,
        success: true,
        errors: [],
        warnings,
        successMessage: '¡Excelente! Todos los componentes de la Arquitectura de Von Neumann están correctamente ensamblados y comunicados.'
      });
    } else {
      sounds.playError();
      setDiagnosticResult({
        tested: true,
        success: false,
        errors,
        warnings
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Instructions for ESO Students */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-400 border border-blue-500/30">
              <Wrench className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-display font-bold text-white">
              Taller de Ensamblaje: Placa Base Von Neumann
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Haz clic en los zócalos de la placa base o en el catálogo inferior para colocar cada componente. 
            Abre la <strong>CPU</strong> para equipar la <strong>ALU</strong>, la <strong>Unidad de Control</strong> y los <strong>Registros</strong>, y conecta los <strong>3 Buses</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              sounds.playSnap();
              onAssembleAll();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition-colors"
            title="Colocar todos los componentes a la vez"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ensamblado Rápido</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClearAll();
              setDiagnosticResult(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors"
            title="Quitar todas las piezas"
          >
            <Trash2 className="w-4 h-4" />
            <span>Desmontar</span>
          </button>

          <button
            onClick={handleTestComputer}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Probar Ordenador</span>
          </button>
        </div>
      </div>

      {/* Main Motherboard Area */}
      <div className="pcb-grid border-2 border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Motherboard decorative labels */}
        <div className="flex justify-between items-center mb-6 text-xs font-mono text-slate-400/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-widest text-slate-400">
              MOTHERBOARD ARCH_VN-1945 // REV 2.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Voltaje Bus: 3.3V</span>
            <span className="text-[11px] text-slate-400">Arquitectura: Harvard vs Von Neumann</span>
          </div>
        </div>

        {/* Board Sockets Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Socket 1: CPU (Col 1 to 5) */}
          <div className="md:col-span-5 flex flex-col">
            <div className={`flex-1 rounded-2xl border-2 p-5 transition-all relative ${
              systemComponents.cpu
                ? 'bg-slate-900/90 border-amber-500/60 shadow-xl shadow-amber-950/30'
                : 'bg-slate-950/60 border-dashed border-slate-700 hover:border-slate-500'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${systemComponents.cpu ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Zócalo CPU (Procesador)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Unidad Central de Procesamiento
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenInfo('cpu')}
                  className="p-1 rounded-lg text-slate-400 hover:text-amber-400"
                  title="Ficha educativa"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Status or Installation Slot */}
              {systemComponents.cpu ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Estado del microprocesador:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Instalado
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Piezas internas:</span>
                      <span className={`font-mono font-bold ${cpuFullyAssembled ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {cpuPartsInstalledCount}/7 ({cpuFullyAssembled ? 'Completo' : 'Incompleto'})
                      </span>
                    </div>

                    {/* Progress bar of CPU parts */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${cpuFullyAssembled ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        style={{ width: `${(cpuPartsInstalledCount / 7) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Button to open CPU Internal zoom */}
                  <button
                    onClick={() => {
                      sounds.playSnap();
                      setShowCpuModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 border border-amber-500/50 text-amber-200 text-xs font-bold transition-all shadow-md"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Inspeccionar / Montar Piezas Internas (ALU, UC, Registros)</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playSnap();
                      onToggleComponent('cpu');
                    }}
                    className="w-full py-1 text-slate-500 hover:text-rose-400 text-[11px] text-center"
                  >
                    Retirar CPU de la placa
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Zócalo vacío. Instala la CPU para dotar al ordenador de capacidad de cálculo.
                  </p>
                  <button
                    onClick={() => {
                      sounds.playSnap();
                      onToggleComponent('cpu');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-lg shadow-amber-600/30"
                  >
                    + Instalar CPU en Placa
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center Column: System Buses (Col 6 to 7) */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-4 py-2">
            <div className="text-center font-mono text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Buses del Sistema
            </div>

            {/* Bus 1: Data Bus */}
            <button
              onClick={() => {
                sounds.playSnap();
                onToggleComponent('data_bus');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                systemComponents.data_bus
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/40 border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs font-display">Bus de Datos</span>
                </div>
                {systemComponents.data_bus && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Bidireccional (Datos e Instrucciones)
              </p>
            </button>

            {/* Bus 2: Address Bus */}
            <button
              onClick={() => {
                sounds.playSnap();
                onToggleComponent('address_bus');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                systemComponents.address_bus
                  ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-lg shadow-purple-950/40'
                  : 'bg-slate-900/40 border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-xs font-display">Bus Direcciones</span>
                </div>
                {systemComponents.address_bus && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Unidireccional (CPU &rarr; Memoria)
              </p>
            </button>

            {/* Bus 3: Control Bus */}
            <button
              onClick={() => {
                sounds.playSnap();
                onToggleComponent('control_bus');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                systemComponents.control_bus
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900/40 border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs font-display">Bus de Control</span>
                </div>
                {systemComponents.control_bus && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Señales RD, WR, Clock
              </p>
            </button>
          </div>

          {/* Socket 2: Memoria RAM (Col 8 to 12) */}
          <div className="md:col-span-5 flex flex-col">
            <div className={`flex-1 rounded-2xl border-2 p-5 transition-all relative ${
              systemComponents.ram
                ? 'bg-slate-900/90 border-emerald-500/60 shadow-xl shadow-emerald-950/30'
                : 'bg-slate-950/60 border-dashed border-slate-700 hover:border-slate-500'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${systemComponents.ram ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Memoria Principal (RAM)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Almacenamiento Conjunto (Datos + Instrucciones)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenInfo('ram')}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-400"
                  title="Ficha educativa"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {systemComponents.ram ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Estado del módulo RAM:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Instalado en Banco 1
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Estructura matricial direccionable por celdas (0x00 .. 0x07). 
                      Contiene tanto el código ejecutable como las variables de cálculo.
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                    <div className="p-1.5 bg-slate-950 rounded border border-emerald-900/60 text-emerald-300">
                      [0x00] LOAD
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-emerald-900/60 text-emerald-300">
                      [0x01] ADD
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-emerald-900/60 text-emerald-300">
                      [0x04] DATO A
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-emerald-900/60 text-emerald-300">
                      [0x05] DATO B
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playSnap();
                      onToggleComponent('ram');
                    }}
                    className="w-full py-1 text-slate-500 hover:text-rose-400 text-[11px] text-center"
                  >
                    Retirar Módulo RAM de la placa
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Ranura de memoria vacía. La arquitectura de Von Neumann necesita memoria compartida para almacenar el programa.
                  </p>
                  <button
                    onClick={() => {
                      sounds.playSnap();
                      onToggleComponent('ram');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-600/30"
                  >
                    + Instalar Memoria RAM
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lower Section: Interfaces de Entrada y Salida (E/S) (Span 12) */}
          <div className="md:col-span-12">
            <div className={`rounded-2xl border-2 p-5 transition-all ${
              systemComponents.io_interface
                ? 'bg-slate-900/90 border-purple-500/60 shadow-xl shadow-purple-950/30'
                : 'bg-slate-950/60 border-dashed border-slate-700 hover:border-slate-500'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${systemComponents.io_interface ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        Interfaces de Entrada y Salida (E/S - Periféricos)
                      </h3>
                      <button
                        onClick={() => onOpenInfo('io_interface')}
                        className="text-slate-400 hover:text-purple-400"
                        title="Ficha educativa"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Permite conectar periféricos humanos: Teclado de entrada y Pantalla terminal de salida
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {systemComponents.io_interface ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Controlador E/S Conectado al Bus de Datos
                      </span>
                      <button
                        onClick={() => {
                          sounds.playSnap();
                          onToggleComponent('io_interface');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs"
                      >
                        Desconectar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playSnap();
                        onToggleComponent('io_interface');
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-lg shadow-purple-600/30"
                    >
                      + Conectar Interfaz E/S
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic POST / BIOS Result Modal or Card */}
      {diagnosticResult && (
        <div className={`p-5 rounded-2xl border transition-all ${
          diagnosticResult.success
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100 shadow-2xl shadow-emerald-950/40'
            : 'bg-rose-950/80 border-rose-500/60 text-rose-100 shadow-2xl shadow-rose-950/40'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${diagnosticResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {diagnosticResult.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-display font-bold text-base sm:text-lg">
                  {diagnosticResult.success ? '¡DIAGNÓSTICO BIOS EXITOSO!' : 'DIAGNÓSTICO: FALLO DE ARQUITECTURA'}
                </h4>
                <p className="text-xs sm:text-sm mt-1 opacity-90">
                  {diagnosticResult.successMessage || 'Revisa los siguientes puntos pedagógicos para corregir tu ordenador:'}
                </p>

                {diagnosticResult.errors.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-rose-200">
                    {diagnosticResult.errors.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {diagnosticResult.warnings.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-amber-200">
                    {diagnosticResult.warnings.map((warn, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {diagnosticResult.success && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onGoToSimulator();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 shrink-0"
              >
                <span>Ir al Simulador en Vivo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Component Quick Selector Cards (Catalog) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-sm font-display font-bold text-white mb-3 flex items-center gap-2">
          <span>Catálogo de Piezas del Sistema:</span>
          <span className="text-xs font-normal text-slate-400">
            (Haz clic sobre una pieza para montarla o consultar su definición)
          </span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['cpu', 'ram', 'io_interface', 'data_bus', 'address_bus', 'control_bus'] as ComponentType[]).map((compKey) => {
            const isInstalled = systemComponents[compKey];
            const info = COMPONENT_INFO[compKey];
            return (
              <div
                key={compKey}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isInstalled
                    ? 'bg-slate-900 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isInstalled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isInstalled ? 'Puesto' : 'En caja'}
                    </span>
                    <button
                      onClick={() => onOpenInfo(compKey)}
                      className="text-slate-400 hover:text-cyan-400"
                      title="Ver qué es"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h5 className="font-display font-bold text-xs text-white">
                    {info.shortName}
                  </h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {info.summary}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playSnap();
                    onToggleComponent(compKey);
                  }}
                  className={`mt-3 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-colors ${
                    isInstalled
                      ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30'
                      : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40'
                  }`}
                >
                  {isInstalled ? 'Quitar' : '+ Poner'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for CPU Internal Inspection */}
      {showCpuModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CpuInternalInspector
              installedParts={cpuInternalParts}
              onTogglePart={onToggleCpuPart}
              registers={{
                pc: 0,
                ir: 'LOAD 4',
                mar: 4,
                mdr: '5',
                acc: 0
              }}
              alu={{
                operandA: 0,
                operandB: 0,
                operation: 'IDLE',
                result: 0,
                flagZero: false,
                flagNegative: false,
                active: false
              }}
              controlUnit={{
                phase: 'IDLE',
                stepDescription: 'La CPU está lista para ser equipada con la ALU, la UC y los Registros.',
                microSignalAddressBus: false,
                microSignalDataBus: false,
                microSignalControlRead: false,
                microSignalControlWrite: false,
                microSignalAluActive: false,
                microSignalIoRead: false,
                microSignalIoWrite: false
              }}
              onOpenInfo={onOpenInfo}
              isInteractiveInstall={true}
              onClose={() => setShowCpuModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
