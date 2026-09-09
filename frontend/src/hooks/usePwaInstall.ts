import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: Array<() => void> = [];

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((l) => l());
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
  const isAndroid = /android/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    checkInstalled();

    const updateState = () => {
      setDeferredPrompt(globalDeferredPrompt);
      checkInstalled();
    };

    listeners.push(updateState);
    window.addEventListener('appinstalled', checkInstalled);

    return () => {
      const idx = listeners.indexOf(updateState);
      if (idx !== -1) listeners.splice(idx, 1);
      window.removeEventListener('appinstalled', checkInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return true;
        }
      } catch (err) {
        console.warn('Install prompt failed:', err);
      }
    }
    // If prompt wasn't available or couldn't be triggered, open guided modal
    setIsModalOpen(true);
    return false;
  };

  return {
    canInstall: !isInstalled,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    isAndroid,
    isIOS,
    isModalOpen,
    openInstallModal: () => setIsModalOpen(true),
    closeInstallModal: () => setIsModalOpen(false),
    promptInstall,
  };
}