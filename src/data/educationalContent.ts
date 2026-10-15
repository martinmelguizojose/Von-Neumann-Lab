import { ComponentInfo, Mission, ProgramTemplate } from '../types/vonNeumann';

export const COMPONENT_INFO: Record<string, ComponentInfo> = {
  cpu: {
    id: 'cpu',
    name: 'CPU (Unidad Central de Procesamiento)',
    shortName: 'CPU',
    category: 'Sistema',
    icon: 'Cpu',
    color: 'from-amber-500 to-orange-600',
    summary: 'El "cerebro" del ordenador. Se encarga de interpretar instrucciones, realizar operaciones y coordinar todo el sistema.',
    analogy: 'Es como el chef jefe de una cocina: lee las recetas (instrucciones), decide qué ingredientes usar y prepara los platos con sus utensilios.',
    details: [
      'Contiene la ALU, la Unidad de Control (UC) y los Registros internos.',
      'Sigue incansablemente el ciclo de instrucción: Búsqueda (Fetch), Decodificación (Decode), Ejecución (Execute) y Almacenamiento (Writeback).',
      'Determina la velocidad del ordenador a través de la frecuencia de su reloj interno (GHz).'
    ],
    roleInCycle: 'Toma la instrucción de la memoria a través de los buses, la decodifica, opera los datos y almacena el resultado final.'
  },
  ram: {
    id: 'ram',
    name: 'Memoria Principal (RAM)',
    shortName: 'Memoria RAM',
    category: 'Sistema',
    icon: 'Database',
    color: 'from-emerald-500 to-teal-600',
    summary: 'Almacena tanto los DATOS como las INSTRUCCIONES que la CPU necesita de forma inmediata. Esta fue la gran idea de John von Neumann en 1945.',
    analogy: 'Es como una estantería gigante con casilleros numerados (direcciones). En cada casillero puedes guardar un número o una orden escrita.',
    details: [
      'En la arquitectura de Von Neumann, los programas y los datos comparten el mismo espacio físico de memoria.',
      'Es una memoria volátil: cuando se apaga el ordenador, su contenido se borra.',
      'Cada celda tiene una dirección única (0, 1, 2, 3...) para que la CPU pueda encontrarla al instante.'
    ],
    roleInCycle: 'Provee a la CPU la siguiente instrucción cuando se le solicita por el bus de direcciones, y guarda los datos calculados.'
  },
  io_interface: {
    id: 'io_interface',
    name: 'Interfaces de Entrada y Salida (E/S)',
    shortName: 'Módulo E/S',
    category: 'Sistema',
    icon: 'Radio',
    color: 'from-purple-500 to-indigo-600',
    summary: 'Conecta el ordenador con el mundo exterior: teclado, ratón, pantalla, sensores, impresoras y almacenamiento secundario.',
    analogy: 'Son como los ojos, oídos y boca del ordenador: permiten recibir información del usuario y comunicar los resultados calculados.',
    details: [
      'Adapta las diferentes velocidades y voltajes entre los periféricos externos y la rápida CPU.',
      'Entrada: Teclado, ratón, micrófono, sensores de temperatura.',
      'Salida: Monitor, altavoces, pantallas LED, motores o actuadores.'
    ],
    roleInCycle: 'Recibe órdenes de la CPU para leer datos introducidos por el usuario o volcar resultados en la pantalla.'
  },
  data_bus: {
    id: 'data_bus',
    name: 'Bus de Datos',
    shortName: 'Bus Datos',
    category: 'Buses',
    icon: 'ArrowLeftRight',
    color: 'from-cyan-400 to-blue-500',
    summary: 'Conjunto de pistas conductoras bidireccionales por donde viajan los datos numéricos y las instrucciones del programa.',
    analogy: 'Es como una autopista de doble sentido por donde viajan camiones cargados de mercancía (números, letras, instrucciones).',
    details: [
      'Es bidireccional: la CPU puede leer datos que vienen de la RAM o escribir datos hacia la RAM o la pantalla.',
      'El ancho del bus (8, 16, 32, 64 bits) determina cuánta información puede transferirse en un solo golpe de reloj.'
    ],
    roleInCycle: 'Transporta físicamente el contenido de la celda de memoria hacia el registro de datos (MDR) de la CPU y viceversa.'
  },
  address_bus: {
    id: 'address_bus',
    name: 'Bus de Direcciones',
    shortName: 'Bus Direcciones',
    category: 'Buses',
    icon: 'ArrowRight',
    color: 'from-violet-400 to-purple-600',
    summary: 'Pistas conductoras UNIDIRECCIONALES que transportan el número de la celda de memoria o dispositivo que la CPU desea consultar.',
    analogy: 'Es como el cartero que lleva el número de la calle y el portal en un sobre: no lleva el contenido, solo dice "¿A qué buzón vamos?".',
    details: [
      'Es unidireccional: solo la CPU (o el controlador DMA) genera direcciones.',
      'Determina la cantidad máxima de memoria que el ordenador puede gestionar (2^N direcciones).'
    ],
    roleInCycle: 'El registro MAR de la CPU coloca aquí la dirección y la memoria activa exactamente la celda solicitada.'
  },
  control_bus: {
    id: 'control_bus',
    name: 'Bus de Control',
    shortName: 'Bus Control',
    category: 'Buses',
    icon: 'Activity',
    color: 'from-amber-400 to-yellow-500',
    summary: 'Transporta señales eléctricas de sincronización, órdenes de lectura (READ), escritura (WRITE) y pulsos de reloj (Clock).',
    analogy: 'Es como el silbato y las banderas del árbitro en un partido: da la señal de cuándo jugar, cuándo parar y qué equipo tiene el turno.',
    details: [
      'Señales principales: Memoria Lectura (RD), Memoria Escritura (WR), E/S Lectura, E/S Escritura, Reloj e Interrupciones.',
      'Evita que dos componentes intenten hablar a la vez en el bus de datos provocando cortocircuitos o corrupción.'
    ],
    roleInCycle: 'La Unidad de Control activa la línea "LECTURA" para que la RAM vuelque su contenido en el bus de datos.'
  },
  alu: {
    id: 'alu',
    name: 'ALU (Unidad Aritmético-Lógica)',
    shortName: 'ALU',
    category: 'CPU Interno',
    icon: 'Calculator',
    color: 'from-emerald-400 to-green-600',
    summary: 'La calculadora interna de la CPU. Ejecuta operaciones matemáticas (+, -, *, /) y comparaciones lógicas (Y, O, NO, >, <, =).',
    analogy: 'Es como la calculadora de bolsillo del científico: le das dos números y te devuelve el resultado exacto en nanosegundos.',
    details: [
      'Operaciones aritméticas: suma, resta, incremento, decremento.',
      'Operaciones lógicas: AND, OR, NOT, XOR y desplazamientos de bits.',
      'Dispone de flags o indicadores (Cero, Negativo, Acarreo) para tomar decisiones condicionales (ej. IF).'
    ],
    roleInCycle: 'Durante la fase de EJECUCIÓN, toma los operandos del Acumulador y del Registro de Datos, realiza el cálculo y devuelve el valor.'
  },
  cu: {
    id: 'cu',
    name: 'Unidad de Control (UC / CU)',
    shortName: 'Unidad de Control',
    category: 'CPU Interno',
    icon: 'Sliders',
    color: 'from-rose-500 to-pink-600',
    summary: 'El director de orquesta del ordenador. Lee la instrucción en curso, la decodifica y envía señales a cada pieza para que funcione en armonía.',
    analogy: 'Es como el director de la banda de música: no toca todos los instrumentos, pero les indica con su batuta cuándo y qué tocar.',
    details: [
      'Decodificador de instrucciones: traduce el código binario (ej. 0010) en la orden humana correspondiente (ej. SUMAR).',
      'Secuenciador: genera los pulsos de control paso a paso en el momento exacto.',
      'Gobierna las fases del ciclo de reloj: Búsqueda, Decodificación y Ejecución.'
    ],
    roleInCycle: 'Interpreta el contenido del Registro de Instrucción (IR) y activa las micro-señales hacia la ALU, memoria y buses.'
  },
  pc: {
    id: 'pc',
    name: 'Contador de Programa (PC - Program Counter)',
    shortName: 'Registro PC',
    category: 'CPU Interno',
    icon: 'ListOrdered',
    color: 'from-blue-400 to-cyan-500',
    summary: 'Registro que guarda la dirección de memoria de la PRÓXIMA instrucción que el procesador debe ejecutar.',
    analogy: 'Es como tu marcapáginas en un libro de lectura: te recuerda exactamente por qué página o renglón vas a leer a continuación.',
    details: [
      'Se incrementa automáticamente en 1 tras buscar cada instrucción (salvo que haya un salto o bifurcación JUMP).',
      'Si el PC apunta a 0, la CPU irá a buscar la celda 0 de la memoria RAM.'
    ],
    roleInCycle: 'Pasa su valor al registro MAR al inicio de cada ciclo para solicitar la instrucción.'
  },
  ir: {
    id: 'ir',
    name: 'Registro de Instrucción (IR - Instruction Register)',
    shortName: 'Registro IR',
    category: 'CPU Interno',
    icon: 'FileCode',
    color: 'from-amber-400 to-orange-500',
    summary: 'Registro que almacena temporalmente la instrucción que se acaba de leer de la memoria para que la Unidad de Control pueda analizarla.',
    analogy: 'Es como la comanda del camarero puesta en la bandeja de la cocina: la orden queda a la vista hasta que se termina de cocinar.',
    details: [
      'Contiene el Código de Operación (OpCode, ej. ADD) y el Operando o Dirección asociada (ej. 0x04).',
      'Permite que la memoria RAM quede liberada mientras la CPU procesa la orden.'
    ],
    roleInCycle: 'Almacena la instrucción recibida del bus de datos y se la presenta al decodificador de la Unidad de Control.'
  },
  mar: {
    id: 'mar',
    name: 'Registro de Dirección de Memoria (MAR)',
    shortName: 'Registro MAR',
    category: 'CPU Interno',
    icon: 'MapPin',
    color: 'from-indigo-400 to-purple-500',
    summary: 'Registro interno que retiene la dirección exacta de la memoria a la que se va a acceder antes de sacarla al Bus de Direcciones.',
    analogy: 'Es el papelito donde apuntas el número de la taquilla que vas a abrir antes de levantarte a buscarla.',
    details: [
      'Conectado directamente a las pistas del bus de direcciones.',
      'Asegura que la dirección eléctrica se mantenga estable durante todo el tiempo que la memoria tarda en responder.'
    ],
    roleInCycle: 'Recibe la dirección del PC (para instrucciones) o del IR (para datos) y la inyecta al Bus de Direcciones.'
  },
  mdr: {
    id: 'mdr',
    name: 'Registro de Datos de Memoria (MDR / MBR)',
    shortName: 'Registro MDR',
    category: 'CPU Interno',
    icon: 'Inbox',
    color: 'from-teal-400 to-emerald-500',
    summary: 'Registro búfer que retiene el dato o instrucción que entra o sale de la CPU a través del Bus de Datos.',
    analogy: 'Es como la bandeja de entrada y salida de correos en una oficina: todo paquete que entra o sale pasa por esta bandeja.',
    details: [
      'Es un registro de paso bidireccional conectado al Bus de Datos.',
      'Si se lee de memoria, el dato entra aquí. Si se escribe en memoria, el dato se coloca aquí antes de mandarlo.'
    ],
    roleInCycle: 'Recibe el valor de la celda de memoria leída antes de enviarla al IR o a los registros de cálculo.'
  },
  acc: {
    id: 'acc',
    name: 'Acumulador (ACC)',
    shortName: 'Acumulador',
    category: 'CPU Interno',
    icon: 'Boxes',
    color: 'from-red-400 to-rose-600',
    summary: 'Registro de trabajo principal de la CPU. Almacena los operandos inmediatos y el resultado de los cálculos de la ALU.',
    analogy: 'Es como la pizarra o libreta de notas del matemático donde anota el resultado temporal de una cuenta antes de seguir calculando.',
    details: [
      'Está conectado a una de las entradas de la ALU y a su salida.',
      'Cuando sumas 5 + 7, el 5 está en el Acumulador, la ALU suma 7 y el nuevo valor en el Acumulador pasa a ser 12.'
    ],
    roleInCycle: 'Suministra el primer operando a la ALU y recibe el resultado final para guardarlo o mostrarlo.'
  }
};

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: 'prog_sum',
    title: '1. Suma de Dos Números (5 + 7 = 12)',
    difficulty: 'Fácil',
    description: 'Programa clásico para entender cómo la CPU carga datos de la memoria RAM, los suma con la ALU y guarda el total en el Acumulador.',
    expectedOutput: 'Resultado calculado: 12 en el Acumulador.',
    memory: [
      { address: 0, hexAddr: '0x00', label: 'LOAD [0x04]', value: 'LOAD 4', numericVal: 5, isInstruction: true, instructionOp: 'LOAD', operand: 4 },
      { address: 1, hexAddr: '0x01', label: 'ADD [0x05]', value: 'ADD 5', numericVal: 7, isInstruction: true, instructionOp: 'ADD', operand: 5 },
      { address: 2, hexAddr: '0x02', label: 'STORE [0x06]', value: 'STORE 6', numericVal: 12, isInstruction: true, instructionOp: 'STORE', operand: 6 },
      { address: 3, hexAddr: '0x03', label: 'HALT', value: 'HALT', numericVal: 0, isInstruction: true, instructionOp: 'HALT' },
      { address: 4, hexAddr: '0x04', label: 'DATO A', value: '5', numericVal: 5, isInstruction: false },
      { address: 5, hexAddr: '0x05', label: 'DATO B', value: '7', numericVal: 7, isInstruction: false },
      { address: 6, hexAddr: '0x06', label: 'RESULTADO', value: '0', numericVal: 0, isInstruction: false },
      { address: 7, hexAddr: '0x07', label: 'LIBRE', value: '0', numericVal: 0, isInstruction: false },
    ]
  },
  {
    id: 'prog_io',
    title: '2. Entrada por Teclado y Salida en Pantalla',
    difficulty: 'Medio',
    description: 'Demuestra el papel de las interfaces de Entrada y Salida. Lee un número introducido por el alumno, le suma un bono de +10 y lo proyecta en el monitor.',
    expectedOutput: 'El valor introducido + 10 se visualiza en la terminal CRT.',
    requiresInput: true,
    defaultInput: 15,
    memory: [
      { address: 0, hexAddr: '0x00', label: 'READ_IO', value: 'READ_IO', numericVal: 0, isInstruction: true, instructionOp: 'READ' },
      { address: 1, hexAddr: '0x01', label: 'ADD [0x04]', value: 'ADD 4', numericVal: 10, isInstruction: true, instructionOp: 'ADD', operand: 4 },
      { address: 2, hexAddr: '0x02', label: 'PRINT_IO', value: 'PRINT_IO', numericVal: 0, isInstruction: true, instructionOp: 'PRINT' },
      { address: 3, hexAddr: '0x03', label: 'HALT', value: 'HALT', numericVal: 0, isInstruction: true, instructionOp: 'HALT' },
      { address: 4, hexAddr: '0x04', label: 'BONO (+10)', value: '10', numericVal: 10, isInstruction: false },
      { address: 5, hexAddr: '0x05', label: 'BUFFER', value: '0', numericVal: 0, isInstruction: false },
      { address: 6, hexAddr: '0x06', label: 'LIBRE', value: '0', numericVal: 0, isInstruction: false },
      { address: 7, hexAddr: '0x07', label: 'LIBRE', value: '0', numericVal: 0, isInstruction: false },
    ]
  },
  {
    id: 'prog_sub',
    title: '3. Resta y Control de Signo (20 - 8 = 12)',
    difficulty: 'Medio',
    description: 'La ALU calcula una resta y actualiza los indicadores (flags) de Cero o Negativo, mostrando cómo la CPU evalúa magnitudes.',
    expectedOutput: 'El Acumulador termina con 12 y el flag Negativo en FALSO.',
    memory: [
      { address: 0, hexAddr: '0x00', label: 'LOAD [0x04]', value: 'LOAD 4', numericVal: 20, isInstruction: true, instructionOp: 'LOAD', operand: 4 },
      { address: 1, hexAddr: '0x01', label: 'SUB [0x05]', value: 'SUB 5', numericVal: 8, isInstruction: true, instructionOp: 'SUB', operand: 5 },
      { address: 2, hexAddr: '0x02', label: 'PRINT_IO', value: 'PRINT_IO', numericVal: 0, isInstruction: true, instructionOp: 'PRINT' },
      { address: 3, hexAddr: '0x03', label: 'HALT', value: 'HALT', numericVal: 0, isInstruction: true, instructionOp: 'HALT' },
      { address: 4, hexAddr: '0x04', label: 'NUM_MAYOR', value: '20', numericVal: 20, isInstruction: false },
      { address: 5, hexAddr: '0x05', label: 'NUM_MENOR', value: '8', numericVal: 8, isInstruction: false },
      { address: 6, hexAddr: '0x06', label: 'LIBRE', value: '0', numericVal: 0, isInstruction: false },
      { address: 7, hexAddr: '0x07', label: 'LIBRE', value: '0', numericVal: 0, isInstruction: false },
    ]
  }
];

