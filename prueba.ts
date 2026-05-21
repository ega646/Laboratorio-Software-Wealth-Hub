import axios from "axios";

async function getPrice() {
  const response = await axios.get(
    "https://api.binance.com/api/v3/ticker/price",
    {
      params: {
        symbol: "BTCUSDT",
      },
    }
  );

  console.log(response.data);

    const price = response.data.price;

    console.log(price);
}

getPrice();