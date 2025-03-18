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
}

interface deleteAsset {
  coinName: string;
  totalPrice: number;
}

const initialState: Assets = {
  assets: [],
  allTotalPrice: 0,
};

const mathFunc = (totalPrice: number, allTotalPrice: number): number => {
  return (totalPrice / allTotalPrice) * 100;
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.allTotalPrice += action.payload.totalPrice;
      const exitingAsset = state.assets.find((asset) => asset.name === action.payload.name);
      if (exitingAsset) {
        exitingAsset.count += action.payload.count;
        exitingAsset.totalPrice += action.payload.totalPrice;
      } else {
        state.assets.push(action.payload);
      }

      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },
    deleteAsset: (state, action: PayloadAction<deleteAsset>) => {
      state.assets = state.assets.filter((asset) => asset.name !== action.payload.coinName);
      state.allTotalPrice = Math.max(0, state.allTotalPrice - action.payload.totalPrice);

      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },
    setAssetsFromStorage: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;

      action.payload.forEach((item) => {
        state.allTotalPrice += item.totalPrice;
      });

      state.assets.forEach((asset) => {
        asset.walletPercent = mathFunc(asset.totalPrice, state.allTotalPrice);
      });
    },
  },
});

export const { addAsset, deleteAsset, setAssetsFromStorage } = assetsSlice.actions;

export default assetsSlice.reducer;
