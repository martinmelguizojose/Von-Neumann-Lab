import { PuzzlePiece } from '../types/puzzle';

export const PUZZLE_PIECES: Record<string, PuzzlePiece> = {
  cpu: {
    id: 'cpu',
    name: 'CPU (El Cerebro)',
    shortName: 'CPU',
    category: 'exterior',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-500/15',
    borderColor: 'border-amber-400',
    iconName: 'Cpu',
    kidDescription: 'Es el procesador central o "cerebro" del ordenador. Se encarga de pensar, coordinar y hacer que todo funcione.',
    analogy: '¡Es como el capitán de un barco o el chef de un restaurante: da las órdenes y prepara todo!',
    targetSlot: 'slot_cpu'
  },
  memoria: {
    id: 'memoria',
    name: 'Memoria Principal (RAM)',
    shortName: 'Memoria RAM',
    category: 'exterior',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-500/15',
    borderColor: 'border-emerald-400',
    iconName: 'Database',
    kidDescription: 'Guarda temporalmente tanto lo que el ordenador está haciendo (los datos) como lo que tiene que hacer (el programa).',
    analogy: '¡Es como una estantería gigante con cajitas numeradas para guardar juguetes y notas!',
    targetSlot: 'slot_memoria'
  },
  io: {
    id: 'io',
    name: 'Entrada y Salida (E/S)',
    shortName: 'Entrada y Salida',
    category: 'exterior',
    color: 'from-purple-400 to-indigo-500',
    bgLight: 'bg-purple-500/15',
    borderColor: 'border-purple-400',
    iconName: 'MonitorSpeaker',
    kidDescription: 'Conecta el ordenador con las personas: la Entrada es el teclado/ratón y la Salida es la pantalla/altavoz.',
    analogy: '¡Son los ojos, oídos y la boca del ordenador para escuchar lo que escribes y responderte!',
    targetSlot: 'slot_io'
  },
  buses: {
    id: 'buses',
    name: 'Buses del Sistema (Autopistas)',
    shortName: 'Buses de Conexión',
    category: 'cableado',
    color: 'from-cyan-400 to-blue-500',
    bgLight: 'bg-cyan-500/15',
    borderColor: 'border-cyan-400',
    iconName: 'Cable',
    kidDescription: 'Pistas y canales rectos de diferentes colores: el Bus CPU <-> E/S (verde), el Bus CPU <-> RAM (cyan, morado, ámbar) y el Bus General Troncal (rojo/dorado) que recoge todo el sistema.',
    analogy: '¡Son como una red de autopistas rectas y avenidas principales por donde viajan a toda velocidad los datos y las órdenes!',
    targetSlot: 'slot_buses'
  },
  alu: {
    id: 'alu',
    name: 'ALU (La Calculadora)',
    shortName: 'ALU',
    category: 'cpu_interior',
    color: 'from-green-400 to-emerald-500',
    bgLight: 'bg-green-500/15',
    borderColor: 'border-green-400',
    iconName: 'Calculator',
    kidDescription: 'Está dentro de la CPU y es la calculadora que hace las sumas, restas y comparaciones (¿este número es mayor?).',
    analogy: '¡Como la calculadora de tu estuche, pero que resuelve millones de cuentas en un abrir y cerrar de ojos!',
    targetSlot: 'slot_alu'
  },
  uc: {
    id: 'uc',
    name: 'Unidad de Control (UC)',
    shortName: 'Unidad de Control',
    category: 'cpu_interior',
    color: 'from-rose-400 to-pink-500',
    bgLight: 'bg-rose-500/15',
    borderColor: 'border-rose-400',
    iconName: 'Sliders',
    kidDescription: 'Está dentro de la CPU y es el director de orquesta: lee las instrucciones y le dice a cada parte qué hacer en cada segundo.',
    analogy: '¡Es como el árbitro de fútbol con su silbato marcando los turnos del juego!',
    targetSlot: 'slot_uc'
  },
  registros: {
    id: 'registros',
    name: 'Registros (Bolsillos Rápidos)',
    shortName: 'Registros',
    category: 'cpu_interior',
    color: 'from-amber-300 to-yellow-500',
    bgLight: 'bg-yellow-500/15',
    borderColor: 'border-yellow-400',
    iconName: 'Boxes',
    kidDescription: 'Están dentro de la CPU. Son cajitas de memoria super rápidas para tener a mano el número que se está sumando ahora mismo.',
    analogy: '¡Son como los bolsillos de tu chaqueta: guardas las cosas que necesitas sacar al instante!',
    targetSlot: 'slot_registros'
  }
};
