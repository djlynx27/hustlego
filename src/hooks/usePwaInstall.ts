import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SNOOZE_KEY = 'pwa-install-snoozed-until';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    return Date.now() < Number(raw);
  } catch {
    return false;
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    // ignore quota errors
  }
}

function clearSnooze() {
  try {
    localStorage.removeItem(SNOOZE_KEY);
    // backward-compat: also clear old key
    localStorage.removeItem('pwa-install-dismissed');
  } catch {
    // ignore
  }
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [snoozed, setSnoozed] = useState(() => isSnoozed());

  useEffect(() => {
    // Already running as standalone PWA or TWA — nothing to prompt
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      document.referrer.startsWith('android-app://')
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      // Browser fired the prompt again — clear any previous snooze
      clearSnooze();
      setSnoozed(false);
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      clearSnooze();
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    return outcome === 'accepted';
  };

  // Snooze for 7 days — re-asks next week
  const dismiss = () => {
    snooze();
    setSnoozed(true);
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled && !snoozed,
    isInstalled,
    install,
    dismiss,
  };
}
