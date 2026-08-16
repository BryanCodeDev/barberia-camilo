import { useEffect, useRef, useCallback, useState } from 'react';

const WS_BASE_URL = (() => {
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  if (apiBase.startsWith('https://')) {
    return apiBase.replace('/api', '').replace(/^https/, 'wss');
  }
  if (apiBase.startsWith('http://')) {
    return apiBase.replace('/api', '').replace(/^http/, 'ws');
  }
  return apiBase.replace('/api', '');
})();

const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const PING_INTERVAL = 30000;

let sharedWs = null;
let sharedReconnectTimeout = null;
const sharedListeners = new Map();
const sharedConnectionStateListeners = new Set();

function getConnectionState() {
  if (!sharedWs) return 'disconnected';
  if (sharedWs.readyState === WebSocket.CONNECTING) return 'connecting';
  if (sharedWs.readyState === WebSocket.OPEN) return 'connected';
  if (sharedWs.readyState === WebSocket.CLOSING) return 'closing';
  return 'disconnected';
}

function setConnectionState(state) {
  sharedConnectionStateListeners.forEach((fn) => {
    try { fn(state); } catch { /* noop */ }
  });
}

function notifyListeners(event, data) {
  const listeners = sharedListeners.get(event) || new Set();
  listeners.forEach((fn) => {
    try { fn(data); } catch { /* noop */ }
  });
}

function connect(token) {
  if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  if (sharedReconnectTimeout) {
    clearTimeout(sharedReconnectTimeout);
    sharedReconnectTimeout = null;
  }

  setConnectionState('connecting');

  const url = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(url);
  sharedWs = ws;

  let pingTimer = null;

  ws.onopen = () => {
    setConnectionState('connected');
    pingTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, PING_INTERVAL);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type && message.type !== 'pong' && message.type !== 'connected') {
        notifyListeners(message.type, message);
      }
      if (message.type === 'session:replaced') {
        notifyListeners('session:replaced', message);
      }
    } catch {
      // ignore
    }
  };

  ws.onclose = (event) => {
    if (pingTimer) clearInterval(pingTimer);
    sharedWs = null;
    setConnectionState('disconnected');

    if (!event.wasClean && token) {
      const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, Math.floor(Math.random() * 3)), RECONNECT_MAX_DELAY);
      sharedReconnectTimeout = setTimeout(() => {
        sharedReconnectTimeout = null;
        connect(token);
      }, delay);
    }
  };

  ws.onerror = () => {
    // errors are handled by onclose
  };
}

function disconnect() {
  if (sharedReconnectTimeout) {
    clearTimeout(sharedReconnectTimeout);
    sharedReconnectTimeout = null;
  }
  if (sharedWs) {
    sharedWs.onclose = null;
    sharedWs.close(1000, 'Client disconnect');
    sharedWs = null;
  }
  setConnectionState('disconnected');
}

export function useWebSocket(token) {
  const [connectionState, setLocalConnectionState] = useState(getConnectionState());
  const listenersRef = useRef(new Map());

  useEffect(() => {
    const handler = (state) => setLocalConnectionState(state);
    sharedConnectionStateListeners.add(handler);
    return () => sharedConnectionStateListeners.delete(handler);
  }, []);

  useEffect(() => {
    if (!token) return;
    connect(token);
    return () => {
      // We don't disconnect here because other components may still need it.
      // Disconnect is handled explicitly.
    };
  }, [token]);

  const subscribe = useCallback((event, callback) => {
    if (!sharedListeners.has(event)) {
      sharedListeners.set(event, new Set());
    }
    sharedListeners.get(event).add(callback);

    return () => {
      const set = sharedListeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) sharedListeners.delete(event);
      }
    };
  }, []);

  const unsubscribeAll = useCallback(() => {
    sharedListeners.clear();
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    subscribe,
    unsubscribeAll,
    disconnect,
  };
}

export default useWebSocket;
