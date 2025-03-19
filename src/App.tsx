import { FC, useEffect, useRef, useState } from 'react';
import { Modal } from './components/modal/Modal';
import { deleteAsset, setAssetsFromStorage, updateAsset } from './store/assetsSlice';
import { Asset } from './interfaces/interfaces';
import { connectWebSocket } from './services/webSocketService';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import s from './App.module.scss';
import { formatNumber } from './utils/utils';

const App: FC = () => {
  const assets = useAppSelector((state) => state.assets);
  const dispatch = useAppDispatch();
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
      {isOpenModal && <Modal setOpenModal={setOpenModal} />}
      <div className={s.header}>
        <h1 className={s.title}>Portfolio Overview</h1>
        <div className={s.info}>
          <span>
            Цена портфеля: <b>${formatNumber(assets.totalAssetsValue)}</b>
          </span>
          <button className={s.btn} onClick={() => setOpenModal(!isOpenModal)}>
            Добавить
          </button>
        </div>
      </div>

      {assets.assets.length ? (
        <table className={s.table}>
          <tbody className={s.tbody}>
            <tr>
              <th>Актив</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Общая стоимость</th>
              <th>Изм. за 24 ч.</th>
              <th>% портфеля</th>
            </tr>
            {assets.assets.map((asset, i) => (
              <tr className={s.asset} key={i} onClick={() => handleRemoveCoin(asset.name, asset.totalPrice)}>
                <td>{asset.name.toUpperCase()}</td>
                <td>{asset.count}</td>
                <td>${formatNumber(asset.price)}</td>
                <td>${formatNumber(asset.totalPrice)}</td>
                <td className={asset.priceChange >= 0 ? s.priceUp : s.priceDown}>{formatNumber(asset.priceChange)}%</td>
                <td>{formatNumber(asset.walletPercent)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Нет активов в вашем портфеле. Добавьте что-нибудь, чтобы начать!</div>
      )}
    </>
  );
};

export default App;