export const MISSIONS_DATA: Mission[] = [
  {
    id: 1,
    title: 'Misión 1: El Trío Fundamental',
    objective: 'Coloca en la placa base los tres bloques principales del sistema: la CPU, la Memoria Principal (RAM) y los Buses.',
    concept: 'En 1945, John von Neumann demostró que un ordenador electrónico solo necesita un procesador central, una memoria donde conviven datos e instrucciones y canales de comunicación.',
    hint: 'Arrastra o pulsa en la bahía de la CPU, la bahía de Memoria y activa los buses.',
    requiredComponents: ['cpu', 'ram', 'data_bus'],
    completed: false,
    stars: 3,
    badgeName: 'Primer Ensamblaje',
    badgeIcon: 'Zap'
  },
  {
    id: 2,
    title: 'Misión 2: El Cerebro por Dentro',
    objective: 'Abre la CPU e instala sus tres órganos vitales: la Unidad Aritmético-Lógica (ALU), la Unidad de Control (UC) y los Registros (PC, IR, MAR, MDR, ACC).',
    concept: 'La CPU no es una caja mágica vacía. La ALU calcula, la UC dirige las órdenes y los registros recuerdan los datos en tránsito.',
    hint: 'Haz clic en "Inspeccionar CPU" y monta la ALU, la UC y los Registros.',
    requiredComponents: ['cpu'],
    requiredCpuParts: ['alu', 'cu', 'pc', 'ir', 'mar', 'mdr', 'acc'],
    completed: false,
    stars: 3,
    badgeName: 'Cirujano de Silicio',
    badgeIcon: 'Cpu'
  },
  {
    id: 3,
    title: 'Misión 3: La Autopista Triple de Buses',
    objective: 'Conecta los tres tipos de buses del sistema: Bus de Datos, Bus de Direcciones y Bus de Control.',
    concept: 'Un solo bus no basta. El Bus de Direcciones dice a qué celda acudir, el Bus de Control dice si vamos a leer o escribir, y el Bus de Datos transporta el valor.',
    hint: 'Asegúrate de tener conectados los tres buses: Datos (celeste), Direcciones (morado) y Control (amarillo).',
    requiredComponents: ['data_bus', 'address_bus', 'control_bus'],
    completed: false,
    stars: 3,
    badgeName: 'Maestro del Cableado',
    badgeIcon: 'Network'
  },
  {
    id: 4,
    title: 'Misión 4: Conexión con el Mundo Exterior',
    objective: 'Añade el módulo de Interfaces de Entrada y Salida (E/S) para que el ordenador pueda comunicarse con el ser humano.',
    concept: 'Sin periféricos de entrada (teclado) y salida (pantalla), un ordenador sería una máquina ciega y muda, incapaz de recibir órdenes ni mostrar sus respuestas.',
    hint: 'Instala la Interfaz de E/S en la placa y prueba a enviar datos desde el teclado.',
    requiredComponents: ['cpu', 'ram', 'io_interface', 'data_bus', 'address_bus', 'control_bus'],
    completed: false,
    stars: 3,
    badgeName: 'Comunicador Digital',
    badgeIcon: 'Monitor'
  },
  {
    id: 5,
    title: 'Misión 5: El Ciclo de Instrucción Completo',
    objective: 'Ejecuta el programa de suma en el Simulador en Tiempo Real observando las cuatro fases: Búsqueda, Decodificación, Ejecución y Almacenamiento.',
    concept: 'El ciclo se repite millones de veces por segundo en cualquier móvil u ordenador actual: Fetch, Decode, Execute, Writeback.',
    hint: 'Pasa a la pestaña "Simulador en Vivo" y pulsa "Play" o avanza paso a paso hasta llegar a la instrucción HALT.',
    requiredComponents: ['cpu', 'ram', 'io_interface', 'data_bus', 'address_bus', 'control_bus'],
    targetProgramId: 'prog_sum',
    completed: false,
    stars: 3,
    badgeName: 'Arquitecto Von Neumann',
    badgeIcon: 'Award'
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '¿Cuál fue la gran innovación de John von Neumann en 1945?',
    options: [
      'Inventar las pantallas a color y el ratón inalámbrico.',
      'Almacenar tanto las instrucciones del programa como los datos en la misma memoria física.',
      'Hacer que los ordenadores no necesitaran electricidad.',
      'Separar físicamente los cálculos matemáticos en diez procesadores distintos.'
    ],
    correctAnswer: 1,
    explanation: '¡Exacto! Antes de Von Neumann, cambiar de programa requería recablear físicamente la máquina o cambiar tarjetas perforadas. El concepto de "Programa Almacenado" en la RAM permitió que los ordenadores fueran universales y reprogramables por software.'
  },
  {
    id: 2,
    question: '¿Qué componente de la CPU se encarga de sumar 5 + 7 o comparar si un número es mayor que otro?',
    options: [
      'La Unidad de Control (UC).',
      'El Bus de Direcciones.',
      'La ALU (Unidad Aritmético-Lógica).',
      'El disco duro externo.'
    ],
    correctAnswer: 2,
    explanation: '¡Correcto! La ALU (Arithmetic Logic Unit) es la calculadora interna de la CPU que ejecuta todas las operaciones matemáticas y comparaciones lógicas.'
  },
  {
    id: 3,
    question: '¿Cuál es la función del registro PC (Program Counter / Contador de Programa)?',
    options: [
      'Contar cuántas veces se ha encendido el ordenador.',
      'Guardar la dirección de memoria de la PRÓXIMA instrucción que se debe ejecutar.',
      'Guardar la contraseña del usuario.',
      'Controlar la temperatura del ventilador.'
    ],
    correctAnswer: 1,
    explanation: '¡Muy bien! El PC es el "marcapáginas" de la CPU: apunta a la celda de memoria donde está la siguiente instrucción y avanza automáticamente paso a paso.'
  },
  {
    id: 4,
    question: '¿Por qué el Bus de Direcciones es UNIDIRECCIONAL mientras que el Bus de Datos es BIDIRECCIONAL?',
    options: [
      'Porque los cables de datos son más gruesos que los de direcciones.',
      'Porque solo la CPU decide qué dirección consultar, mientras que los datos deben poder enviarse y recibirse.',
      'Porque el fabricante ahorra costes poniendo flechas en un solo sentido.',
      'En realidad ambos son bidireccionales en todos los casos.'
    ],
    correctAnswer: 1,
    explanation: '¡Excelente! La CPU es la que indica qué dirección de memoria o puerto de E/S quiere leer o escribir. En cambio, por el Bus de Datos la CPU puede tanto leer (memoria -> CPU) como escribir (CPU -> memoria/pantalla).'
  },
  {
    id: 5,
    question: '¿En qué fase del ciclo de instrucción la Unidad de Control interpreta qué significa la instrucción leída?',
    options: [
      'Fase de Búsqueda (Fetch).',
      'Fase de Decodificación (Decode).',
      'Fase de Enfriamiento.',
      'Fase de Apagado.'
    ],
    correctAnswer: 1,
    explanation: '¡Correcto! Tras traer la instrucción al registro IR en la fase de Búsqueda (Fetch), la Unidad de Control la decodifica (Decode) para entender qué operación se le pide (sumar, cargar, saltar...).'
  },
  {
    id: 6,
    question: '¿Qué se conoce históricamente como el "Cuello de Botella de Von Neumann"?',
    options: [
      'Que el teclado no puede escribir más rápido que los dedos humanos.',
      'La limitación de velocidad al compartir el bus para transferir tanto datos como instrucciones entre la CPU y la memoria.',
      'Que la pantalla necesita demasiada energía eléctrica.',
      'Que los cables se calientan si no tienen ventilador.'
    ],
    correctAnswer: 1,
    explanation: '¡Brillante! Como los datos y las instrucciones comparten los mismos buses y memoria principal, la CPU muchas veces tiene que esperar a que la memoria le entregue la información. Es uno de los retos de diseño más famosos de la informática moderna.'
  }
];
