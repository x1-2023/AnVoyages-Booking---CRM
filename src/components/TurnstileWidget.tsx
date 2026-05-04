import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

function loadTurnstileScript() {
  if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = TURNSTILE_SCRIPT_ID;
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export default function TurnstileWidget({ siteKey, onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    loadTurnstileScript();

    const renderWidget = () => {
      if (cancelled || !siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': () => {
          onExpire?.();
        },
        'error-callback': () => {
          onExpire?.();
        },
      });
    };

    const interval = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(interval);
        renderWidget();
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onExpire, onVerify]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="min-h-[65px]" />;
}
