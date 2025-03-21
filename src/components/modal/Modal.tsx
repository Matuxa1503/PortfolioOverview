import { FC, useEffect, useState } from 'react';
import { addAsset } from '../../store/assetsSlice';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { ModalProps, SelectedCoin, Ticker } from '../../interfaces/interfaces';
import { useBinanceCoins } from '../../hooks/useBinanceCoins';
import { popularCoins } from '../../constants/popularCoins';
import { filterCoins, formatNumber } from '../../utils/utils';
import s from './Modal.module.scss';
import { Loader } from '../loader/Loader';

export const Modal: FC<ModalProps> = ({ setOpenModal }) => {
  const [text, setText] = useState<string>('');
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const { coinsBinance } = useBinanceCoins();
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (coinsBinance.length > 0) {
      setLoading(false);
    }
  }, [coinsBinance]);

  const topCoins = popularCoins
    .map((popularCoin) => coinsBinance.find((coin) => coin.symbol === popularCoin))
    .filter((coin): coin is Ticker => coin !== undefined);

  const filteredCoins = filterCoins(coinsBinance, topCoins, text);

  const handleSelectCoin = (coin: Ticker) => {
    setSelectedCoin({
      ticker: coin.symbol,
      lastPrice: Number(coin.lastPrice),
      priceChangePercent: Number(coin.priceChangePercent),
    });
  };

  const handleAddCoin = () => {
    if (!selectedCoin) return;

    const asset = {
      name: selectedCoin.ticker,
      count: amount,
      price: selectedCoin.lastPrice,
      totalPrice: amount * selectedCoin.lastPrice,
      priceChange: selectedCoin.priceChangePercent,
      walletPercent: 0,
    };

    dispatch(addAsset(asset));

    const assetsArr = JSON.parse(localStorage.getItem('assets') ?? '[]');
    localStorage.setItem('assets', JSON.stringify([...assetsArr, asset]));

    setOpenModal(false);
  };

  return (
    <div className={s.overlayStyles} onClick={() => setOpenModal(false)}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <input className={s.input} type="text" placeholder="Поиск монеты" value={text} onChange={(e) => setText(e.target.value)} />

        {loading ? (
          <Loader />
        ) : (
          <div className={s.listCoins}>
            {filteredCoins?.length ? (
              filteredCoins.map((coin, i) => (
                <div key={i} className={s.coinItem} onClick={() => handleSelectCoin(coin)}>
                  <span>{coin.symbol}</span>
                  <span>${formatNumber(+coin.lastPrice)}</span>
                  <span className={parseFloat(coin.priceChangePercent) >= 0 ? s.priceUp : s.priceDown}>
                    {formatNumber(+coin.priceChangePercent)}%
                  </span>
                </div>
              ))
            ) : (
              <p className={s.noResults}>Монета не найдена</p>
            )}
          </div>
        )}

        {selectedCoin && (
          <>
            <div className={s.selectedCoin}>
              <span>{selectedCoin.ticker}</span>
              <span>${amount > 0 ? (selectedCoin.lastPrice * amount).toFixed(5) : selectedCoin.lastPrice}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCoin();
              }}
            >
              <div className={s.amountCoin}>
                <input
                  className={s.input}
                  type="number"
                  placeholder="Количество"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button type="button" onClick={() => setAmount(10)}>
                  10
                </button>
                <button type="button" onClick={() => setAmount(100)}>
                  100
                </button>
                <button type="button" onClick={() => setAmount(500)}>
                  500
                </button>
              </div>
              <div className={s.btnBlock}>
                <button className={s.btn}>Добавить</button>
                <button className={s.btn} type="button" onClick={() => setOpenModal(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
