import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip183 } from "../../vips/vip-183";
import IERC20 from "./abi/IERC20UpgradableAbi.json";

const BUYBACK_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDT_TREASURY_SHARE = parseUnits("166002.633177563169056472", 18);
const USDT_BUYBACK_SHARE = parseUnits("18444.737019729241006274", 18);
const LIQUIDATIONS_USDT_BUYBACK = parseUnits("22793.63", 18);

const USDT_BUYBACK_WALLET_DELTA = USDT_BUYBACK_SHARE.add(LIQUIDATIONS_USDT_BUYBACK);
const USDT_TREASURY_DELTA = USDT_TREASURY_SHARE.sub(LIQUIDATIONS_USDT_BUYBACK);

const EXPECTED_BUYBACK_WALLET_DELTAS = [
  { symbol: "BNB", token: "0x0", expectedDelta: parseEther("601.182823510592987636") },
  {
    symbol: "USDC",
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    expectedDelta: parseUnits("9849.892678925547383615", 18),
  },
  { symbol: "USDT", token: "0x55d398326f99059fF775485246999027B3197955", expectedDelta: USDT_BUYBACK_WALLET_DELTA },
  {
    symbol: "BUSD",
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    expectedDelta: parseUnits("0", 18),
  },
  {
    symbol: "SXP",
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    expectedDelta: parseUnits("893.459209473801674349", 18),
  },
  {
    symbol: "BTCB",
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    expectedDelta: parseUnits("0.156117301714591397", 18),
  },
  {
    symbol: "ETH",
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    expectedDelta: parseUnits("4.0252435119110084050", 18),
  },
  {
    symbol: "LTC",
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    expectedDelta: parseUnits("0.718882603181826473", 18),
  },
  {
    symbol: "XRP",
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    expectedDelta: parseUnits("95.402950261235556118", 18),
  },
  {
    symbol: "BCH",
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    expectedDelta: parseUnits("1.3399846260516787700", 18),
  },
  {
    symbol: "DOT",
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    expectedDelta: parseUnits("120.313518932470783189", 18),
  },
  {
    symbol: "LINK",
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    expectedDelta: parseUnits("5.053638935414816654", 18),
  },
  {
    symbol: "DAI",
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    expectedDelta: parseUnits("584.635968797372328176", 18),
  },
  {
    symbol: "FIL",
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    expectedDelta: parseUnits("9.983630213346555867", 18),
  },
  {
    symbol: "BETH",
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    expectedDelta: parseUnits("0.000367437792277355", 18),
  },
  {
    symbol: "ADA",
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    expectedDelta: parseUnits("813.848060964751798590", 18),
  },
  {
    symbol: "DOGE",
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    expectedDelta: parseUnits("325.21377918", 8),
  },
  {
    symbol: "MATIC",
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    expectedDelta: parseUnits("110.139757401443688148", 18),
  },
  {
    symbol: "Cake",
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    expectedDelta: parseUnits("561.881225811358897070", 18),
  },
  {
    symbol: "AAVE",
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    expectedDelta: parseUnits("0.311130908263443924", 18),
  },
  {
    symbol: "TRXOLD",
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    expectedDelta: parseUnits("1486.623013103118100397", 18),
  },
  {
    symbol: "TRX",
    token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    expectedDelta: parseUnits("1271.900699", 6),
  },
  {
    symbol: "wBETH",
    token: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    expectedDelta: parseUnits("0.040631499467635465", 18),
  },
  {
    symbol: "TUSD",
    token: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    expectedDelta: parseUnits("218.043441287091666248", 18),
  },
];

const EXPECTED_TREASURY_DELTAS = [
  { symbol: "BNB", token: "0x0", expectedDelta: parseEther("5410.645411595336888731") },
  {
    symbol: "USDC",
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    expectedDelta: parseUnits("88649.034110329926452542", 18),
  },
  { symbol: "USDT", token: "0x55d398326f99059fF775485246999027B3197955", expectedDelta: USDT_TREASURY_DELTA },
  {
    symbol: "BUSD",
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    expectedDelta: parseUnits("0", 18),
  },
  {
    symbol: "SXP",
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    expectedDelta: parseUnits("8041.132885264215069142", 18),
  },
  {
    symbol: "BTCB",
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    expectedDelta: parseUnits("1.405055715431322576", 18),
  },
  {
    symbol: "ETH",
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    expectedDelta: parseUnits("36.227191607199075645", 18),
  },
  {
    symbol: "LTC",
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    expectedDelta: parseUnits("6.469943428636438264", 18),
  },
  {
    symbol: "XRP",
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    expectedDelta: parseUnits("858.626552351120005070", 18),
  },
  {
    symbol: "BCH",
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    expectedDelta: parseUnits("12.059861634465108930", 18),
  },
  {
    symbol: "DOT",
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    expectedDelta: parseUnits("1082.821670392237048709", 18),
  },
  {
    symbol: "LINK",
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    expectedDelta: parseUnits("45.482750418733349894", 18),
  },
  {
    symbol: "DAI",
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    expectedDelta: parseUnits("5261.723719176350953593", 18),
  },
  {
    symbol: "FIL",
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    expectedDelta: parseUnits("89.852671920119002804", 18),
  },
  {
    symbol: "BETH",
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    expectedDelta: parseUnits("0.003306940130496201", 18),
  },
  {
    symbol: "ADA",
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    expectedDelta: parseUnits("7324.632548682766187312", 18),
  },
  {
    symbol: "DOGE",
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    expectedDelta: parseUnits("2926.92401269", 8),
  },
  {
    symbol: "MATIC",
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    expectedDelta: parseUnits("991.257816612993193333", 18),
  },
  {
    symbol: "Cake",
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    expectedDelta: parseUnits("5056.931032302230073636", 18),
  },
  {
    symbol: "AAVE",
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    expectedDelta: parseUnits("2.800178174370995318", 18),
  },
  {
    symbol: "TRXOLD",
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    expectedDelta: parseUnits("13379.607117928062903581", 18),
  },
  {
    symbol: "TRX",
    token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    expectedDelta: parseUnits("11447.106298", 6),
  },
  {
    symbol: "wBETH",
    token: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    expectedDelta: parseUnits("0.365683495208719188", 18),
  },
  {
    symbol: "TUSD",
    token: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    expectedDelta: parseUnits("1962.390971583824996239", 18),
  },
];

const balanceOf = async (token: string, address: string) => {
  if (token === "0x0") {
    return await ethers.provider.getBalance(address);
  }
  const tokenContract = await ethers.getContractAt(IERC20, token);
  return await tokenContract.balanceOf(address);
};

forking(32364940, async () => {
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

  testVip("VIP-182", await vip183(), {
    proposer: "0x97a32d4506f6a35de68e0680859cdf41d077a9a9",
  });

  describe("Post-VIP balances", async () => {
    EXPECTED_TREASURY_DELTAS.forEach(({ symbol, token, expectedDelta }) => {
      it(`should have the correct balance for ${symbol} in treasury`, async () => {
        const balance = await balanceOf(token, TREASURY);
        const expectedBalance = expectedDelta.add(originalTreasuryBalances[token]);
        expect(balance).to.equal(expectedBalance);
      });
    });

    EXPECTED_BUYBACK_WALLET_DELTAS.forEach(({ symbol, token, expectedDelta }) => {
      it(`should have the correct balance for ${symbol} in buyback wallet`, async () => {
        const balance = await balanceOf(token, BUYBACK_WALLET);
        const expectedBalance = expectedDelta.add(originalBuybackWalletBalances[token]);
        expect(balance).to.equal(expectedBalance);
      });
    });
  });
});
