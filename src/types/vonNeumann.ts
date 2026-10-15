export type ComponentType = 
  | 'cpu'
  | 'ram'
  | 'io_interface'
  | 'data_bus'
  | 'address_bus'
  | 'control_bus';

export type CpuInternalType =
  | 'alu'
  | 'cu'
  | 'pc'
  | 'ir'
  | 'mar'
  | 'mdr'
  | 'acc';

export type CyclePhase = 'IDLE' | 'FETCH' | 'DECODE' | 'EXECUTE' | 'WRITEBACK';

export interface MemoryCell {
  address: number;
  hexAddr: string;
  label: string;
  value: string;
  numericVal: number;
  isInstruction: boolean;
  instructionOp?: 'LOAD' | 'STORE' | 'ADD' | 'SUB' | 'READ' | 'PRINT' | 'JUMP' | 'HALT';
  operand?: number;
}

export interface RegisterState {
  pc: number;          // Program Counter (Contador de Programa)
  ir: string;          // Instruction Register (Registro de Instrucción)
  mar: number;         // Memory Address Register (Reg. Dirección Memoria)
  mdr: string;         // Memory Data Register (Reg. Datos Memoria)
  acc: number;         // Accumulator (Acumulador)
}

export interface AluState {
  operandA: number;
  operandB: number;
  operation: '+' | '-' | 'AND' | 'OR' | 'CMP' | 'IDLE';
  result: number;
  flagZero: boolean;
  flagNegative: boolean;
  active: boolean;
}

export interface ControlUnitState {
  phase: CyclePhase;
  stepDescription: string;
  microSignalDataBus: boolean;
  microSignalAddressBus: boolean;
  microSignalControlRead: boolean;
  microSignalControlWrite: boolean;
  microSignalAluActive: boolean;
  microSignalIoRead: boolean;
  microSignalIoWrite: boolean;
}

export interface BusPacket {
  id: string;
  busType: 'address' | 'data' | 'control';
  from: 'cpu' | 'ram' | 'io' | 'cu' | 'alu' | 'registers';
  to: 'cpu' | 'ram' | 'io' | 'cu' | 'alu' | 'registers';
  value: string;
  progress: number; // 0 to 1
  label: string;
}

export interface ProgramTemplate {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Medio' | 'Avanzado';
  description: string;
  expectedOutput: string;
  memory: MemoryCell[];
  requiresInput?: boolean;
  defaultInput?: number;
}

export interface Mission {
  id: number;
  title: string;
  objective: string;
  concept: string;
  hint: string;
  requiredComponents: ComponentType[];
  requiredCpuParts?: CpuInternalType[];
  targetProgramId?: string;
  completed: boolean;
  stars: number;
  badgeName: string;
  badgeIcon: string;
}

export interface ComponentInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'Sistema' | 'CPU Interno' | 'Buses';
  icon: string;
  summary: string;
  analogy: string;
  details: string[];
  roleInCycle: string;
  color: string;
}
