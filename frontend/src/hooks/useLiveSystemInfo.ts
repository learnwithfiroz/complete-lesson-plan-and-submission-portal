import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { useTranslation } from '../locales/i18n';

export interface LiveSystemInfo {
  ip: string;
  timeString: string;
  timeStringEn: string;
  dateString: string;
  dateStringEn: string;
  timezone: string;
  loading: boolean;
  copied: boolean;
  copyIp: () => void;
}

let cachedIp: string | null = null;

export const useLiveSystemInfo = (): LiveSystemInfo => {
  const { language } = useTranslation();
  const [ip, setIp] = useState<string>(cachedIp || 'Detecting...');
  const [timeString, setTimeString] = useState<string>('');
  const [timeStringEn, setTimeStringEn] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [dateStringEn, setDateStringEn] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(!cachedIp);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<any>(null);

  // Fetch IP Address
  useEffect(() => {
    if (cachedIp) {
      setIp(cachedIp);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchIp = async () => {
      try {
        const res = await apiClient.get('/api/v1/system/client-info');
        if (isMounted && res.data?.ip) {
          cachedIp = res.data.ip;
          setIp(res.data.ip);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to public ipify
        try {
          const fallbackRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) });
          const json = await fallbackRes.json();
          if (isMounted && json.ip) {
            cachedIp = json.ip;
            setIp(json.ip);
            setLoading(false);
            return;
          }
        } catch {
          if (isMounted) {
            setIp('127.0.0.1');
            setLoading(false);
          }
        }
      }
    };

    fetchIp();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time BD Clock (Asia/Dhaka UTC+6)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      // Bangla BD Time
      const bnTime = now.toLocaleTimeString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // English BD Time
      const enTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Bangla BD Date
      const bnDate = now.toLocaleDateString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      // English BD Date
      const enDate = now.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      setTimeString(bnTime);
      setTimeStringEn(enTime);
      setDateString(bnDate);
      setDateStringEn(enDate);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const copyIp = () => {
    if (!ip || ip === 'Detecting...') return;
    navigator.clipboard?.writeText(ip);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return {
    ip,
    timeString: language === 'bn' ? timeString : timeStringEn,
    timeStringEn,
    dateString: language === 'bn' ? dateString : dateStringEn,
    dateStringEn,
    timezone: 'Asia/Dhaka (BST +06)',
    loading,
    copied,
    copyIp,
  };
};