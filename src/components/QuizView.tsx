import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  HelpCircle,
  Star
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/educationalContent';
import { sounds } from '../utils/soundEffects';

export const QuizView: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[question.id] !== undefined) return; // Already answered

    const isCorrect = optionIndex === question.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }

    setSelectedAnswers(prev => ({ ...prev, [question.id]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [question.id]: true }));
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      const score = calculateScore();
      if (score >= 4) {
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {
          // Fallback
        }
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleRestart = () => {
    sounds.playClick();
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
  };

  const score = calculateScore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-display font-bold text-white">
              Test de Autoevaluación ESO
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Pon a prueba lo que has aprendido sobre la arquitectura de Von Neumann, sus componentes y el ciclo de instrucción.
          </p>
        </div>

        {/* Question Counter */}
        {!isFinished && (
          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 font-bold shrink-0">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </div>
        )}
      </div>

      {!isFinished ? (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
              Desafío #{question.id}
            </span>
            <h3 className="text-base sm:text-lg font-display font-bold text-white leading-relaxed">
              {question.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const hasAnswered = selectedAnswers[question.id] !== undefined;
              const isSelected = selectedAnswers[question.id] === idx;
              const isCorrect = idx === question.correctAnswer;

              let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800/60';
              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/40';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation[question.id] && (
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              selectedAnswers[question.id] === question.correctAnswer
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  {selectedAnswers[question.id] === question.correctAnswer ? '¡Respuesta Correcta!' : 'Explicación del Concepto:'}
                </span>
              </div>
              <p>{question.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswers[question.id] !== undefined && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl transition-transform hover:scale-105"
              >
                <span>{currentQuestionIndex < totalQuestions - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="inline-block p-4 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-2xl text-white">
              ¡Has terminado el Test de la Arquitectura!
            </h3>
            <p className="text-slate-300 text-sm">
              Has acertado <strong className="text-emerald-400 text-base">{score}</strong> de <strong className="text-white text-base">{totalQuestions}</strong> preguntas.
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-xs text-slate-300">
            {score === 6 && '🏆 ¡Puntuación perfecta! Eres un auténtico experto en la Arquitectura de Von Neumann.'}
            {score >= 4 && score < 6 && '👏 ¡Muy buen trabajo! Entiendes perfectamente la estructura y el flujo de datos.'}
            {score < 4 && '💡 ¡Buen intento! Te recomendamos repasar las fichas didácticas y el simulador en vivo para consolidar los conceptos.'}
          </div>

          <div>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a Intentar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
