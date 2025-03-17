import { FC, useState } from 'react';
import s from './Modal.module.scss';
import { Ticker } from '../interfaces/Ticker';

interface ModalProps {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  coins: Ticker[];
}

interface SelectedCoin {
  symbol: string | undefined;
  lastPrice: string | undefined;
}

export const Modal: FC<ModalProps> = ({ setOpenModal, coins }) => {
  const [text, setText] = useState<string>('');

  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const popularCoins: string[] = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'XRPUSDT',
    'ADAUSDT',
    'DOGEUSDT',
    'LTCUSDT',
    'SOLUSDT',
    'DOTUSDT',
    'MATICUSDT',
    'SHIBUSDT',
    'TRXUSDT',
    'AVAXUSDT',
    'UNIUSDT',
    'LINKUSDT',
    'ATOMUSDT',
    'XLMUSDT',
    'FILUSDT',
    'NEARUSDT',
  ];

  // монеты по умолчанию
  const topCoinsFromBinance = popularCoins.map((popularCoin) => {
    return coins.find((coin) => coin.symbol === popularCoin);
  });

  // фильтрация монет
  const filteredCoins = text
    ? coins.filter((coin) => {
        return coin.symbol.toLowerCase().startsWith(text.toLowerCase());
      })
    : topCoinsFromBinance;

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpenModal(false);
      document.body.style.overflow = '';
    }
  };

  return (
    <div className={s.overlayStyles} onClick={handleOverlay}>
      <div className={s.modal}>
        <input type="text" placeholder="Поиск монеты" value={text} onChange={(e) => setText(e.target.value)} />
        <div className={s.listCoins}>
          {filteredCoins.map((coin, i) => (
            <div
              key={i}
              className={s.coinItem}
              onClick={() => setSelectedCoin({ symbol: coin?.symbol, lastPrice: Number(coin?.lastPrice).toFixed(2) })}
            >
              <span>{coin?.symbol}</span>
              <span>${Number(coin?.lastPrice).toFixed(2)}</span>
              <span>{Number(coin?.priceChangePercent).toFixed(5)}%</span>
            </div>
          ))}
        </div>
        {selectedCoin && (
          <div className={s.selectedCoin}>
            <span>{selectedCoin.symbol}</span>
            <span>${selectedCoin.lastPrice}</span>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
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
      </div>
    </div>
  );
};
