import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { Modal } from './modal/Modal';
import axios from 'axios';
import { Ticker } from './interfaces/Ticker';
import { deleteAsset, setAssetsFromStorage, updateAssetPrice } from './store/assetsSlice';

const App = () => {
  const assets = useAppSelector((state) => state.assets);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [coins, setCoins] = useState<Ticker[]>([]);
  const dispatch = useAppDispatch();
  const ws = useRef<WebSocket>(null);

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

  useEffect(() => {
    if (!assets.tickers || assets.tickers.length === 0) {
      return;
    }

    const tickersArr = assets.tickers;
    const streams = tickersArr.map((ticker) => `${ticker}@ticker`).join('/');

    const interval = setInterval(() => {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.current.onopen = () => {
        console.log('WebSocket open');
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const data = message.data;
        console.log(data);

        dispatch(updateAssetPrice({ coinName: data.s.toLowerCase(), price: Number(data.c), priceChange: Number(data.P) }));
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket closed');
      };

      // Закрываем соединение через 3 секунды
      const closeTimeout = setTimeout(() => {
        ws.current?.close();
      }, 3000);

      // Очищаем таймаут при очистке эффекта
      return () => clearTimeout(closeTimeout);
    }, 8000); // Интервал 8 секунд

    return () => clearInterval(interval);
  }, [assets.tickers]);

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
