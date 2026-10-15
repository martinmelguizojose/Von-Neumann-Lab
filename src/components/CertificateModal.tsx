import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Download, 
  CheckCircle2, 
  X, 
  Sparkles, 
  User, 
  GraduationCap, 
  Eye, 
  Calendar,
  Share2
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface CertificateModalProps {
  isOpen: boolean;
  studentName: string;
  studentGroup: string;
  onUpdateStudentName: (name: string, group: string) => void;
  onClose: () => void;
  onFocusPlateIn3D: () => void;
  get3DScreenshot?: () => string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  studentName,
  studentGroup,
  onUpdateStudentName,
  onClose,
  onFocusPlateIn3D,
  get3DScreenshot
}) => {
  const [localName, setLocalName] = useState<string>(studentName || '');
  const [localGroup, setLocalGroup] = useState<string>(studentGroup || '3º ESO');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      sounds.playFanfare();
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.55 }
        });
      } catch {
        // Fallback
      }

      if (get3DScreenshot) {
        try {
          const shot = get3DScreenshot();
          if (shot && shot.length > 50) {
            setScreenshotPreview(shot);
          }
        } catch {
          // Fallback
        }
      }
    }
  }, [isOpen, get3DScreenshot]);

  if (!isOpen) return null;

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalName(val);
    onUpdateStudentName(val, localGroup);
  };

  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalGroup(val);
    onUpdateStudentName(localName, val);
  };

  // Direct download of the 3D scene screenshot
  const handleDownloadDirect3DCapture = () => {
    if (!get3DScreenshot) return;
    try {
      sounds.playSnap();
      const shot = get3DScreenshot();
      if (!shot || shot.length < 50) return;
      const finalName = (localName && localName.trim()) ? localName.trim().toUpperCase() : 'ALUMNO';
      const link = document.createElement('a');
      link.download = `Captura_3D_Placa_Base_${finalName.replace(/\s+/g, '_')}_IES_Beatriz_Galindo.png`;
      link.href = shot;
      link.click();
    } catch {
      // Fallback
    }
  };

  // Generate and download high-resolution official certificate / screenshot PNG
  const handleDownloadCertificate = () => {
    setIsDownloading(true);
    sounds.playSnap();

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark executive PCB gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.4, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. High-tech circuit background patterns
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let i = 0; i < w; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 60) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // 3. Luxurious double borders (Gold + Cyan)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, w - 96, h - 96);

      // Corner rivets
      const drawCornerRivet = (cx: number, cy: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.stroke();
      };
      drawCornerRivet(60, 60);
      drawCornerRivet(w - 60, 60);
      drawCornerRivet(60, h - 60);
      drawCornerRivet(w - 60, h - 60);

      // 4. Header: Institute & Department
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IES BEATRIZ GALINDO LA LATINA', w / 2, 110);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DEPARTAMENTO DE TECNOLOGÍA E INFORMÁTICA // CURSO 2026', w / 2, 148);

      // 5. Title of Diploma
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DIPLOMA DE ACREDITACIÓN TÉCNICA', w / 2, 215);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 28px "Chakra Petch", sans-serif';
      ctx.fillText('ARQUITECTURA DE COMPUTADORES DE VON NEUMANN', w / 2, 260);

      // Divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 285);
      ctx.lineTo(w - 200, 285);
      ctx.stroke();

      // 6. Certification statement
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'normal 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Se certifica solemnemente que el/la alumno/a:', w / 2, 330);

      // 7. Student Name (Big, bold, gold embossed with glow)
      const finalName = (localName && localName.trim()) ? localName.trim().toUpperCase() : 'ALUMNO/A';
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 18;
      ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(finalName, w / 2, 405);
      ctx.shadowBlur = 0; // reset

      // Group
      const finalGroup = (localGroup && localGroup.trim()) ? localGroup.trim().toUpperCase() : 'ESO';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px "Fira Code", monospace';
      ctx.fillText(`CURSO Y GRUPO: ${finalGroup}`, w / 2, 455);

      // 8. Completed Phases Section (Dual Badge)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'normal 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ha superado con máxima calificación las dos fases prácticas de aprendizaje:', w / 2, 510);

      // Box 1: Phase 1
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(200, 545, 560, 100);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 545, 560, 100);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✓ FASE 1: PUZZLE 2D SUPERADO', 225, 585);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'normal 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CPU (ALU, UC, Registros), RAM, Buses y E/S', 225, 620);

      // Box 2: Phase 2
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(840, 545, 560, 100);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(840, 545, 560, 100);

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ FASE 2: MONTAJE 3D DESDE CERO', 865, 585);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'normal 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Placa base 3D ensamblada y verificada funcionalmente', 865, 620);

      // 9. If screenshot available, embed it or draw motherboard signature badge
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(200, 680, w - 400, 160);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 680, w - 400, 160);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`PLACA BASE GRABADA: [${finalName}] - IES BEATRIZ GALINDO LA LATINA`, w / 2, 730);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 18px "Fira Code", monospace';
      ctx.fillText('VERIFICACIÓN DEL SISTEMA: 7/7 PIEZAS CONECTADAS Y SINCRONIZADAS AL 100%', w / 2, 775);
      ctx.fillStyle = '#10b981';
      ctx.fillText('ORDENADOR OPERATIVO // PROGRAMA ALMACENADO VALIDADO', w / 2, 810);

      // 10. Footer with Date and Seal
      const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Madrid, a ${today} // Acreditación oficial para evaluación del profesor`, w / 2, 890);

      // Digital validation code
      const hash = `IESBG-VN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 15px "Fira Code", monospace';
      ctx.fillText(`CÓDIGO DE VALIDACIÓN: ${hash}`, w / 2, 925);

      // Download trigger
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Acreditacion_Von_Neumann_${finalName.replace(/\s+/g, '_')}.png`;
      link.href = imageURL;
      link.click();

      setTimeout(() => setIsDownloading(false), 800);
    } catch {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6">
        
        {/* Close Button 'X' */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold font-mono tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>IES Beatriz Galindo La Latina // Acreditación Oficial</span>
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wide">
            ¡Enhorabuena! Has completado ambos niveles
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Introduce tu nombre para <strong>grabar tu placa base</strong> y descargar la captura oficial de acreditación para tu profesor/a.
          </p>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="sm:col-span-8 space-y-1">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Nombre y Apellidos del alumno/a:</span>
            </label>
            <input
              type="text"
              value={localName}
              onChange={handleNameInputChange}
              placeholder="Ej: Lucía García Martínez"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none font-semibold transition-all"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curso / Grupo:</span>
            </label>
            <input
              type="text"
              value={localGroup}
              onChange={handleGroupInputChange}
              placeholder="Ej: 3º ESO A"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none font-semibold transition-all"
            />
          </div>
        </div>

        {/* Live Preview of the Motherboard Engraved Plate */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/70 shadow-lg relative text-center space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span className="text-amber-400 font-bold">PLACA GRABADA EN TIEMPO REAL:</span>
            <span className="text-emerald-400 font-semibold">✓ Grabado en placa 3D activo</span>
          </div>

          <div className="py-2 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono tracking-wider block">
              IES BEATRIZ GALINDO LA LATINA • ARQUITECTURA VON NEUMANN
            </span>
            <h4 className="font-display font-bold text-xl sm:text-2xl text-amber-300 uppercase tracking-wide">
              {localName.trim() || 'NOMBRE DEL ALUMNO/A'}
            </h4>
            <span className="text-xs text-cyan-300 font-mono font-bold block">
              {localGroup.trim() ? `CURSO: ${localGroup.trim().toUpperCase()}` : '3º ESO - TECNOLOGÍA'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-300">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nivel 1 (2D): Superado</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nivel 2 (3D): Superado</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onFocusPlateIn3D();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Enfocar la cámara 3D sobre la placa grabada"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Ver Placa en 3D</span>
          </button>

          {get3DScreenshot && (
            <button
              onClick={handleDownloadDirect3DCapture}
              className="w-full sm:w-auto flex-1 py-3 px-3 rounded-2xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/60 text-cyan-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              title="Descargar captura directa del visor 3D"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Captura 3D (.PNG)</span>
            </button>
          )}

          <button
            onClick={handleDownloadCertificate}
            disabled={isDownloading}
            className="w-full sm:w-auto flex-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition-transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            <span>{isDownloading ? 'Generando diploma...' : 'Descargar Diploma Oficial (.PNG)'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Guarda o envía la imagen descargada a tu profesor para demostrar que has superado ambos niveles.
        </p>
      </div>
    </div>
  );
};
