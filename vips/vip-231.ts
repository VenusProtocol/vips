import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
const DOT = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402";
const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
const FLOKI = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E";
const MATIC = "0xCC42724C6683B7E57334c4E856f4c9965ED682bD";
const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const AAVE = "0xfb6115445Bff7b52FeB98650C87f44907E58f802";
const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const BTT = "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B";

export const vip231 = () => {
  const meta = {
    version: "v2",
    title: "VIP-231 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Summary

VIP relates to the Quarterly Venus Protocol XVS Buyback & Funds allocation as indicated in our [Tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9).

The total protocol revenues for this quarter were: $5,148,257. Based on the previous [quarterly withdrawal](https://app.venus.io/#/governance/proposal/183), the BUSD reserve revenues for Q3 will also be considered, resulting in a total amount of $6,425,156.

Based on the protocol’s [Tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9), the resulting buyback amount is $642,516.

If passed, this VIP will transfer 17 tokens, valued at $642,516, to Binance for the swap to XVS.

#### Details

Q4 Revenues Denominated in USD Were as Follows:

**Reserve Revenue:**

- BNB: $2,500,544.97
- BUSD: $1,096,702.98 (+$1,276,899 from Q3)
- USDT: $373,440.56
- USDC: $160,745.56
- BTC: $95,939.24
- ETH: $55,093.92
- TUSDOLD: $34,564.12
- DOT: $9,295.60
- DAI: $7,921.04
- Cake: $6,253.24
- TUSD: $5,656.33
- SXP: $3,936.74
- LINK: $2,405.83
- ADA: $2,271.74
- DOGE: $1,579.83
- MATIC: $1,098.79
- All other tokens: $5,093.74

**Total Reserve Revenue:** $4,365,571 (+$1,276,899)

**Liquidation Revenues:**

- BTC: $286,630.95
- BNB: $124,229.87
- BUSD: $75,296.12
- ETH: $74,093.07
- USDT: $53,495.89
- LTC: $40,793.12
- USDC: $26,555.31
- XVS: $25,713.87
- UNI: $18,081.35
- FDUSD: $10,030.87
- Cake: $9,058.33
- ADA: $7,260.86
- DOT: $5,466.33
- MATIC: $5,046.33
- XRP: $4,958.74
- LINK: $4,064.01
- FIL: $3,658.00
- BETH: $3,281.60
- TUSD: $2,169.24
- WBETH: $1,923.24
- All other tokens: $878.29

**Total Liquidation Revenue:** $782,685.39

**Total Protocol Revenues for Q4:** $5,148,257

**Total Protocol Revenues for Q4 including BUSD reserves from Q3:** $6,425,156

*Considerations: These values consider token prices for Dec 31 2023, block number 34848729.*

**Tokenomic Allocations**

Revenues will be distributed based on the protocol's latest [Tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9).

**Allocations:**

- Risk Fund: $2,648,331
- Treasury: $2,570,062
- XVS Buyback: $642,516
- Prime: $564,247

**Total:** $6,425,156

**XVS Buyback Process:**

Total Buyback Amount: $642,516

For the XVS conversion, it is necessary to send the funds to Binance for the swap.

The following tokens will be sent and converted to XVS:

**Assets with Token Amounts and USD Values:**

- ETH: 92.81 ($203,661.43)
- Cake: 54,198.52 ($169,641.37)
- ADA (Binance-Peg): 107,165.54 ($58,915.69)
- DOT: 4,845.75 ($37,048.28)
- XRP: 61,727.99 ($35,372.97)
- BETH: 14.99 ($33,885.65)
- FIL: 3,426.22 ($21,080.76)
- LINK: 1,474.52 ($20,562.15)
- LTC: 306.8828 ($19,973.89)
- BCH: 53.85 ($12,611.68)
- DOGE: 98,580 ($8,032.92)
- FLOKI: 177,082,683.00 ($5,534.11)
- MATIC: 6,242.52 ($5,345.34)
- TRX: 40,954.23 ($4,287.64)
- AAVE: 28.45 ($2,841.24)
- TUSD: 2,202.10 ($2,201.65)
- BTT: 1.3925B ($1,519.23)

**Total:** $642,516

Estimated XVS amount after conversions: **51,401** XVS

Legacy rewards for this quarter: **95,550** XVS

**Total XVS to distribute:** 146,951 XVS

**Estimated Q1 2024 XVS Vault APR: 1600 XVS per day or 8.8% APR**

*Considerations: These values consider token prices for Jan 3 2024, block number 34929803.*`,
    forDescription: "I agree that Venus Protocol should proceed with the Buyback & Tokenomics Distribution",
    againstDescription: "I do not think that Venus Protocol should proceed with the Buyback & Tokenomics Distribution",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Buyback & Tokenomics Distribution",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, parseUnits("92.81", 18), BINANCE_WALLET],
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
        params: [BTT, parseUnits("1392507212.379014539551354601", 18), BINANCE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
