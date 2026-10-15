export type PieceId = 
  | 'memoria'
  | 'cpu'
  | 'alu'
  | 'uc'
  | 'registros'
  | 'io'
  | 'buses';

export interface PuzzlePiece {
  id: PieceId;
  name: string;
  shortName: string;
  category: 'exterior' | 'cpu_interior' | 'cableado';
  color: string;
  bgLight: string;
  borderColor: string;
  iconName: string;
  kidDescription: string;
  analogy: string;
  targetSlot: string; // 'slot_memoria' | 'slot_cpu' | 'slot_alu' | 'slot_uc' | 'slot_registros' | 'slot_io' | 'slot_buses'
}

export type PlacedPiecesState = Record<PieceId, boolean>;
