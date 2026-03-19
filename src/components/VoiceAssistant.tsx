import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Types Web Speech API (non standardisés — pas dans lib.dom.d.ts par défaut) ──

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface VoiceAssistantProps {
  /** Zone recommandée affichée en hero card */
  heroZone: { name: string; score: number; type: string } | null;
  /** Zones alternatives triées par score */
  smartZones: Array<{ name: string; distKm: number; arrivalScore: number }>;
  /** Prochain événement Ticketmaster (optionnel) */
  nextEvent: { name: string; venueName: string } | null;
  onStartShift?: () => void;
  onEndShift?: () => void;
}

type SpeechStatus = 'idle' | 'listening' | 'speaking';

// ── Commandes ─────────────────────────────────────────────────────────────────

const COMMANDS = [
  {
    patterns: ['où aller', 'meilleure zone', 'quelle zone', 'zone recommandée', 'où vas'],
    action: 'best_zone' as const,
  },
  {
    patterns: ['démarrer shift', 'commencer shift', 'début shift', 'start shift'],
    action: 'start_shift' as const,
  },
  {
    patterns: ['terminer shift', 'arrêter shift', 'fin shift', 'end shift', 'stop shift', 'finir shift'],
    action: 'end_shift' as const,
  },
  {
    patterns: ["combien j'ai fait", 'mes gains', 'mes revenus', "j'ai fait", 'combien gagné'],
    action: 'earnings' as const,
  },
  {
    patterns: ['prochain événement', 'prochain event', 'quel événement'],
    action: 'next_event' as const,
  },
  {
    patterns: ['aide', 'help', 'commandes', 'quoi dire'],
    action: 'help' as const,
  },
] as const;

type CommandAction = (typeof COMMANDS)[number]['action'];

/** Normalise les accents pour la comparaison des commandes */
function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchCommand(transcript: string): CommandAction | null {
  const normalized = stripAccents(transcript.toLowerCase());
  for (const cmd of COMMANDS) {
    const matched = cmd.patterns.some((p) => normalized.includes(stripAccents(p)));
    if (matched) return cmd.action;
  }
  return null;
}

// ── Speech Synthesis ──────────────────────────────────────────────────────────

let frenchVoice: SpeechSynthesisVoice | null = null;

function loadFrenchVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  frenchVoice =
    voices.find((v) => v.lang === 'fr-CA') ??
    voices.find((v) => v.lang === 'fr-FR') ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    null;
}

function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 1.05;
  if (frenchVoice) utterance.voice = frenchVoice;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

// ── Composant ─────────────────────────────────────────────────────────────────

/**
 * Assistant vocal mains-libres pour HustleGo.
 *
 * Commandes supportées :
 * "Où aller"          → annonce la zone la mieux scorée
 * "Démarrer shift"    → démarre le shift tracker
 * "Terminer shift"    → termine le shift
 * "Combien j'ai fait" → redirige vers Drive
 * "Prochain événement"→ annonce le prochain événement
 * "Aide"              → liste les commandes
 *
 * 100% gratuit — Web Speech API native, aucune dépendance externe.
 */
export function VoiceAssistant({
  heroZone,
  smartZones,
  nextEvent,
  onStartShift,
  onEndShift,
}: VoiceAssistantProps) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Référence stable vers les props pour le callback de reconnaissance
  const propsRef = useRef({ heroZone, smartZones, nextEvent, onStartShift, onEndShift });
  useEffect(() => {
    propsRef.current = { heroZone, smartZones, nextEvent, onStartShift, onEndShift };
  });

  const handleAction = useCallback((action: CommandAction | null) => {
    setStatus('speaking');
    const { heroZone: hz, smartZones: sz, nextEvent: ne, onStartShift: oss, onEndShift: oes } =
      propsRef.current;

    switch (action) {
      case 'best_zone': {
        if (hz) {
          const second = sz.find((z) => z.name !== hz.name);
          const msg =
            `Zone recommandée : ${hz.name}, score ${hz.score} sur cent.` +
            (second
              ? ` Deuxième option : ${second.name}, à ${second.distKm.toFixed(1)} kilomètres.`
              : '');
          speak(msg, () => setStatus('idle'));
        } else {
          speak('Chargement des zones en cours, réessaie dans un instant.', () => setStatus('idle'));
        }
        break;
      }
      case 'start_shift': {
        oss?.();
        speak('Shift démarré. Bonne chance sur la route !', () => setStatus('idle'));
        break;
      }
      case 'end_shift': {
        oes?.();
        speak('Shift terminé. Bien joué !', () => setStatus('idle'));
        break;
      }
      case 'earnings': {
        speak(
          "Ouvre l'onglet Drive pour consulter tes gains du shift en cours.",
          () => setStatus('idle'),
        );
        break;
      }
      case 'next_event': {
        if (ne) {
          speak(`Prochain événement : ${ne.name} à ${ne.venueName}.`, () => setStatus('idle'));
        } else {
          speak('Aucun événement majeur dans les prochaines heures.', () => setStatus('idle'));
        }
        break;
      }
      case 'help': {
        speak(
          "Commandes disponibles : où aller, démarrer shift, terminer shift, combien j'ai fait, prochain événement.",
          () => setStatus('idle'),
        );
        break;
      }
      default: {
        speak(
          "Commande non reconnue. Dis : où aller, ou aide pour la liste des commandes.",
          () => setStatus('idle'),
        );
      }
    }
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }

    loadFrenchVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', loadFrenchVoice);
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const alternatives: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results.item(i);
        for (let j = 0; j < result.length; j++) {
          alternatives.push(result.item(j).transcript);
        }
      }
      const transcript = alternatives.join(' ');
      setLastTranscript(transcript);
      handleAction(matchCommand(transcript));
    };

    recognition.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus('idle');
    };

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadFrenchVoice);
      }
      recognition.abort();
    };
  }, [handleAction]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported || status !== 'idle') return;

    setStatus('listening');
    setLastTranscript('');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.abort();
      setStatus('idle');
    }, 8_000);

    try {
      recognitionRef.current.start();
    } catch {
      setStatus('idle');
    }
  }, [isSupported, status]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    recognitionRef.current?.abort();
    setStatus('idle');
  }, []);

  if (!isSupported) return null;

  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {/* Bulle de transcript */}
      {lastTranscript && (
        <div className="bg-card border border-border rounded-xl px-3 py-2 max-w-[200px] shadow-lg pointer-events-auto">
          <p className="text-[12px] text-muted-foreground font-body leading-tight italic">
            &ldquo;{lastTranscript}&rdquo;
          </p>
        </div>
      )}

      {/* Indicateur d'écoute active */}
      {isListening && (
        <div className="bg-destructive/90 text-destructive-foreground rounded-xl px-3 py-1.5 shadow pointer-events-none">
          <p className="text-[12px] font-display font-bold">🎙 J&apos;écoute…</p>
        </div>
      )}

      {/* Bouton micro flottant */}
      <button
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Arrêter l'écoute" : "Activer l'assistant vocal"}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 pointer-events-auto ${
          isListening
            ? 'bg-destructive text-destructive-foreground scale-110 ring-4 ring-destructive/30 animate-pulse'
            : isSpeaking
              ? 'bg-primary text-primary-foreground scale-105 ring-2 ring-primary/30'
              : 'bg-card border border-border text-foreground hover:bg-muted active:scale-95'
        }`}
      >
        {isSpeaking ? (
          <Volume2 className="w-6 h-6" />
        ) : isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
