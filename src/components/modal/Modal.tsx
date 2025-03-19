import { FC, useState } from 'react';
import { addAsset } from '../../store/assetsSlice';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { ModalProps, SelectedCoin, Ticker } from '../../interfaces/interfaces';
import { useBinanceCoins } from '../../hooks/useBinanceCoins';
import { popularCoins } from '../../constants/popularCoins';
import { filterCoins } from '../../utils/utils';
import s from './Modal.module.scss';

export const Modal: FC<ModalProps> = ({ setOpenModal }) => {
  const [text, setText] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>(null);
  const [amount, setAmount] = useState(0);
  const { coinsBinance } = useBinanceCoins();
  const dispatch = useAppDispatch();

  const topCoins = popularCoins
    .map((popularCoin) => coinsBinance.find((coin) => coin.symbol === popularCoin))
    .filter((coin): coin is Ticker => coin !== undefined);

  const filteredCoins = filterCoins(coinsBinance, topCoins, text);

  const handleSelectCoin = (coin: Ticker) => {
    setSelectedCoin({
      ticker: coin.symbol,
      lastPrice: Number(coin.lastPrice).toFixed(2),
      priceChangePercent: Number(coin.priceChangePercent),
    });
  };

  const handleAddCoin = () => {
    if (!selectedCoin) return;

    const asset = {
      name: selectedCoin.ticker,
      count: amount,
      price: +selectedCoin.lastPrice,
      totalPrice: amount * +selectedCoin.lastPrice,
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
        <input type="text" placeholder="Поиск монеты" value={text} onChange={(e) => setText(e.target.value)} />

        <div className={s.listCoins}>
          {filteredCoins?.length ? (
            filteredCoins.map((coin, i) => (
              <div key={i} className={s.coinItem} onClick={() => handleSelectCoin(coin)}>
                <span>{coin.symbol}</span>
                <span>${Number(coin.lastPrice).toFixed(2)}</span>
                <span>{Number(coin.priceChangePercent).toFixed(5)}%</span>
              </div>
            ))
          ) : (
            <p className={s.noResults}>Загрузка монет...</p>
          )}
        </div>

        {selectedCoin && (
          <>
            <div className={s.selectedCoin}>
              <span>{selectedCoin.ticker}</span>
              <span>${selectedCoin.lastPrice}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCoin();
              }}
            >
              <input
                type="number"
                placeholder="Количество"
                step="1"
                min="1"
                max="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <button>Добавить</button>
              <button type="button" onClick={() => setOpenModal(false)}>
                Отмена
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
