import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Asset {
  id: number;
  name: string;
  count: number;
  price: number;
  totalPrice: number;
  priceChange: number;
  walletPercent: number;
}

interface Assets {
  assets: Asset[];
}

const initialState: Assets = {
  assets: [{ id: 1, name: 'BTC', count: 1, price: 82000, totalPrice: 82000, priceChange: -2, walletPercent: 100 }],
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload);
    },
  },
});

export const { addAsset } = assetsSlice.actions;

export default assetsSlice.reducer;
