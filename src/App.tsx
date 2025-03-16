import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';

const App = () => {
  const assets = useAppSelector((state) => state.assets.assets);
  const dispatch = useAppDispatch();

  return (
    <>
      <div>
        <h1>Portfolio Overview</h1>
        <button>Добавить</button>
      </div>
      <div className="tableMoney">
        <table>
          <tbody>
            <tr>
              <th>Актив</th>
              <th>Колич</th>
              <th>Цена</th>
              <th>Общ стоим</th>
              <th>Изм. за 24 ч.</th>
              <th>% портфеля</th>
            </tr>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.count}</td>
                <td>${asset.price}</td>
                <td>${asset.totalPrice}</td>
                <td>{asset.priceChange}%</td>
                <td>{asset.walletPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default App;
