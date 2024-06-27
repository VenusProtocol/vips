import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip105 } from "../../vips/vip-105";
import IERC20 from "./abi/IERC20UpgradableAbi.json";

const BUYBACK_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDT_TREASURY_SHARE = parseUnits("179373.121886402045687609", 18);
const USDT_BUYBACK_SHARE = parseUnits("44843.280471600511421902", 18);
const ADDITIONAL_USDT_FOR_BUYBACK = parseUnits("132067.26", 18);

const USDT_BUYBACK_WALLET_DELTA = USDT_BUYBACK_SHARE.add(ADDITIONAL_USDT_FOR_BUYBACK);
const USDT_TREASURY_DELTA = USDT_TREASURY_SHARE.sub(ADDITIONAL_USDT_FOR_BUYBACK);

const EXPECTED_TREASURY_DELTAS = [
  {
    token: "0x0",
    symbol: "BNB",
    expectedDelta: parseEther("2292.032311952035123947"),
  },
  {
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "USDC",
    expectedDelta: parseUnits("67469.419543482631306321", 18),
  },
  {
    token: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    expectedDelta: USDT_TREASURY_DELTA,
  },
  {
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    symbol: "BUSD",
    expectedDelta: parseUnits("119813.034324726793121187", 18),
  },
  {
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    symbol: "SXP",
    expectedDelta: parseUnits("3380.936039657834711804", 18),
  },
  {
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    symbol: "BTCB",
    expectedDelta: parseUnits("1.711615026034785760", 18),
  },
  {
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    symbol: "ETH",
    expectedDelta: parseUnits("29.043244102694999380", 18),
  },
  {
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    symbol: "LTC",
    expectedDelta: parseUnits("7.826733038049293832", 18),
  },
  {
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    symbol: "XRP",
    expectedDelta: parseUnits("1932.166018701156404028", 18),
  },
  {
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    symbol: "BCH",
    expectedDelta: parseUnits("12.897664562200487376", 18),
  },
  {
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    symbol: "DOT",
    expectedDelta: parseUnits("1360.442805151694917012", 18),
  },
  {
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    symbol: "LINK",
    expectedDelta: parseUnits("120.086357465747490448", 18),
  },
  {
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    symbol: "DAI",
    expectedDelta: parseUnits("4770.504905242229830694", 18),
  },
  {
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    symbol: "FIL",
    expectedDelta: parseUnits("261.583439344998877618", 18),
  },
  {
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    symbol: "BETH",
    expectedDelta: parseUnits("3.173347016335289046", 18),
  },
  {
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    symbol: "ADA",
    expectedDelta: parseUnits("8746.872444694451042298", 18),
  },
  {
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    symbol: "DOGE",
    expectedDelta: parseUnits("17639.96586295", 8),
  },
  {
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    symbol: "MATIC",
    expectedDelta: parseUnits("1723.184335632383039557", 18),
  },
  {
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    symbol: "Cake",
    expectedDelta: parseUnits("26763.811223445281883228", 18),
  },
  {
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    symbol: "AAVE",
    expectedDelta: parseUnits("13.317449332930738899", 18),
  },
  {
    token: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    symbol: "TUSD",
    expectedDelta: parseUnits("6590.571542408404958321", 18),
  },
  {
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    symbol: "TRXOLD",
    expectedDelta: parseUnits("31035.930196082105218960", 18),
  },
  {
    token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    symbol: "TRX",
    expectedDelta: parseUnits("1458.620031", 6),
  },
];

const EXPECTED_BUYBACK_WALLET_DELTAS = [
  {
    token: "0x0",
    symbol: "BNB",
    expectedDelta: parseEther("573.008077988008780986"),
  },
  {
    token: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "USDC",
    expectedDelta: parseUnits("16867.354885870657826580", 18),
  },
  {
    token: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    expectedDelta: USDT_BUYBACK_WALLET_DELTA,
  },
  {
    token: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    symbol: "BUSD",
    expectedDelta: parseUnits("29953.258581181698280296", 18),
  },
  {
    token: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    symbol: "SXP",
    expectedDelta: parseUnits("845.234009914458677951", 18),
  },
  {
    token: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    symbol: "BTCB",
    expectedDelta: parseUnits(".427903756508696439", 18),
  },
  {
    token: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    symbol: "ETH",
    expectedDelta: parseUnits("7.260811025673749845", 18),
  },
  {
    token: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    symbol: "LTC",
    expectedDelta: parseUnits("1.956683259512323457", 18),
  },
  {
    token: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    symbol: "XRP",
    expectedDelta: parseUnits("483.041504675289101006", 18),
  },
  {
    token: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    symbol: "BCH",
    expectedDelta: parseUnits("3.224416140550121843", 18),
  },
  {
    token: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    symbol: "DOT",
    expectedDelta: parseUnits("340.110701287923729253", 18),
  },
  {
    token: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    symbol: "LINK",
    expectedDelta: parseUnits("30.021589366436872612", 18),
  },
  {
    token: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    symbol: "DAI",
    expectedDelta: parseUnits("1192.626226310557457673", 18),
  },
  {
    token: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    symbol: "FIL",
    expectedDelta: parseUnits("65.395859836249719404", 18),
  },
  {
    token: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    symbol: "BETH",
    expectedDelta: parseUnits(".793336754083822261", 18),
  },
  {
    token: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    symbol: "ADA",
    expectedDelta: parseUnits("2186.718111173612760574", 18),
  },
  {
    token: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    symbol: "DOGE",
    expectedDelta: parseUnits("4409.99146573", 8),
  },
  {
    token: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    symbol: "MATIC",
    expectedDelta: parseUnits("430.796083908095759889", 18),
  },
  {
    token: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    symbol: "Cake",
    expectedDelta: parseUnits("6690.952805861320470807", 18),
  },
  {
    token: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    symbol: "AAVE",
    expectedDelta: parseUnits("3.329362333232684724", 18),
  },
  {
    token: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    symbol: "TUSD",
    expectedDelta: parseUnits("1647.642885602101239580", 18),
  },
  {
    token: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    symbol: "TRXOLD",
    expectedDelta: parseUnits("7758.982549020526304739", 18),
  },
  {
    token: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    symbol: "TRX",
    expectedDelta: parseUnits("364.655007", 6),
  },
];

const balanceOf = async (token: string, address: string) => {
  if (token === "0x0") {
    return await ethers.provider.getBalance(address);
  }
  const tokenContract = await ethers.getContractAt(IERC20, token);
  return await tokenContract.balanceOf(address);
};

forking(27082000, async () => {
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

  testVip("VIP-105", await vip105());

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
