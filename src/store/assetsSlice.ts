import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { recalculateWallet } from '../utils/utils';
import { Asset, Assets, delAsset, updAsset } from '../interfaces/interfaces';

const initialState: Assets = {
  assets: [],
  tickers: [],
  totalAssetsValue: 0,
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      const assetPayload = action.payload;

      // проверка на существование монеты
      const existingAsset = state.assets.find((asset) => asset.name === assetPayload.name);
      if (existingAsset) {
        existingAsset.count += assetPayload.count;
        existingAsset.totalPrice += assetPayload.totalPrice;
      } else {
        state.assets.push(assetPayload);
        state.tickers.push(assetPayload.name);
      }
      recalculateWallet(state);
    },

    updateAsset: (state, action: PayloadAction<updAsset>) => {
      const { coinName, price, priceChange } = action.payload;

      const asset = state.assets.find((item) => item.name === coinName);
      if (asset) {
        asset.price = price;
        asset.totalPrice = price * asset.count;
        asset.priceChange = priceChange;
      }
      recalculateWallet(state);
    },

    deleteAsset: (state, action: PayloadAction<delAsset>) => {
      const assetPayloadName = action.payload.coinName;

      state.assets = state.assets.filter((asset) => asset.name !== assetPayloadName);
      state.tickers = state.tickers.filter((ticker) => ticker !== assetPayloadName);
      recalculateWallet(state);
    },

    setAssetsFromStorage: (state, action: PayloadAction<Asset[]>) => {
      const arrAssetsPayload = action.payload;

      state.assets = arrAssetsPayload;
      state.tickers = arrAssetsPayload.map((asset) => asset.name);
      recalculateWallet(state);
    },
  },
});

export const { addAsset, deleteAsset, setAssetsFromStorage, updateAsset } = assetsSlice.actions;

export default assetsSlice.reducer;
