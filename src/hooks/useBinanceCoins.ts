import { useEffect, useState } from 'react';
import { Ticker } from '../interfaces/Ticker';
import axios from 'axios';

export const useBinanceCoins = () => {
  const [coins, setCoins] = useState<Ticker[]>([]);

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

  return { coins };
};
