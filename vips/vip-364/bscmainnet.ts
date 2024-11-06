import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const newSpeeds: SpeedRecord[] = [
  {
    market: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    symbol: "vUSDC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    symbol: "vUSDT",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    symbol: "vBNB",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    symbol: "vBTC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    symbol: "vETH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    symbol: "vLTC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    symbol: "vXRP",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    symbol: "vBCH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    symbol: "vDOT",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    symbol: "vLINK",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    symbol: "vDAI",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    symbol: "vFIL",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    symbol: "vADA",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    symbol: "vDOGE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    symbol: "vMATIC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    symbol: "vCAKE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    symbol: "vAAVE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    symbol: "vTRX",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    symbol: "vWBETH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
    symbol: "vFDUSD",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x27FF564707786720C71A2e5c1490A63266683612",
    symbol: "vUNI",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    symbol: "vXVS",
    supplySideSpeed: "1388888888888888",
    borrowSideSpeed: "0",
  },
];

const vip364 = () => {
  const meta = {
    version: "v2",
    title: "VIP-364 [BNB Chain] XVS Emissions Adjustments",
    description: `#### Summary

Following the previous [community proposal](https://community.venus.io/t/emissions-adjustments-for-bnb-chain/4554/1) and following [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xbb361ec726cebc7bc78d564e65cadd447fcbf1dac0082ee1b2a8eb8251d3e0c0), this proposal adjusts the XVS emissions on the BNB Chain following an in-depth analysis of market TVL proportions and the current emission weights relative to the total market APYs. The proposed emission adjustments are detailed below.

#### Monthly XVS emissions reduction details

- BNB: Current allocation: 2,812 / New allocation: 0
- BTCB: Current allocation: 2,812 / New allocation 0
- ETH : Current allocation: 1,406 / New allocation: 0
- USDC: Current allocation: 1,172 / New allocation:0
- USDT: Current allocation: 1,172/ New allocation: 0
- FDUSD: Current allocation: 300/ New allocation: 0
- WBETH: Current allocation: 257/ New allocation: 0
- DAI: Current allocation: 140 / New allocation: 0
- ADA: Current allocation: 140 / New allocation: 0
- UNI: Current allocation: 140 / New allocation: 0
- DOT: Current allocation: 137 / New allocation: 0
- MATIC: Current allocation:  94 / New allocation: 0
- CAKE: Current allocation: 94 / New allocation: 0
- TRX: Current allocation: 94 / New allocation: 0
- LTC: Current allocation: 86 / New allocation: 0
- XRP: Current allocation: 86 / New allocation: 0
- LINK: Current allocation: 86 / New allocation: 0
- BCH: Current allocation: 47 / New allocation: 0
- FIL: Current allocation: 47 / New allocation: 0
- DOGE  : Current allocation: 47 / New allocation: 0
- AAVE: Current allocation: 47 / New allocation: 0
- XVS: Current allocation:  0 / New allocation: 1,200

Total new Emissions: 1,200 XVS per month.

#### Sensitivity Analysis

A [sensitivity analysis](https://community.venus.io/t/emissions-adjustments-for-bnb-chain/4554/1) was conducted to assess the impact of emission adjustments on market APYs, estimating how reductions in emissions might affect overall market performance.

#### XVS Market Emissions

The Venus Community has been advocating for several months for the XVS Market on the Core pool to be lightly Incentivized. In doing so, the XVS Market on the core pool can offer additional advantages for both the Venus protocol and its community as well as increased XVS Utility and Demand while slightly offsetting the borrow interests paid by XVS suppliers borrowing funds against these. It’s also a way to thank the XVS holders for their continuous support.

#### Final Recommendations

Based on the analysis, the recommendations are as follows:

- **Eliminate emissions** for markets representing less than 5% of total protocol TVL.
- **BTCB Market**: This market stands out with a low total APY of 0.04% and a utilization rate of 6%. This suggests that users are primarily supplying BTCB as collateral rather than for returns. Given this, emissions are recommended to be removed, as their absolute impact on supply APY would be minimal—an estimated reduction of just 0.01%.
- For **all remaining markets**, the relative boost weight is below 10%, meaning emissions have a negligible effect on the total APY. Therefore, it is recommended to **remove emissions entirely** for these markets as well.

By implementing these changes, the proposal aims to optimize XVS emissions, focusing on markets that contribute significantly to the overall TVL and ensuring a more effective allocation of resources across the BNB Chain.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/380)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [
          newSpeeds.map(s => s.market),
          newSpeeds.map(s => s.supplySideSpeed),
          newSpeeds.map(s => s.borrowSideSpeed),
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip364;
