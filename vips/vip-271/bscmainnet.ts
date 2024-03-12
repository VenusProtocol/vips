import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

type Token = {
  symbol: string;
  address: string;
  amount: string;
};

export const ERC20_TOKENS: Token[] = [
  {
    symbol: "VBNB",
    address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    amount: parseUnits("101674.60269267", 8).toString(),
  },
  {
    symbol: "USDT",
    address: "0x55d398326f99059ff775485246999027b3197955",
    amount: parseUnits("682.670937428452997471", 18).toString(),
  },
  {
    symbol: "BTCB",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    amount: parseUnits("0.003788200825741047", 18).toString(),
  },
  {
    symbol: "USDC",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    amount: parseUnits("153.734823368539881682", 18).toString(),
  },
  {
    symbol: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    amount: parseUnits("0.028593370594306869", 18).toString(),
  },
  {
    symbol: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    amount: parseUnits("6.243408803767688955", 18).toString(),
  },
  {
    symbol: "DOT",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    amount: parseUnits("1.3782203986471427", 18).toString(),
  },
  {
    symbol: "ADA",
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    amount: parseUnits("19.442955289847041083", 18).toString(),
  },
  {
    symbol: "DAI",
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    amount: parseUnits("8.646943362773478519", 18).toString(),
  },
  {
    symbol: "FIL",
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    amount: parseUnits("0.640374289898314985", 18).toString(),
  },
  {
    symbol: "BETH",
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    amount: parseUnits("0.000999999999828933", 18).toString(),
  },
  {
    symbol: "LTC",
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    amount: parseUnits("0.022150049934158296", 18).toString(),
  },
  {
    symbol: "XRP",
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    amount: parseUnits("2.914230156293050047", 18).toString(),
  },
  {
    symbol: "LINK",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    amount: parseUnits("0.061129510689970706", 18).toString(),
  },
  {
    symbol: "MATIC",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    amount: parseUnits("0.519642261679984454", 18).toString(),
  },
  {
    symbol: "TRX",
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    amount: parseUnits("4.373524", 6).toString(),
  },
  {
    symbol: "SXP",
    address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    amount: parseUnits("1", 18).toString(),
  },
  {
    symbol: "DOGE",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    amount: parseUnits("2.65529355", 8).toString(),
  },
  {
    symbol: "BCH",
    address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    amount: parseUnits("0.000408728703365916", 18).toString(),
  },
  {
    symbol: "AAVE",
    address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    amount: parseUnits("0.000822116396879251", 18).toString(),
  },
  {
    symbol: "XVS",
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    amount: parseUnits("0.000000001232038486", 18).toString(),
  },
  {
    symbol: "TRXOLD",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    amount: parseUnits("1", 18).toString(),
  }
]


export const vip271 = () => {
  const meta = {
    version: "v2",
    title: "VIP-271 Treasury Management",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...ERC20_TOKENS.map(token => ({
        target: token.address,
        signature: "transfer(address,uint256)",
        params: [TREASURY, token.amount],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip271;
