import type { Notice } from '../types/notice';

/**
 * Triggers mobile haptic vibration if supported on the device (Android Chrome, Edge, Firefox, etc.)
 */
export const triggerMobileVibration = (pattern: number | number[] = [200, 100, 200, 100, 300]): boolean => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      return navigator.vibrate(pattern);
    }
  } catch (err) {
    // Vibration not supported or blocked by policy
  }
  return false;
};

/**
 * Synthesizes an institutional notification chime using Web Audio API
 */
export const playNoticeChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First Tone: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second Tone: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch {
    // Web Audio blocked or not supported
  }
};

/**
 * Comprehensive alert handler for new notice:
 * 1. Mobile Vibration (haptic)
 * 2. Audio Chime
 * 3. Browser Desktop/Push Notification
 */
export const triggerNoticeAlert = (notice: Notice) => {
  // 1. Mobile Vibration
  if (notice.priority === 'urgent' || notice.priority === 'high') {
    triggerMobileVibration([300, 100, 300, 100, 500]);
  } else {
    triggerMobileVibration([200, 100, 200]);
  }

  // 2. Audio Chime
  playNoticeChime();

  // 3. System Push/Desktop Notification if granted
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = notice.title_bn || notice.title_en || 'BSISC নতুন নোটিশ';
      const body = notice.content_bn || notice.content_en || 'একটি নতুন প্রাতিষ্ঠানিক নোটিশ প্রকাশিত হয়েছে।';
      new Notification(`📢 ${title}`, {
        body: body.length > 120 ? body.substring(0, 120) + '...' : body,
        icon: '/logo.png',
        badge: '/logo.png',
      });
    }
  } catch {
    // Notification error fallback
  }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'unsupported';
};