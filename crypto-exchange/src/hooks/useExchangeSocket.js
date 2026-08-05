import { useEffect, useRef } from 'react';

// Reusable generic WebSocket hook - reconnect/backoff logic এক জায়গায় কেন্দ্রীভূত।
// এখন Binance public WS-এর জন্য ব্যবহার হচ্ছে, real exchange backend/blockchain node
// WS চালু হলে শুধু url আর parser বদলে এই একই hook আবার ব্যবহার করা যাবে।
export const useExchangeSocket = ({ url, onMessage, enabled = true }) => {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || !url) return undefined;

    let isUnmounted = false;
    let reconnectTimeout;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        // exponential backoff reconnect - connection drop হলেও app চালিয়ে যাবে
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 15000);
        reconnectAttempts.current += 1;
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [url, enabled]);
};