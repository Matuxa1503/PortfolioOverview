import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { Modal } from './modal/Modal';
import axios from 'axios';
import { Ticker } from './interfaces/Ticker';
import { deleteAsset, setAssetsFromStorage, updateAssetPrice } from './store/assetsSlice';
import { connectWebSocket } from './webSocketService';

const App = () => {
  const assets = useAppSelector((state) => state.assets);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [coins, setCoins] = useState<Ticker[]>([]);
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket>(null);

  const getBinanceData = async () => {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      setCoins(res.data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    // all coins
    getBinanceData();

    // localStorage
    if (!localStorage.getItem('assets')) {
      localStorage.setItem('assets', '[]');
    } else {
      const data = JSON.parse(localStorage.getItem('assets') || '[]');
      if (data.length > 0) {
        dispatch(setAssetsFromStorage(data));
      }
    }
  }, []);

  // webSocket
  useEffect(() => {
    if (!assets.tickers || assets.tickers.length === 0) return;

    const streams = assets.tickers.map((ticker) => `${ticker}@ticker`).join('/');

    // запуск интервала. Создание нового соединения в connectWebSocket и закрытие соединения через 3 секунды
    const connectAndHandleSocket = () => {
      socketRef.current = connectWebSocket(socketRef, streams, (data) =>
        dispatch(updateAssetPrice({ coinName: data.s.toLowerCase(), price: Number(data.c), priceChange: Number(data.P) }))
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

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets.assets));
  }, [assets.assets]);

  const handleRemoveCoin = (coinName: string, totalPrice: number) => {
    dispatch(deleteAsset({ coinName, totalPrice }));

    // удаление из localStorage
    const assetsArr = JSON.parse(localStorage.getItem('assets') || '[]');
    const newAssetsArr = assetsArr.filter((item) => item.name !== coinName);
    localStorage.setItem('assets', JSON.stringify(newAssetsArr));
  };

  return (
    <>
      {isOpenModal && <Modal setOpenModal={setOpenModal} coins={coins} />}
      <div>
        <h1>Portfolio Overview</h1>
        <button
          onClick={() => {
            setOpenModal(!isOpenModal);
            document.body.style.overflow = 'hidden';
          }}
        >
          Добавить
        </button>
      </div>
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
    </>
  );
};

export default App;
