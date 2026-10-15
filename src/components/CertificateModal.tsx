import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  X, 
  Sparkles, 
  User, 
  GraduationCap, 
  Eye, 
  ExternalLink,
  Download
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
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  // Real generated diploma image URLs for direct, foolproof download
  const [diplomaDataUrl, setDiplomaDataUrl] = useState<string | null>(null);
  const [diplomaBlobUrl, setDiplomaBlobUrl] = useState<string | null>(null);
  const [cleanFileName, setCleanFileName] = useState<string>('Diploma_Von_Neumann_ALUMNO_IES_Beatriz_Galindo.png');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Initial fanfare & snapshot
  useEffect(() => {
    if (isOpen) {
      sounds.playFanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 75,
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

  // Clean filename generator: strips accents and slashes so macOS/Windows ALWAYS preserves the .png extension
  const getSafeFileName = (name: string): string => {
    const raw = (name && name.trim()) ? name.trim() : 'ALUMNO';
    const safe = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents (á -> a)
      .replace(/[^a-zA-Z0-9_-]/g, '_') // remove slashes, spaces, punctuation
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'ALUMNO';
    return `Diploma_Von_Neumann_${safe}_IES_Beatriz_Galindo.png`;
  };

  // Synchronously draw the diploma onto a Canvas element
  const drawDiplomaToCanvas = (
    name: string,
    group: string,
    loadedImg: HTMLImageElement | null
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const w = canvas.width;
    const h = canvas.height;
    const displayName = (name && name.trim()) ? name.trim().toUpperCase() : 'ALUMNO/A';
    const displayGroup = (group && group.trim()) ? group.trim().toUpperCase() : '3º ESO';

    // 1. Dark tech PCB background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.35, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle cyber grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < w; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 50) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }

    // 2. Luxury double borders (Gold + Cyan)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 14;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, w - 92, h - 92);

    // Corner rivets
    const drawRivet = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();
    };
    drawRivet(58, 58);
    drawRivet(w - 58, 58);
    drawRivet(58, h - 58);
    drawRivet(w - 58, h - 58);

    // 3. Top Header: Institute Name (prominent)
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IES BEATRIZ GALINDO LA LATINA', w / 2, 95);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DEPARTAMENTO DE TECNOLOGÍA E INFORMÁTICA // ACREDITACIÓN PRÁCTICA', w / 2, 130);

    // Title of Diploma
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DIPLOMA DE ACREDITACIÓN Y ENSAMBLAJE', w / 2, 190);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 26px "Chakra Petch", sans-serif';
    ctx.fillText('ARQUITECTURA DE COMPUTADORES DE VON NEUMANN', w / 2, 230);

    // Divider
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(120, 255);
    ctx.lineTo(w - 120, 255);
    ctx.stroke();

    // 4. Student Certification statement
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Se certifica solemnemente que el/la alumno/a:', w / 2, 292);

    // Student Name in bold gold glow
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 18;
    ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(displayName, w / 2, 355);
    ctx.shadowBlur = 0; // reset glow

    // Course / Group
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Fira Code", monospace';
    ctx.fillText(`CURSO Y GRUPO: ${displayGroup}`, w / 2, 395);

    // 5. Dual Section: Left (Criteria & Badges) vs Right (Motherboard Capture)
    const leftX = 75;
    const leftW = 570;

    // Box 1: Phase 1 (2D Puzzle)
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(leftX, 430, leftW, 110);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(leftX, 430, leftW, 110);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✓ FASE 1: PUZZLE 2D SUPERADO', leftX + 20, 468);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'normal 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• CPU (ALU, Unidad de Control, Registros)', leftX + 20, 498);
    ctx.fillText('• Memoria RAM, Buses y Entrada/Salida conectados', leftX + 20, 523);

    // Box 2: Phase 2 (3D Workshop Assembly from scratch)
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(leftX, 560, leftW, 110);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(leftX, 560, leftW, 110);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✓ FASE 2: MONTAJE 3D DESDE CERO', leftX + 20, 598);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'normal 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('• Placa base física ensamblada pieza por pieza', leftX + 20, 628);
    ctx.fillText('• Funcionamiento verificado con ciclo de cálculo 2+3=5', leftX + 20, 653);

    // Box 3: Motherboard Engraving statement
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(leftX, 690, leftW, 110);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(leftX, 690, leftW, 110);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✓ PLACA BASE GRABADA Y VALIDADA', leftX + 20, 728);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Nombre grabado en placa: [${displayName}]`, leftX + 20, 758);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "Fira Code", monospace';
    ctx.fillText('100% OPERATIVO // PROGRAMA ALMACENADO', leftX + 20, 783);

    // Right Section: The Actual 3D Motherboard Screenshot
    const rightX = 675;
    const rightW = 850;
    const frameY = 430;
    const frameH = 370;

    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(rightX, frameY, rightW, frameH);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(rightX, frameY, rightW, frameH);

    // Frame Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📸 CAPTURA DE LA PLACA BASE 3D ENSAMBLADA POR EL ALUMNO', rightX + 20, frameY + 30);

    if (loadedImg && loadedImg.width > 0) {
      const imgPad = 12;
      const imgX = rightX + imgPad;
      const imgY = frameY + 45;
      const imgW = rightW - imgPad * 2;
      const imgH = frameH - 45 - imgPad;
      ctx.drawImage(loadedImg, imgX, imgY, imgW, imgH);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(imgX, imgY, imgW, imgH);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Montaje 3D completado y sincronizado en el Taller Oficial', rightX + rightW / 2, frameY + frameH / 2);
    }

    // 6. Security & Digital Certification Bar
    const sealY = 825;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(75, sealY, w - 150, 85);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(75, sealY, w - 150, 85);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VERIFICACIÓN DEL SISTEMA: 7/7 PIEZAS MONTADAS Y CONECTADAS AL 100%', 95, sealY + 35);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'normal 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ambos niveles superados: Comprensión teórica 2D y destreza técnica de ensamblaje en taller 3D.', 95, sealY + 62);

    const valHash = `IESBG-VN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Fira Code", monospace';
    ctx.fillText(`CÓDIGO: ${valHash}`, w - 95, sealY + 38);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ESTADO: APTO Y VERIFICADO', w - 95, sealY + 62);

    // 7. Footer with Date and Official Stamp
    const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = 'normal 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Madrid, a ${today} • Acreditación oficial para la evaluación del profesor/a • IES Beatriz Galindo La Latina`, w / 2, 960);

    return canvas;
  };

  // Re-generate the diploma image whenever name, group or 3D screenshot changes
  useEffect(() => {
    if (!isOpen) return;
    setIsGenerating(true);

    const fileName = getSafeFileName(localName);
    setCleanFileName(fileName);

    const applyCanvas = (img: HTMLImageElement | null) => {
      try {
        const canvas = drawDiplomaToCanvas(localName, localGroup, img);
        const dataUrl = canvas.toDataURL('image/png');
        setDiplomaDataUrl(dataUrl);

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], fileName, { type: 'image/png' });
              const blobUrl = URL.createObjectURL(file);
              setDiplomaBlobUrl(blobUrl);
            }
            setIsGenerating(false);
          }, 'image/png');
        } else {
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Error drawing diploma canvas:', err);
        setIsGenerating(false);
      }
    };

    if (screenshotPreview && screenshotPreview.length > 50) {
      const img = new Image();
      img.onload = () => applyCanvas(img);
      img.onerror = () => applyCanvas(null);
      img.src = screenshotPreview;
    } else {
      applyCanvas(null);
    }
  }, [isOpen, localName, localGroup, screenshotPreview]);

  if (!isOpen) return null;

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalName(val);
    onUpdateStudentName(val, localGroup);
    if (get3DScreenshot) {
      setTimeout(() => {
        try {
          const shot = get3DScreenshot();
          if (shot) setScreenshotPreview(shot);
        } catch {
          // Fallback
        }
      }, 50);
    }
  };

  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalGroup(val);
    onUpdateStudentName(localName, val);
  };

  // Manual fallback download triggered on click if needed
  const handleManualDownload = () => {
    sounds.playSnap();
    const targetUrl = diplomaBlobUrl || diplomaDataUrl;
    if (!targetUrl) return;

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = cleanFileName;
    link.setAttribute('download', cleanFileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 400);
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
            Introduce tu nombre para <strong>grabar tu placa base</strong> y descargar el diploma oficial con la captura de tu montaje para el profesor/a.
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

        {/* Live Diploma Official Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/70 shadow-lg relative space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span className="text-amber-400 font-bold">VISTA PREVIA DEL DIPLOMA OFICIAL (PNG):</span>
            <span className="text-emerald-400 font-semibold">✓ Grabación 3D en tiempo real</span>
          </div>

          {/* Render the actual generated diploma image */}
          {diplomaDataUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-amber-500/40 shadow-inner bg-slate-950">
              <img 
                src={diplomaDataUrl} 
                alt="Diploma Oficial de Arquitectura Von Neumann" 
                className="w-full h-auto max-h-56 object-contain mx-auto"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-[11px] text-amber-300 font-mono border border-amber-500/40 flex items-center gap-1">
                <span>📸 Captura oficial incluida</span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-mono">
              <span>Generando vista previa del diploma...</span>
            </div>
          )}

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

        {/* SINGLE UNIFIED NATIVE DOWNLOAD BUTTON */}
        <div className="space-y-3 pt-2">
          <a
            href={diplomaBlobUrl || diplomaDataUrl || '#'}
            download={cleanFileName}
            onClick={handleManualDownload}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-bold text-base sm:text-lg shadow-2xl shadow-amber-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer text-center no-underline select-none"
          >
            <Award className="w-6 h-6 shrink-0" />
            <span>
              {isGenerating ? 'Actualizando diploma...' : 'Descargar Diploma Oficial con Captura de Placa (.PNG)'}
            </span>
          </a>

          {/* Secondary helper actions for maximum resilience */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
            <button
              onClick={() => {
                sounds.playClick();
                onFocusPlateIn3D();
                onClose();
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver mi placa grabada en 3D</span>
            </button>

            {diplomaDataUrl && (
              <a
                href={diplomaDataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors underline decoration-amber-500/40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir diploma en pantalla completa</span>
              </a>
            )}
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            💡 El archivo se guardará como <strong>{cleanFileName}</strong>. También puedes hacer clic derecho sobre la vista previa arriba y seleccionar "Guardar imagen como...".
          </p>
        </div>
      </div>
    </div>
  );
};
