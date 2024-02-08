import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const TOKEN_REDEEMER = "0x29171F17BF7F3691908eD55bAC2014A632B87dD3";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const BINANCE = "0x6657911F7411765979Da0794840D671Be55bA273";

export const WBNB_AMOUNT = parseUnits("5901.651898613689829191", 18).toString();
export const vBNB_AMOUNT = parseUnits("672665.16913031", 8).toString();
export const BNB_AMOUNT_TO_BINANCE = BigNumber.from(parseUnits("15636.74", 18))
  .add(parseUnits("5865.60", 18))
  .toString();

// Received from vBNB after redeem is 15847.979107135037434728. But we will send to treasury only 15847.679107135037434728 i.e., 0.3 is kept in the timelock
export const BNB_AMOUNT_TO_TREASURY = parseUnits("15847.679107135037434728", 18).toString();

interface VTokenTransfer {
  symbol: string;
  amount: string;
  address: string;
}

interface BEP20Transfer {
  symbol: string;
  amount: string;
  address: string;
}

export const vToken_Transfers = [
  {
    symbol: "vBTC",
    amount: parseUnits("344.60553433", 8).toString(),
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  },
  {
    symbol: "vETH",
    amount: parseUnits("1685.06190157", 8).toString(),
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  },
  {
    symbol: "vUSDT",
    amount: parseUnits("2554859.57915445", 8).toString(),
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  },
  {
    symbol: "vLTC",
    amount: parseUnits("27660.07068667", 8).toString(),
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
  },
  {
    symbol: "vXVS",
    amount: parseUnits("138740.90847753", 8).toString(),
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  },
  {
    symbol: "vCAKE",
    amount: parseUnits("245187.19242229", 8).toString(),
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
  },
  {
    symbol: "vUNI",
    amount: parseUnits("2497.74135186", 8).toString(),
    address: "0x27FF564707786720C71A2e5c1490A63266683612",
  },
  {
    symbol: "vFDUSD",
    amount: parseUnits("10355.09068368", 8).toString(),
    address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
  },
  {
    symbol: "vUSDC",
    amount: parseUnits("1251038.96782643", 8).toString(),
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  },
  {
    symbol: "vDOT",
    amount: parseUnits("55089.83198008", 8).toString(),
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
  },
  {
    symbol: "vADA",
    amount: parseUnits("662029.93490011", 8).toString(),
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
  },
  {
    symbol: "vXRP",
    amount: parseUnits("534654.72490775", 8).toString(),
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
  },
  // {
  //     symbol: "vTUSDOLD",
  //     amount: parseUnits("234046.29380374", 8).toString(),
  //     address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3"
  // },
  {
    symbol: "vMATIC",
    amount: parseUnits("255028.0497963", 8).toString(),
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
  },
  {
    symbol: "vLINK",
    amount: parseUnits("13919.2457489", 8).toString(),
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
  },
  {
    symbol: "vBETH",
    amount: parseUnits("70.15886616", 8).toString(),
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
  },
  {
    symbol: "vDOGE",
    amount: parseUnits("1940822.36351268", 8).toString(),
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
  },
  {
    symbol: "vFIL",
    amount: parseUnits("25756.68067599", 8).toString(),
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
  },
  {
    symbol: "vTUSD",
    amount: parseUnits("2576.73315234", 8).toString(),
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
  },
  {
    symbol: "vWBETH",
    amount: parseUnits("0.89365885", 8).toString(),
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
  },
  {
    symbol: "vDAI",
    amount: parseUnits("27071.86465849", 8).toString(),
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
  },
  {
    symbol: "vBUSD",
    amount: parseUnits("10908.57803433", 8).toString(),
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  },
  {
    symbol: "vBCH",
    amount: parseUnits("21.1512832", 8).toString(),
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
  },
  {
    symbol: "vSXP",
    amount: parseUnits("925.79433296", 8).toString(),
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
  },
];

