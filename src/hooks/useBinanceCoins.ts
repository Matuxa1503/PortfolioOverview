import { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticker } from '../interfaces/interfaces';

export const useBinanceCoins = () => {
  const [coinsBinance, setCoins] = useState<Ticker[]>([]);

  useEffect(() => {
    const getBinanceData = async () => {
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        setCoins(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getBinanceData();
  }, []);

  return { coinsBinance };
};
