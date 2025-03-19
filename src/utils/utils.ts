import { Assets } from '../interfaces/interfaces';

const calcWalletPercent = (totalPrice: number, totalAssetsValue: number): number => {
  return totalAssetsValue > 0 ? (totalPrice / totalAssetsValue) * 100 : 0;
};

export const recalculateWallet = (state: Assets) => {
  // пересчитываем общую сумму портфеля
  state.totalAssetsValue = state.assets.reduce((acc, asset) => acc + asset.totalPrice, 0);

  // процент кошелька
  state.assets.forEach((asset) => {
    asset.walletPercent = calcWalletPercent(asset.totalPrice, state.totalAssetsValue);
  });
};
