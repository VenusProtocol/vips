import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
const TUSD_OLD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
const DOT = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402";
const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
const TRX_OLD = "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B";
const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
const FLOKI = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E";
const MATIC = "0xCC42724C6683B7E57334c4E856f4c9965ED682bD";
const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
const AAVE = "0xfb6115445Bff7b52FeB98650C87f44907E58f802";
const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const BTT = "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B";

export const vip228 = () => {
  const meta = {
    version: "v2",
    title: "VIP-228 Transfer Funds to Binance Wallet",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, parseUnits("69.89", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [CAKE, parseUnits("54198.52", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ADA, parseUnits("107165.54", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TUSD_OLD, parseUnits("39233.57", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [DOT, parseUnits("4845.75", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [XRP, parseUnits("61727.99", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BETH, parseUnits("14.98882392", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [FIL, parseUnits("3426.22", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [LINK, parseUnits("1474.51885596", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [LTC, parseUnits("306.882774686205524558", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BCH, parseUnits("53.84898038", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TRX_OLD, parseUnits("72175.747054974582785017", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [DOGE, parseUnits("98579.90244918", 8), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [FLOKI, parseUnits("177082682.555785183", 9), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [MATIC, parseUnits("6242.52", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TRX, parseUnits("40954.233946", 6), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [SXP, parseUnits("32622.12", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [AAVE, parseUnits("28.45", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TUSD, parseUnits("2201.65", 18), BINANCE_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTT, parseUnits("1392507212.37901", 6), BINANCE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