export const BEP20Transfers = [
  {
    symbol: "BTCB",
    amount: BigNumber.from(parseUnits("3.5029", 18)).add(parseUnits("1.06876", 18)).toString(),
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  },
  {
    symbol: "ETH",
    amount: BigNumber.from(parseUnits("17.371", 18)).add(parseUnits("14.55908", 18)).toString(),
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  },
  {
    symbol: "USDT",
    amount: BigNumber.from(parseUnits("29508.0359", 18)).add(parseUnits("219816.5002", 18)).toString(),
    address: "0x55d398326f99059fF775485246999027B3197955",
  },
  {
    symbol: "LTC",
    amount: parseUnits("280.38365", 18).toString(),
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
  },
  {
    symbol: "XVS",
    amount: parseUnits("1322.056", 18).toString(),
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  },
  {
    symbol: "Cake",
    amount: BigNumber.from(parseUnits("3397.15865", 18)).add(parseUnits("891.64848", 18)).toString(),
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  },
  {
    symbol: "UNI",
    amount: parseUnits("1252.25385", 18).toString(),
    address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  },
  {
    symbol: "FDUSD",
    amount: BigNumber.from(parseUnits("5261.65425", 18)).add(parseUnits("1031.64844", 18)).toString(),
    address: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
  },
  {
    symbol: "DOT",
    amount: BigNumber.from(parseUnits("618.32785", 18)).add(parseUnits("529.97468", 18)).toString(),
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  },
  {
    symbol: "ADA",
    amount: parseUnits("6877.765", 18).toString(),
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  },
  {
    symbol: "XRP",
    amount: parseUnits("5427.9473", 18).toString(),
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  },
  {
    symbol: "LINK",
    amount: BigNumber.from(parseUnits("141.65625", 18)).add(parseUnits("75.03636", 18)).toString(),
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  },
  {
    symbol: "MATIC",
    amount: parseUnits("2661.62045", 18).toString(),
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
  },
  {
    symbol: "BETH",
    amount: parseUnits("0.71965", 18).toString(),
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
  },
  {
    symbol: "DOGE",
    amount: parseUnits("19727.91485", 8).toString(),
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  },
  {
    symbol: "FIL",
    amount: parseUnits("266.1287", 18).toString(),
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
  },
  {
    symbol: "TUSD",
    amount: BigNumber.from(parseUnits("1327.33975", 18)).add(parseUnits("3883.51888", 18)).toString(),
    address: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  },
  {
    symbol: "wBETH",
    amount: parseUnits("0.4473", 18).toString(),
    address: "0xa2e3356610840701bdf5611a53974510ae27e2e1",
  },
  {
    symbol: "DAI",
    amount: parseUnits("4292.3044", 18).toString(),
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  },
  {
    symbol: "TRX",
    amount: parseUnits("11124.31032", 6).toString(),
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  },
];

const vBEP20TransferCommands = vToken_Transfers.map((vTokenTransfer: VTokenTransfer) => {
  return {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [vTokenTransfer.address, vTokenTransfer.amount, TOKEN_REDEEMER],
  };
});

const vBEP20RedeemCommands = vToken_Transfers.map((vTokenTransfer: VTokenTransfer) => {
  return {
    target: TOKEN_REDEEMER,
    signature: "redeemAndTransfer(address,address)",
    params: [vTokenTransfer.address, TREASURY],
  };
});

const BEP20TransferCommands = BEP20Transfers.map((bep20Transfer: BEP20Transfer) => {
  return {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [bep20Transfer.address, bep20Transfer.amount, BINANCE],
  };
});

export const vip256 = () => {
  const meta = {
    version: "v2",
    title: "VIP-256",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      ...vBEP20TransferCommands,
      ...vBEP20RedeemCommands,
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vBNB, vBNB_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: vBNB,
        signature: "redeem(uint256)",
        params: [vBNB_AMOUNT],
      },
      {
        target: TREASURY,
        signature: "",
        params: [],
        value: BNB_AMOUNT_TO_TREASURY,
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT],
      },
      {
        target: TREASURY,
        signature: "",
        params: [],
        value: WBNB_AMOUNT,
      },
      ...BEP20TransferCommands,
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT_TO_BINANCE, BINANCE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip256;
