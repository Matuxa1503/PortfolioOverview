import { useEffect, useState } from 'react';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { Modal } from './modal/Modal';
import axios from 'axios';
import { Ticker } from './interfaces/Ticker';
import { deleteAsset, setAssetsFromStorage } from './store/assetsSlice';

const App = () => {
  const assets = useAppSelector((state) => state.assets.assets);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [coins, setCoins] = useState<Ticker[]>([]);
  const dispatch = useAppDispatch();

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

    if (!localStorage.getItem('assets')) {
      localStorage.setItem('assets', '[]');
    } else {
      const data = JSON.parse(localStorage.getItem('assets') || '[]');
      if (data.length > 0) {
        dispatch(setAssetsFromStorage(data));
      }
    }
  }, []);

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
            {assets.map((asset, i) => (
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
