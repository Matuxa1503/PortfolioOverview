export const connectWebSocket = (ws: React.RefObject<WebSocket | null>, streams: string, onMessageCallback: (data: any) => void) => {
  if (ws.current) {
    ws.current.close(); // разрыв старого соединения если осталось
  }

  ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.current.onopen = () => {
    console.log('WebSocket open');
  };

  ws.current.onmessage = (e) => {
    const message = JSON.parse(e.data);
    const data = message.data;
    onMessageCallback(data);
  };

  ws.current.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.current.onclose = () => {
    console.log('WebSocket closed');
  };

  return ws.current;
};
