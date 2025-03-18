import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Asset {
  name: string;
  count: number;
  price: number;
  totalPrice: number;
  priceChange: number;
  walletPercent: number;
}

interface Assets {
  assets: Asset[];
  allTotalPrice: number;
  tickers: string[];
}

interface deleteAsset {
  coinName: string;
  totalPrice: number;
}

interface updateAsset {
  coinName: string;
  price: number;
  priceChange: number;
}

const initialState: Assets = {
  assets: [],
  allTotalPrice: 0,
  tickers: [],
};

const mathFunc = (totalPrice: number, allTotalPrice: number): number => {
  return allTotalPrice > 0 ? (totalPrice / allTotalPrice) * 100 : 0;
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      // общая сумма
      state.allTotalPrice += action.payload.totalPrice;

      // проверка на существование монеты
      const existingAsset = state.assets.find((asset) => asset.name === action.payload.name);
      if (existingAsset) {
        existingAsset.count += action.payload.count;
        existingAsset.totalPrice += action.payload.totalPrice;
      } else {
        // если ее нет, добавляем в массив монет и тикеров
        state.assets.push(action.payload);
        state.tickers.push(action.payload.name);
      }

      // обновляем проценты
      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },

    deleteAsset: (state, action: PayloadAction<deleteAsset>) => {
      // удаление монеты по названию
      state.assets = state.assets.filter((asset) => asset.name !== action.payload.coinName);
      state.tickers = state.tickers.filter((ticker) => ticker !== action.payload.coinName);

      // пересчитываем сумму портфеля
      state.allTotalPrice = state.assets.reduce((acc, asset) => acc + asset.totalPrice, 0);

      // обновляем проценты
      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },

    setAssetsFromStorage: (state, action: PayloadAction<Asset[]>) => {
      // загружаем массив
      state.assets = action.payload;

      // сбрасываем и пересчитываем сумму портфеля
      state.allTotalPrice = state.assets.reduce((acc, asset) => acc + asset.totalPrice, 0);

      // обновляем проценты
      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });

      // добавляем монеты в тикеры
      state.tickers = action.payload.map((asset) => asset.name.toLowerCase());
    },

    updateAssetPrice: (state, action: PayloadAction<updateAsset>) => {
      const { coinName, price, priceChange } = action.payload;

      // Находим актив
      const asset = state.assets.find((item) => item.name === coinName);

      if (asset) {
        asset.price = price;
        asset.totalPrice = price * asset.count;
        asset.priceChange = priceChange;
      }

      // пересчитываем `allTotalPrice`
      state.allTotalPrice = state.assets.reduce((acc, asset) => acc + asset.totalPrice, 0);

      // обновляем `walletPercent` для всех активов
      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },
  },
});

export const { addAsset, deleteAsset, setAssetsFromStorage, updateAssetPrice } = assetsSlice.actions;

export default assetsSlice.reducer;
