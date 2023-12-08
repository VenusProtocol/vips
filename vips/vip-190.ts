import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";

interface AssetConfig {
  symbol: string;
  vTokenAddress: string;
  vTokenBalanceMantissa: string;
  underlyingAddress: string;
  underlyingAmount: string;
}

export const VTOKEN_SNAPSHOT: AssetConfig[] = [
  {
    symbol: "vUSDC",
    vTokenAddress: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    vTokenBalanceMantissa: "249618968448324",
    underlyingAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    underlyingAmount: "56216287825814779920790",
  },
  {
    symbol: "vUSDT",
    vTokenAddress: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    vTokenBalanceMantissa: "1015098123050060",
    underlyingAddress: "0x55d398326f99059fF775485246999027B3197955",
    underlyingAmount: "228784352253839582574982",
  },
  {
    symbol: "vSXP",
    vTokenAddress: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    vTokenBalanceMantissa: "119659870814202",
    underlyingAddress: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    underlyingAmount: "24135813572896693578350", // -1 SXP to avoid issues with rounding errors
  },
  {
    symbol: "vXVS",
    vTokenAddress: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    vTokenBalanceMantissa: "23588846631992",
    underlyingAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    underlyingAmount: "4743980668892061139746",
  },
  {
    symbol: "vBNB",
    vTokenAddress: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    vTokenBalanceMantissa: "62846944490450",
    underlyingAddress: "0x0",
    underlyingAmount: "14294680057888471300063",
  },
  {
    symbol: "vBTC",
    vTokenAddress: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    vTokenBalanceMantissa: "78724571423",
    underlyingAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    underlyingAmount: "15990179446303537874",
  },
  {
    symbol: "vETH",
    vTokenAddress: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    vTokenBalanceMantissa: "183112865219",
    underlyingAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    underlyingAmount: "37625757791351165230",
  },
  {
    symbol: "vLTC",
    vTokenAddress: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    vTokenBalanceMantissa: "1174125836305",
    underlyingAddress: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    underlyingAmount: "237850177000076730863",
  },
  {
    symbol: "vXRP",
    vTokenAddress: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    vTokenBalanceMantissa: "160928363785777",
    underlyingAddress: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    underlyingAmount: "32654158829928364169881",
  },
  {
    symbol: "vBCH",
    vTokenAddress: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    vTokenBalanceMantissa: "4468371414",
    underlyingAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    underlyingAmount: "923200415480512689",
  },
  {
    symbol: "vDOT",
    vTokenAddress: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    vTokenBalanceMantissa: "2756846755130",
    underlyingAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    underlyingAmount: "613770410919222527609",
  },
  {
    symbol: "vLINK",
    vTokenAddress: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    vTokenBalanceMantissa: "2053484577200",
    underlyingAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    underlyingAmount: "417266325474710768927",
  },
  {
    symbol: "vDAI",
    vTokenAddress: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    vTokenBalanceMantissa: "12878775340379",
    underlyingAddress: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    underlyingAmount: "2858601947682360894853",
  },
  {
    symbol: "vFIL",
    vTokenAddress: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    vTokenBalanceMantissa: "13938895782926",
    underlyingAddress: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    underlyingAmount: "2878559456356585069661",
  },
  {
    symbol: "vBETH",
    vTokenAddress: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    vTokenBalanceMantissa: "1355242648",
    underlyingAddress: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    underlyingAmount: "277016975436269725", // -0.001 BETH to avoid issues with rounding errors
  },
  {
    symbol: "vADA",
    vTokenAddress: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    vTokenBalanceMantissa: "259561111178062",
    underlyingAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    underlyingAmount: "53885947480858973610232",
  },
  {
    symbol: "vDOGE",
    vTokenAddress: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    vTokenBalanceMantissa: "139035807800630",
    underlyingAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    underlyingAmount: "2820409310431",
  },
  {
    symbol: "vMATIC",
    vTokenAddress: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    vTokenBalanceMantissa: "7394592896686",
    underlyingAddress: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    underlyingAmount: "1541813884382454180276",
  },
  {
    symbol: "vCAKE",
    vTokenAddress: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    vTokenBalanceMantissa: "32999649151776",
    underlyingAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    underlyingAmount: "9134220681693791438231",
  },
  {
    symbol: "vAAVE",
    vTokenAddress: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    vTokenBalanceMantissa: "39275670672",
    underlyingAddress: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    underlyingAmount: "8125549069133295096",
  },
  {
    symbol: "vTRXOLD",
    vTokenAddress: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    vTokenBalanceMantissa: "28901561446948",
    underlyingAddress: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    underlyingAmount: "6080553607465818470202", // -1 TRXOLD to avoid issues with rounding errors
  },
  {
    symbol: "vTRX",
    vTokenAddress: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    vTokenBalanceMantissa: "351253533026",
    underlyingAddress: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    underlyingAmount: "3602188613",
  },
];

export const vip190 = () => {
  const meta = {
    version: "v2",
    title: "VIP-190 Protocol Liquidation Revenue Withdrawal",
    description: `#### Summary

If passed, this VIP will redeem every VToken that was in the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) on October 1st, 2023, and it will transfer the associated underlying tokens to the Venus Treasury.

#### Description

This VIP will redeem Venus Protocol liquidation fee revenues accumulated over the first three quarters (Q1, Q2, Q3) of 2023. Presently, these assets are held as VTokens in the Venus Treasury and need to be accessed for purposes dictated by the [Venus tokenomics](https://docs-v4.venus.io/governance/tokenomics). Subsequently, an additional VIP will be introduced to allocate the risk fund toward repaying a portion of the protocol’s shortfall. Additionally, the plan is to withdraw the remaining amount to be converted into BTC, ETH, USDC, and USDT, ensuring alignment with the Venus tokenomics — specifically applying Tokenomics V3 for Q1 revenues and Tokenomics V4 for revenues from Q2 onwards.

This process will be divided into three parts:

1. Redeem all VTokens accrued from liquidation fees to their underlying asset.
2. Repay a portion of the protocol’s shortfall.
3. Withdraw all underlying assets and convert them into BTC, ETH, USDC and USDT

This VIP will focus on the first part of the process: Redeem all VTokens accrued from liquidation fees to their underlying asset. The Dollar value amount of these VTokens to be claimed and deposited in the Treasury as their underlying represents a value of about $3.9M USD.

Only the VTokens of the Venus Core pool will be considered in this VIP, except vBUSD and vTUSDOLD, due to the lack of liquidity.

This VIP doesn’t imply any changes in the code of the smart contracts. The VIP has been simulated [here](https://github.com/VenusProtocol/vips/pull/92).

**References**

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/92)
- [Venus tokenomics](https://docs-v4.venus.io/governance/tokenomics)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...VTOKEN_SNAPSHOT.map(object => {
        return {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [object.vTokenAddress, object.vTokenBalanceMantissa, NORMAL_TIMELOCK],
        };
      }),

      ...VTOKEN_SNAPSHOT.map(object => {
        return {
          target: object.vTokenAddress,
          signature: "redeem(uint256)",
          params: [object.vTokenBalanceMantissa],
        };
      }),

      ...VTOKEN_SNAPSHOT.map(object => {
        if (object.symbol === "vBNB") {
          return {
            target: VTREASURY,
            signature: "",
            params: [],
            value: object.underlyingAmount,
          };
        } else {
          return {
            target: object.underlyingAddress,
            signature: "transfer(address,uint256)",
            params: [VTREASURY, object.underlyingAmount],
          };
        }
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
