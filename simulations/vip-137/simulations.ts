import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip137 } from "../../vips/vip-137";
import IERC20 from "./abi/IERC20UpgradableAbi.json";

const BUYBACK_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDT_TREASURY_SHARE = parseUnits("210428.709986739362054424", 18);
const USDT_BUYBACK_SHARE = parseUnits("23380.967776304373561602", 18);
const ADDITIONAL_USDT_FOR_BUYBACK = parseUnits("33100.15", 18);

const USDT_BUYBACK_WALLET_DELTA = USDT_BUYBACK_SHARE.add(ADDITIONAL_USDT_FOR_BUYBACK);
const USDT_TREASURY_DELTA = USDT_TREASURY_SHARE.sub(ADDITIONAL_USDT_FOR_BUYBACK);

const EXPECTED_BUYBACK_WALLET_DELTAS = [
  { symbol: "BNB", token: "0x0", expectedDelta: parseEther("508.499489962935744958") },
  {
    symbol: "USDC",
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    expectedDelta: parseUnits("9096.140934673191642482", 18),
  },
  { symbol: "USDT", token: "0x55d398326f99059fF775485246999027B3197955", expectedDelta: USDT_BUYBACK_WALLET_DELTA },
  {
    symbol: "BUSD",
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    expectedDelta: parseUnits("6446.341711055091311294", 18),
  },
  {
    symbol: "SXP",
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    expectedDelta: parseUnits("49.463941918022665934", 18),
  },
  {
    symbol: "BTCB",
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    expectedDelta: parseUnits("0.205691183895055672", 18),
  },
  {
    symbol: "ETH",
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    expectedDelta: parseUnits("4.169190178148361079", 18),
  },
  {
    symbol: "LTC",
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    expectedDelta: parseUnits("1.007389862997151990", 18),
  },
  {
    symbol: "XRP",
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    expectedDelta: parseUnits("413.839560411016881694", 18),
  },
  {
    symbol: "BCH",
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    expectedDelta: parseUnits("1.206593525484940983", 18),
  },
  {
    symbol: "DOT",
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    expectedDelta: parseUnits("76.062073534456398410", 18),
  },
  {
    symbol: "LINK",
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    expectedDelta: parseUnits("10.949701191649904460", 18),
  },
  {
    symbol: "DAI",
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    expectedDelta: parseUnits("581.117130095013706731", 18),
  },
  {
    symbol: "FIL",
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    expectedDelta: parseUnits("15.893770078639351214", 18),
  },
  {
    symbol: "BETH",
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    expectedDelta: parseUnits("0.207629697583789775", 18),
  },
  {
    symbol: "ADA",
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    expectedDelta: parseUnits("1262.054636346228131414", 18),
  },
  {
    symbol: "DOGE",
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    expectedDelta: parseUnits("1039.76144104", 8),
  },
  {
    symbol: "MATIC",
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    expectedDelta: parseUnits("93.357038015671539649", 18),
  },
  {
    symbol: "Cake",
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    expectedDelta: parseUnits("1471.506427120316644381", 18),
  },
  {
    symbol: "AAVE",
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    expectedDelta: parseUnits("0.467884622976290436", 18),
  },
  {
    symbol: "TUSD",
    token: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    expectedDelta: parseUnits("3627.000216994993967679", 18),
  },
  {
    symbol: "TRXOLD",
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    expectedDelta: parseUnits("2406.247404258401663559", 18),
  },
  { symbol: "TRX", token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", expectedDelta: parseUnits("2512.5144850", 6) },
  {
    symbol: "wBETH",
    token: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    expectedDelta: parseUnits("0.005091663299523408", 18),
  },
  {
    symbol: "TUSD",
    token: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    expectedDelta: parseUnits("26.634753925876755065", 18),
  },
];

const EXPECTED_TREASURY_DELTAS = [
  { symbol: "BNB", token: "0x0", expectedDelta: parseEther("4576.495409666421704631") },
  {
    symbol: "USDC",
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    expectedDelta: parseUnits("81865.268412058724782343", 18),
  },
  { symbol: "USDT", token: "0x55d398326f99059fF775485246999027B3197955", expectedDelta: USDT_TREASURY_DELTA },
  {
    symbol: "BUSD",
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    expectedDelta: parseUnits("58017.075399495821801647", 18),
  },
  {
    symbol: "SXP",
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    expectedDelta: parseUnits("445.175477262203993407", 18),
  },
  {
    symbol: "BTCB",
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    expectedDelta: parseUnits("1.851220655055501050", 18),
  },
  {
    symbol: "ETH",
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    expectedDelta: parseUnits("37.522711603335249718", 18),
  },
  {
    symbol: "LTC",
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    expectedDelta: parseUnits("9.066508766974367914", 18),
  },
  {
    symbol: "XRP",
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    expectedDelta: parseUnits("3724.556043699151935254", 18),
  },
  {
    symbol: "BCH",
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    expectedDelta: parseUnits("10.859341729364468856", 18),
  },
  {
    symbol: "DOT",
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    expectedDelta: parseUnits("684.558661810107585690", 18),
  },
  {
    symbol: "LINK",
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    expectedDelta: parseUnits("98.547310724849140149", 18),
  },
  {
    symbol: "DAI",
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    expectedDelta: parseUnits("5230.054170855123360582", 18),
  },
  {
    symbol: "FIL",
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    expectedDelta: parseUnits("143.043930707754160926", 18),
  },
  {
    symbol: "BETH",
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    expectedDelta: parseUnits("1.868667278254107984", 18),
  },
  {
    symbol: "ADA",
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    expectedDelta: parseUnits("11358.491727116053182731", 18),
  },
  {
    symbol: "DOGE",
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    expectedDelta: parseUnits("9357.85296945", 8),
  },
  {
    symbol: "MATIC",
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    expectedDelta: parseUnits("840.213342141043856842", 18),
  },
  {
    symbol: "Cake",
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    expectedDelta: parseUnits("13243.557844082849799437", 18),
  },
  {
    symbol: "AAVE",
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    expectedDelta: parseUnits("4.210961606786613931", 18),
  },
  {
    symbol: "TUSD",
    token: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    expectedDelta: parseUnits("32643.001952954945709112", 18),
  },
  {
    symbol: "TRXOLD",
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    expectedDelta: parseUnits("21656.226638325614972040", 18),
  },
  { symbol: "TRX", token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", expectedDelta: parseUnits("22612.630365", 6) },
  {
    symbol: "wBETH",
    token: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    expectedDelta: parseUnits("0.045824969695710677", 18),
  },
  {
    symbol: "TUSD",
    token: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    expectedDelta: parseUnits("239.712785332890795588", 18),
  },
];

const balanceOf = async (token: string, address: string) => {
  if (token === "0x0") {
    return await ethers.provider.getBalance(address);
  }
  const tokenContract = await ethers.getContractAt(IERC20, token);
  return await tokenContract.balanceOf(address);
};

forking(29567407, () => {
  const originalTreasuryBalances: { [address: string]: BigNumber } = {};
  const originalBuybackWalletBalances: { [address: string]: BigNumber } = {};

  before(async () => {
    EXPECTED_TREASURY_DELTAS.forEach(async ({ token }) => {
      originalTreasuryBalances[token] = await balanceOf(token, TREASURY);
    });
    EXPECTED_BUYBACK_WALLET_DELTAS.forEach(async ({ token }) => {
      originalBuybackWalletBalances[token] = await balanceOf(token, BUYBACK_WALLET);
    });
  });

  testVip("VIP-137", vip137());

  describe("Post-VIP balances", async () => {
    EXPECTED_TREASURY_DELTAS.forEach(({ symbol, token, expectedDelta }) => {
      it(`should have the correct balance for ${symbol} in treasury`, async () => {
        const balance = await balanceOf(token, TREASURY);
        let expectedBalance = expectedDelta;
        expectedBalance = expectedDelta.add(originalTreasuryBalances[token]);
        expect(balance).to.equal(expectedBalance);
      });
    });

    EXPECTED_BUYBACK_WALLET_DELTAS.forEach(({ symbol, token, expectedDelta }) => {
      it(`should have the correct balance for ${symbol} in buyback wallet`, async () => {
        const balance = await balanceOf(token, BUYBACK_WALLET);
        let expectedBalance = expectedDelta;
        expectedBalance = expectedDelta.add(originalBuybackWalletBalances[token]);
        expect(balance).to.equal(expectedBalance);
      });
    });
  });
});
