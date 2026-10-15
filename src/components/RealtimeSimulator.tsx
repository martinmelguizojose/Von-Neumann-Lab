import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  HelpCircle, 
  ChevronRight, 
  Cpu, 
  Database, 
  Radio, 
  ArrowLeftRight, 
  ArrowRight, 
  Activity, 
  Calculator, 
  Sliders, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { 
  ComponentType, 
  CpuInternalType, 
  MemoryCell, 
  RegisterState, 
  AluState, 
  ControlUnitState, 
  CyclePhase 
} from '../types/vonNeumann';
import { PROGRAM_TEMPLATES } from '../data/educationalContent';
import { sounds } from '../utils/soundEffects';
import { CpuInternalInspector } from './CpuInternalInspector';

interface RealtimeSimulatorProps {
  systemComponents: Record<ComponentType, boolean>;
  cpuInternalParts: Record<CpuInternalType, boolean>;
  onOpenInfo: (componentId: string) => void;
  onMissionProgress?: (completedMissionId: number) => void;
}

export const RealtimeSimulator: React.FC<RealtimeSimulatorProps> = ({
  systemComponents,
  cpuInternalParts,
  onOpenInfo,
  onMissionProgress
}) => {
  // Check if system is fully functional
  const isCpuReady = systemComponents.cpu && cpuInternalParts.alu && cpuInternalParts.cu && cpuInternalParts.pc && cpuInternalParts.ir && cpuInternalParts.mar && cpuInternalParts.mdr && cpuInternalParts.acc;
  const isMemoryReady = systemComponents.ram;
  const areBusesReady = systemComponents.data_bus && systemComponents.address_bus && systemComponents.control_bus;
  const isSystemReady = isCpuReady && isMemoryReady && areBusesReady;

  // Selected program template
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog_sum');
  const activeTemplate = PROGRAM_TEMPLATES.find(p => p.id === selectedProgramId) || PROGRAM_TEMPLATES[0];

  // Simulation State
  const [memory, setMemory] = useState<MemoryCell[]>(() => JSON.parse(JSON.stringify(activeTemplate.memory)));
  const [registers, setRegisters] = useState<RegisterState>({
    pc: 0,
    ir: '',
    mar: 0,
    mdr: '',
    acc: 0
  });

  const [alu, setAlu] = useState<AluState>({
    operandA: 0,
    operandB: 0,
    operation: 'IDLE',
    result: 0,
    flagZero: false,
    flagNegative: false,
    active: false
  });

  const [controlUnit, setControlUnit] = useState<ControlUnitState>({
    phase: 'IDLE',
    stepDescription: 'Pulsa "Iniciar" o "Paso Siguiente" para comenzar el ciclo de reloj.',
    microSignalAddressBus: false,
    microSignalDataBus: false,
    microSignalControlRead: false,
    microSignalControlWrite: false,
    microSignalAluActive: false,
    microSignalIoRead: false,
    microSignalIoWrite: false
  });

  // Micro-step index (0 to 6 per instruction)
  const [microStep, setMicroStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isHalted, setIsHalted] = useState<boolean>(false);
  const [clockSpeedMs, setClockSpeedMs] = useState<number>(1400); // 1.4s by default
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [showCpuInternalModal, setShowCpuInternalModal] = useState<boolean>(false);

  // Terminal & I/O
  const [inputVal, setInputVal] = useState<number>(activeTemplate.defaultInput || 15);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'VON NEUMANN OS v1.0 [ESO SYSTEM READY]',
    'Bus de Sistema: OK | Memoria RAM: 8 Celdas | CPU: OK',
    'Esperando ejecución...'
  ]);

  // Active traveling bus packet visual
  const [activePacket, setActivePacket] = useState<{
    bus: 'data' | 'address' | 'control';
    from: string;
    to: string;
    val: string;
    direction: 'left-to-right' | 'right-to-left';
  } | null>(null);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load program when selection changes
  useEffect(() => {
    resetProgram();
  }, [selectedProgramId]);

  const resetProgram = () => {
    setIsRunning(false);
    setIsHalted(false);
    setMicroStep(0);
    setCycleCount(0);
    setActivePacket(null);
    const template = PROGRAM_TEMPLATES.find(p => p.id === selectedProgramId) || PROGRAM_TEMPLATES[0];
    setMemory(JSON.parse(JSON.stringify(template.memory)));
    setRegisters({
      pc: 0,
      ir: '',
      mar: 0,
      mdr: '',
      acc: 0
    });
    setAlu({
      operandA: 0,
      operandB: 0,
      operation: 'IDLE',
      result: 0,
      flagZero: false,
      flagNegative: false,
      active: false
    });
    setControlUnit({
      phase: 'IDLE',
      stepDescription: 'Programa cargado en memoria. Listo para comenzar el ciclo de instrucción.',
      microSignalAddressBus: false,
      microSignalDataBus: false,
      microSignalControlRead: false,
      microSignalControlWrite: false,
      microSignalAluActive: false,
      microSignalIoRead: false,
      microSignalIoWrite: false
    });
    setTerminalLogs([
      `[PROGRAMA CARGADO]: ${template.title}`,
      'Instrucciones situadas en memoria (0x00 .. 0x03).',
      'Listo.'
    ]);
  };

  // Execution Step Machine
  const executeNextMicroStep = () => {
    if (isHalted || !isSystemReady) return;

    sounds.playBusPulse();

    const currentCell = memory[registers.pc];
    if (!currentCell && microStep < 4) {
      setIsHalted(true);
      setIsRunning(false);
      setControlUnit(prev => ({ ...prev, phase: 'IDLE', stepDescription: 'Fin de memoria alcanzado.' }));
      return;
    }

    // Micro-step sequence:
    // Step 0: FETCH 1 - PC -> MAR -> Address Bus
    // Step 1: FETCH 2 - Control Bus -> RAM READ signal
    // Step 2: FETCH 3 - RAM cell -> Data Bus -> MDR
    // Step 3: FETCH 4 - MDR -> IR, PC = PC + 1
    // Step 4: DECODE  - CU decodes IR
    // Step 5: EXECUTE - ALU or IO operates
    // Step 6: WRITEBACK - Result written to ACC or RAM

    if (microStep === 0) {
      // FETCH 1: PC sends address to MAR and Address Bus
      const currentPC = registers.pc;
      setRegisters(prev => ({ ...prev, mar: currentPC }));
      setControlUnit({
        phase: 'FETCH',
        stepDescription: `[Fase 1: BÚSQUEDA] El Contador de Programa (PC = ${currentPC}) pasa la dirección al registro MAR y activa el Bus de Direcciones.`,
        microSignalAddressBus: true,
        microSignalDataBus: false,
        microSignalControlRead: false,
        microSignalControlWrite: false,
        microSignalAluActive: false,
        microSignalIoRead: false,
        microSignalIoWrite: false
      });
      setActivePacket({
        bus: 'address',
        from: 'CPU (MAR)',
        to: 'Memoria RAM',
        val: `0x0${currentPC}`,
        direction: 'left-to-right'
      });
      setMicroStep(1);
    } 
    else if (microStep === 1) {
      // FETCH 2: Control Bus sends READ signal to RAM
      setControlUnit(prev => ({
        ...prev,
        stepDescription: `[Fase 1: BÚSQUEDA] La Unidad de Control emite la señal de "LECTURA" (READ) a través del Bus de Control hacia la celda 0x0${registers.mar} de la RAM.`,
        microSignalControlRead: true
      }));
      setActivePacket({
        bus: 'control',
        from: 'Unidad de Control',
        to: 'Memoria RAM',
        val: 'SEÑAL_READ',
        direction: 'left-to-right'
      });
      setMicroStep(2);
    }
    else if (microStep === 2) {
      // FETCH 3: RAM places instruction on Data Bus, enters MDR
      const cell = memory[registers.mar];
      const val = cell ? cell.value : 'HALT';
      setRegisters(prev => ({ ...prev, mdr: val }));
      setControlUnit(prev => ({
        ...prev,
        stepDescription: `[Fase 1: BÚSQUEDA] La memoria RAM lee la celda 0x0${registers.mar} y vuelca la instrucción "${val}" al Bus de Datos rumbo al registro MDR de la CPU.`,
        microSignalDataBus: true
      }));
      setActivePacket({
        bus: 'data',
        from: 'Memoria RAM',
        to: 'CPU (MDR)',
        val: val,
        direction: 'right-to-left'
      });
      setMicroStep(3);
    }
    else if (microStep === 3) {
      // FETCH 4: MDR -> IR, PC increments (+1)
      const instr = registers.mdr;
      const nextPC = registers.pc + 1;
      setRegisters(prev => ({ ...prev, ir: instr, pc: nextPC }));
      setControlUnit(prev => ({
        ...prev,
        stepDescription: `[Fase 1: BÚSQUEDA COMPLETADA] La instrucción "${instr}" entra al Registro de Instrucción (IR). El PC avanza a 0x0${nextPC}.`,
        microSignalAddressBus: false,
        microSignalDataBus: false,
        microSignalControlRead: false
      }));
      setActivePacket(null);
      setMicroStep(4);
    }
    else if (microStep === 4) {
      // DECODE: Control Unit decodes instruction
      const ir = registers.ir;
      let desc = '';
      if (ir.startsWith('LOAD')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "LOAD": debe leer el dato de la dirección indicada y cargarlo en el Acumulador.`;
      } else if (ir.startsWith('ADD')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "ADD": debe buscar el segundo sumando en la RAM y ordenar a la ALU que lo sume.`;
      } else if (ir.startsWith('SUB')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "SUB": ordenará a la ALU que reste el operando de memoria del Acumulador.`;
      } else if (ir.startsWith('STORE')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "STORE": guardará el valor del Acumulador en la celda de memoria indicada.`;
      } else if (ir.startsWith('READ')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "READ_IO": solicitará al teclado/sensor de Entrada un dato numérico.`;
      } else if (ir.startsWith('PRINT')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "PRINT_IO": enviará el valor del Acumulador a la Pantalla de Salida.`;
      } else if (ir.startsWith('HALT')) {
        desc = `[Fase 2: DECODIFICACIÓN] La Unidad de Control interpreta "HALT": orden de parada. El programa ha concluido con éxito.`;
      } else {
        desc = `[Fase 2: DECODIFICACIÓN] Decodificando ${ir}...`;
      }

      setControlUnit(prev => ({
        ...prev,
        phase: 'DECODE',
        stepDescription: desc
      }));
      setMicroStep(5);
    }
    else if (microStep === 5) {
      // EXECUTE: Execution of the decoded instruction
      const ir = registers.ir;

      if (ir.startsWith('HALT')) {
        sounds.playSuccess();
        setIsHalted(true);
        setIsRunning(false);
        setControlUnit(prev => ({
          ...prev,
          phase: 'IDLE',
          stepDescription: '¡PROGRAMA FINALIZADO CON ÉXITO! Todos los ciclos de instrucción se han completado correctamente.'
        }));
        setTerminalLogs(prev => [...prev, '>>> EJECUCIÓN CONCLUIDA (HALT): Ciclo completado sin errores.']);
        if (onMissionProgress) {
          onMissionProgress(5);
        }
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // Fallback
        }
        setMicroStep(0);
        return;
      }

      if (ir.startsWith('LOAD')) {
        // Operand address
        const parts = ir.split(' ');
        const targetAddr = parseInt(parts[1], 10) || 4;
        const targetCell = memory[targetAddr];
        const val = targetCell ? targetCell.numericVal : 0;
        setRegisters(prev => ({ ...prev, mar: targetAddr, mdr: val.toString(), acc: val }));
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] Se lee la celda 0x0${targetAddr} (valor = ${val}) y se copia al Acumulador (ACC = ${val}).`,
          microSignalAddressBus: true,
          microSignalDataBus: true,
          microSignalControlRead: true
        }));
        setActivePacket({
          bus: 'data',
          from: 'Memoria RAM',
          to: 'Acumulador (ACC)',
          val: val.toString(),
          direction: 'right-to-left'
        });
      }
      else if (ir.startsWith('ADD')) {
        sounds.playAluCompute();
        const parts = ir.split(' ');
        const targetAddr = parseInt(parts[1], 10) || 5;
        const targetCell = memory[targetAddr];
        const operandB = targetCell ? targetCell.numericVal : 0;
        const operandA = registers.acc;
        const sumResult = operandA + operandB;

        setRegisters(prev => ({ ...prev, mar: targetAddr, mdr: operandB.toString() }));
        setAlu({
          operandA,
          operandB,
          operation: '+',
          result: sumResult,
          flagZero: sumResult === 0,
          flagNegative: sumResult < 0,
          active: true
        });
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] La ALU suma ${operandA} (en Acumulador) + ${operandB} (de la celda 0x0${targetAddr}) = ${sumResult}.`,
          microSignalAluActive: true,
          microSignalDataBus: true
        }));
        setActivePacket({
          bus: 'data',
          from: 'Memoria RAM',
          to: 'ALU',
          val: operandB.toString(),
          direction: 'right-to-left'
        });
      }
      else if (ir.startsWith('SUB')) {
        sounds.playAluCompute();
        const parts = ir.split(' ');
        const targetAddr = parseInt(parts[1], 10) || 5;
        const targetCell = memory[targetAddr];
        const operandB = targetCell ? targetCell.numericVal : 0;
        const operandA = registers.acc;
        const subResult = operandA - operandB;

        setRegisters(prev => ({ ...prev, mar: targetAddr, mdr: operandB.toString() }));
        setAlu({
          operandA,
          operandB,
          operation: '-',
          result: subResult,
          flagZero: subResult === 0,
          flagNegative: subResult < 0,
          active: true
        });
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] La ALU resta ${operandA} - ${operandB} = ${subResult}. Flag Cero: ${subResult === 0 ? 'SÍ' : 'NO'}.`,
          microSignalAluActive: true,
          microSignalDataBus: true
        }));
        setActivePacket({
          bus: 'data',
          from: 'Memoria RAM',
          to: 'ALU',
          val: operandB.toString(),
          direction: 'right-to-left'
        });
      }
      else if (ir.startsWith('STORE')) {
        const parts = ir.split(' ');
        const targetAddr = parseInt(parts[1], 10) || 6;
        const currentAcc = registers.acc;

        // Update memory
        setMemory(prev => prev.map(c => c.address === targetAddr ? { ...c, numericVal: currentAcc, value: currentAcc.toString() } : c));
        setRegisters(prev => ({ ...prev, mar: targetAddr, mdr: currentAcc.toString() }));
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] Se guarda el valor del Acumulador (${currentAcc}) en la celda 0x0${targetAddr} de la RAM.`,
          microSignalAddressBus: true,
          microSignalDataBus: true,
          microSignalControlWrite: true
        }));
        setActivePacket({
          bus: 'data',
          from: 'Acumulador (ACC)',
          to: `RAM [0x0${targetAddr}]`,
          val: currentAcc.toString(),
          direction: 'left-to-right'
        });
      }
      else if (ir.startsWith('READ')) {
        const val = Number(inputVal) || 0;
        setRegisters(prev => ({ ...prev, acc: val, mdr: val.toString() }));
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] Interfaz E/S lee el valor introducido por teclado (${val}) y lo entrega al Acumulador.`,
          microSignalIoRead: true,
          microSignalDataBus: true
        }));
        setTerminalLogs(prev => [...prev, `[TECLADO ENTRADA]: El usuario introdujo el dato: ${val}`]);
        setActivePacket({
          bus: 'data',
          from: 'Módulo E/S (Teclado)',
          to: 'CPU (ACC)',
          val: val.toString(),
          direction: 'right-to-left'
        });
      }
      else if (ir.startsWith('PRINT')) {
        const val = registers.acc;
        setControlUnit(prev => ({
          ...prev,
          phase: 'EXECUTE',
          stepDescription: `[Fase 3: EJECUCIÓN] La CPU vuelca el resultado (${val}) a través del Bus de Datos hacia el Monitor de Salida E/S.`,
          microSignalIoWrite: true,
          microSignalDataBus: true
        }));
        setTerminalLogs(prev => [...prev, `[MONITOR CRT SALIDA]: Resultado = ${val}`]);
        setActivePacket({
          bus: 'data',
          from: 'CPU (ACC)',
          to: 'Monitor CRT',
          val: val.toString(),
          direction: 'left-to-right'
        });
      }

      setMicroStep(6);
    }
    else if (microStep === 6) {
      // WRITEBACK: Update final accumulator or prepare for next instruction
      if (alu.active) {
        setRegisters(prev => ({ ...prev, acc: alu.result }));
        setAlu(prev => ({ ...prev, active: false }));
      }
      setControlUnit(prev => ({
        ...prev,
        phase: 'WRITEBACK',
        stepDescription: `[Fase 4: ALMACENAMIENTO] Ciclo de instrucción completado. Registros actualizados. Listo para la siguiente instrucción.`,
        microSignalAddressBus: false,
        microSignalDataBus: false,
        microSignalControlRead: false,
        microSignalControlWrite: false,
        microSignalAluActive: false,
        microSignalIoRead: false,
        microSignalIoWrite: false
      }));
      setActivePacket(null);
      setCycleCount(c => c + 1);
      setMicroStep(0); // Ready for next FETCH
    }
  };

  // Timer loop for Play / Pause
  useEffect(() => {
    if (isRunning && isSystemReady && !isHalted) {
      timerRef.current = setInterval(() => {
        executeNextMicroStep();
      }, clockSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isSystemReady, isHalted, microStep, registers, memory, clockSpeedMs, inputVal]);

  const toggleRun = () => {
    sounds.playClick();
    if (!isSystemReady) return;
    if (isHalted) {
      resetProgram();
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Program Selection and Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Play className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-display font-bold text-white">
              Simulador del Ciclo de Instrucción en Tiempo Real
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Visualiza cómo viajan los pulsos eléctricos por los <strong>Buses de Datos, Direcciones y Control</strong>. 
            Aprende cada fase: <strong>Búsqueda (Fetch)</strong>, <strong>Decodificación (Decode)</strong>, <strong>Ejecución (Execute)</strong> y <strong>Almacenamiento (Writeback)</strong>.
          </p>
        </div>

        {/* Program Template Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap self-center">
            Programa a ejecutar:
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            {PROGRAM_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warning if computer is not fully assembled */}
      {!isSystemReady && (
        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-100">
              ¡Atención! La arquitectura de tu ordenador aún está incompleta en el Taller de Montaje.
            </p>
            <p className="text-amber-300/90 text-xs">
              Para simular el flujo en tiempo real necesitas montar la <strong>CPU (con ALU, UC y Registros)</strong>, 
              la <strong>Memoria RAM</strong> y los <strong>3 Buses</strong>. Ve a la pestaña "1. Taller de Montaje" o pulsa el botón rápido:
            </p>
            <button
              onClick={() => {
                sounds.playSuccess();
                // Trigger quick assembly via parent or reload
                window.location.reload();
              }}
              className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs"
            >
              Recargar y Ensamblar Automáticamente
            </button>
          </div>
        </div>
      )}

      {/* Simulator Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Play / Step Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleRun}
            disabled={!isSystemReady}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isHalted ? 'Volver a Ejecutar' : 'Iniciar Simulación'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (isRunning) setIsRunning(false);
              executeNextMicroStep();
            }}
            disabled={!isSystemReady || isHalted}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Avanzar un solo micro-paso (ideal para explicar en clase)"
          >
            <SkipForward className="w-4 h-4 text-cyan-400" />
            <span>Paso a Paso</span>
          </button>

          <button
            onClick={resetProgram}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all"
            title="Reiniciar registros y memoria al estado inicial"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="px-2 text-slate-400 text-[11px] font-semibold">Velocidad:</span>
            {[
              { label: '0.5x (Lenta)', ms: 2200 },
              { label: '1x (Normal)', ms: 1400 },
              { label: '2x (Rápida)', ms: 700 }
            ].map(spd => (
              <button
                key={spd.ms}
                onClick={() => setClockSpeedMs(spd.ms)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  clockSpeedMs === spd.ms
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCpuInternalModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Interior CPU</span>
          </button>
        </div>
      </div>

      {/* Real-time Explanatory HUD Banner (ESO Pedagogic Focus) */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider ${
                controlUnit.phase === 'FETCH' ? 'bg-blue-900/80 text-blue-300 border border-blue-500/40' :
                controlUnit.phase === 'DECODE' ? 'bg-amber-900/80 text-amber-300 border border-amber-500/40' :
                controlUnit.phase === 'EXECUTE' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' :
                controlUnit.phase === 'WRITEBACK' ? 'bg-purple-900/80 text-purple-300 border border-purple-500/40' :
                'bg-slate-800 text-slate-400'
              }`}>
                {controlUnit.phase === 'IDLE' ? 'PAUSADO' : `FASE: ${controlUnit.phase}`}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Micro-paso: {microStep}/6 • Ciclos ejecutados: {cycleCount}
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {controlUnit.stepDescription}
            </p>
          </div>

          {/* Quick Active Signal Pill */}
          {activePacket && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-200 text-xs font-mono shrink-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {activePacket.bus.toUpperCase()}: [{activePacket.val}] {activePacket.from} &rarr; {activePacket.to}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Schematic View */}
      <div className="circuit-bg border-2 border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
          
          {/* LEFT: CPU Block (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
            <div>
              {/* CPU Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      CPU (Unidad Central de Procesamiento)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Coordinación, Decodificación y Aritmética
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCpuInternalModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Abrir zoom
                </button>
              </div>

              {/* Sub-components inside CPU */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* 1. Unidad de Control (UC) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-rose-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" /> UC
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      controlUnit.phase !== 'IDLE' ? 'bg-rose-950 text-rose-300 animate-pulse' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {controlUnit.phase}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    Secuenciador y señales de reloj hacia buses.
                  </p>
                </div>

                {/* 2. ALU */}
                <div className={`p-3 rounded-xl bg-slate-950/80 border transition-all ${
                  alu.active ? 'border-emerald-400 shadow-md shadow-emerald-500/20' : 'border-emerald-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-emerald-300 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" /> ALU
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {alu.operation}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300">
                    A: {alu.operandA} | B: {alu.operandB}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">
                    Res: {alu.result}
                  </div>
                </div>
              </div>

              {/* Registers Mini-Table */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
                  Registros Internos de la CPU:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-blue-500/30">
                    <span className="text-[10px] text-slate-400 block">PC (Contador Prog.)</span>
                    <span className="text-blue-300 font-bold text-sm">0x0{registers.pc}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-amber-500/30">
                    <span className="text-[10px] text-slate-400 block">IR (Instrucción)</span>
                    <span className="text-amber-300 font-bold text-xs truncate block">{registers.ir || '---'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-purple-500/30">
                    <span className="text-[10px] text-slate-400 block">MAR (Dirección)</span>
                    <span className="text-purple-300 font-bold text-sm">0x0{registers.mar}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-teal-500/30">
                    <span className="text-[10px] text-slate-400 block">MDR (Dato Buffer)</span>
                    <span className="text-teal-300 font-bold text-xs truncate block">{registers.mdr || '---'}</span>
                  </div>
                </div>

                <div className="mt-2 p-2 rounded bg-pink-950/40 border border-pink-500/40 flex items-center justify-between font-mono">
                  <span className="text-xs text-pink-300 font-bold">Acumulador (ACC):</span>
                  <span className="text-base text-pink-200 font-bold px-2 py-0.5 bg-pink-900/60 rounded">
                    {registers.acc}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro-signals active in CPU */}
            <div className="mt-3 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800 pt-2">
              <span>Señales activas:</span>
              <div className="flex gap-1">
                {controlUnit.microSignalAddressBus && <span className="text-purple-400">ADDR</span>}
                {controlUnit.microSignalDataBus && <span className="text-cyan-400">DATA</span>}
                {controlUnit.microSignalControlRead && <span className="text-amber-400">RD</span>}
                {controlUnit.microSignalControlWrite && <span className="text-rose-400">WR</span>}
              </div>
            </div>
          </div>

          {/* CENTER: 3 Visual System Buses (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-4 py-4">
            {/* Bus 1: Data Bus */}
            <div className={`p-3 rounded-xl border relative transition-all ${
              controlUnit.microSignalDataBus 
                ? 'bg-cyan-950 border-cyan-400 shadow-xl shadow-cyan-500/30 animate-signal' 
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-cyan-300">
                  Bus Datos
                </span>
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Bidireccional</p>
              {controlUnit.microSignalDataBus && (
                <div className="mt-1 font-mono text-[10px] text-cyan-200 font-bold truncate">
                  &larr; {registers.mdr || 'PULSO'} &rarr;
                </div>
              )}
            </div>

            {/* Bus 2: Address Bus */}
            <div className={`p-3 rounded-xl border relative transition-all ${
              controlUnit.microSignalAddressBus 
                ? 'bg-purple-950 border-purple-400 shadow-xl shadow-purple-500/30 animate-signal' 
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-purple-300">
                  Bus Direcciones
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Unidireccional &rarr;</p>
              {controlUnit.microSignalAddressBus && (
                <div className="mt-1 font-mono text-[10px] text-purple-200 font-bold">
                  &rarr; 0x0{registers.mar}
                </div>
              )}
            </div>

            {/* Bus 3: Control Bus */}
            <div className={`p-3 rounded-xl border relative transition-all ${
              controlUnit.microSignalControlRead || controlUnit.microSignalControlWrite 
                ? 'bg-amber-950 border-amber-400 shadow-xl shadow-amber-500/30 animate-signal' 
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-amber-300">
                  Bus Control
                </span>
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">Señales RD / WR</p>
              {(controlUnit.microSignalControlRead || controlUnit.microSignalControlWrite) && (
                <div className="mt-1 font-mono text-[10px] text-amber-200 font-bold">
                  {controlUnit.microSignalControlRead ? 'RD (Leer)' : 'WR (Escribir)'}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Main Memory (RAM) (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
            <div>
              {/* RAM Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Memoria Principal (RAM)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Datos e Instrucciones en el mismo espacio
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  8 Celdas
                </span>
              </div>

              {/* Memory Cells Table */}
              <div className="mt-4 space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {memory.map((cell) => {
                  const isCurrentPC = registers.pc === cell.address && microStep === 0;
                  const isCurrentTarget = registers.mar === cell.address && (controlUnit.microSignalAddressBus);

                  return (
                    <div
                      key={cell.address}
                      className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                        isCurrentTarget
                          ? 'bg-purple-950/80 border-purple-400 shadow-md shadow-purple-500/30 scale-[1.01]'
                          : isCurrentPC
                          ? 'bg-blue-950/60 border-blue-400'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          {cell.hexAddr}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          cell.isInstruction ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                        }`}>
                          {cell.isInstruction ? 'INSTR' : 'DATO'}
                        </span>
                        <span className="text-white font-medium">
                          {cell.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                          {cell.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 text-center">
              * La celda iluminada en morado es la seleccionada por el Bus de Direcciones.
            </p>
          </div>

          {/* BOTTOM: I/O Module & Interactive Terminal (Full 12 cols) */}
          <div className="lg:col-span-12 bg-slate-900/90 border-2 border-purple-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white">
                    Interfaces de Entrada y Salida (E/S)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Comunicación externa con periféricos de usuario
                  </p>
                </div>
              </div>

              {/* Input controller if program supports keyboard input */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-semibold whitespace-nowrap">
                  Teclado (Dato de Entrada):
                </label>
                <input
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-3 py-1 bg-slate-950 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* CRT Screen Terminal Output */}
            <div className="mt-3 bg-black/90 rounded-xl p-3 border border-emerald-500/30 font-mono text-xs text-emerald-400 space-y-1 scanline max-h-32 overflow-y-auto shadow-inner">
              <div className="text-[10px] text-emerald-600 border-b border-emerald-950 pb-1 flex justify-between">
                <span>CRT MONITOR // V_SYNC ACTIVE</span>
                <span>BAUD: 9600</span>
              </div>
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CPU Modal if requested */}
      {showCpuInternalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CpuInternalInspector
              installedParts={cpuInternalParts}
              registers={registers}
              alu={alu}
              controlUnit={controlUnit}
              onOpenInfo={onOpenInfo}
              onClose={() => setShowCpuInternalModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
