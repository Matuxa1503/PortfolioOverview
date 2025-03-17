import { useEffect, useState } from 'react';
import './App.css';
import { useAppSelector } from './store/hooks';
import { Modal } from './modal/Modal';
import axios from 'axios';
import { Ticker } from './interfaces/Ticker';

const App = () => {
  const assets = useAppSelector((state) => state.assets.assets);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [coins, setCoins] = useState<Ticker[]>([]);

  const getBinanceData = async () => {
    try {
      const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      setCoins(res.data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    getBinanceData();
  }, []);

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
            {assets.map((asset) => (
              <tr key={asset.id}>
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
