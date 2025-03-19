import { useEffect, useRef, useState } from 'react';
import { Modal } from './modal/Modal';
import { deleteAsset, setAssetsFromStorage, updateAsset } from './store/assetsSlice';
import { connectWebSocket } from './webSocketService';
import { useBinanceCoins } from './hooks/useBinanceCoins';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import './App.css';

// СДЕЛАТЬ СТИЛИЗАЦИЮ ЭТОЙ СТРАНИЦЫ И ЗАПУШИТЬ

const App = () => {
  const assets = useAppSelector((state) => state.assets);
  const dispatch = useAppDispatch();
  const { coins } = useBinanceCoins();
  const socketRef = useRef<WebSocket>(null);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);

  // localStorage
  useEffect(() => {
    const savedAssets = localStorage.getItem('assets');
    if (savedAssets) {
      const data = JSON.parse(savedAssets);
      if (data.length > 0) {
        dispatch(setAssetsFromStorage(data));
      }
    } else {
      localStorage.setItem('assets', '[]');
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets.assets));
  }, [assets.assets]);

  // webSocket
  useEffect(() => {
    if (!assets.tickers || assets.tickers.length === 0) return;
    const streams = assets.tickers.map((ticker) => `${ticker.toLowerCase()}@ticker`).join('/');

    // запуск интервала. Создание нового соединения в connectWebSocket и закрытие соединения через 3 секунды
    const connectAndHandleSocket = () => {
      socketRef.current = connectWebSocket(socketRef, streams, (data) =>
        dispatch(updateAsset({ coinName: data.s.toLowerCase(), price: Number(data.c), priceChange: Number(data.P) }))
      );

      const closeTimeout = setTimeout(() => {
        socketRef.current?.close();
      }, 3000);
      return closeTimeout;
    };

    const interval = setInterval(() => {
      const closeTimeout = connectAndHandleSocket();
      return () => clearTimeout(closeTimeout);
    }, 8000);

    return () => clearInterval(interval);
  }, [assets.tickers, dispatch]);

  const handleRemoveCoin = (coinName: string, totalPrice: number) => {
    dispatch(deleteAsset({ coinName, totalPrice }));

    // удаление из localStorage
    const savedAssets = JSON.parse(localStorage.getItem('assets') || '[]');
    const newAssets = savedAssets.filter((item: Asset) => item.name !== coinName);
    localStorage.setItem('assets', JSON.stringify(newAssets));
  };

  return (
    <>
      {isOpenModal && <Modal setOpenModal={setOpenModal} coins={coins} />}
      <div>
        <h1>Portfolio Overview</h1>
        <button onClick={() => setOpenModal(!isOpenModal)}>Добавить</button>
        <span>Цена портфеля: {assets.totalAssetsValue}$</span>
      </div>

      {assets.assets.length ? (
        <div className="tableMoney">
          <table>
            <tbody>
              <tr>
                <th>Актив</th>
                <th>Колич</th>
                <th>Цена</th>
                <th>Общ стоим</th>
                <th>Изм. за 24 ч.</th>
                <th>% портфеля</th>
              </tr>
              {assets.assets.map((asset, i) => (
                <tr className="asset" key={i} onClick={() => handleRemoveCoin(asset.name, asset.totalPrice)}>
                  <td>{asset.name}</td>
                  <td>{asset.count}</td>
                  <td>${asset.price}</td>
                  <td>${asset.totalPrice}</td>
                  <td>{asset.priceChange}%</td>
                  <td>{asset.walletPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>Нет активов в вашем портфеле. Добавьте что-нибудь, чтобы начать!</div>
      )}
    </>
  );
};

export default App;
