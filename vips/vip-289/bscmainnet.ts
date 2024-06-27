import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VUSDT_StableCoin = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const VUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

const VDAI_IR = "0x1485A27D95D3d2878a6641055dD3a643F296CCf6";
const VFDUSD_IR = "0x9Fca5d66Cc0DF990080825051E825A8104a7ffA4";
const VTUSD_IR = "0x1485A27D95D3d2878a6641055dD3a643F296CCf6";
const VUSDT_StableCoin_IR = "0x5E0dB1e8a6D6181aa39B3317179CDF91FBa4Ac51";
const VUSDT_GameFi_IR = "0xE1E25b6f3A74fB836B2d3b5A01f5252e2fa916a8";
const VUSDT_DeFi_IR = "0xE1E25b6f3A74fB836B2d3b5A01f5252e2fa916a8";

export const vip289 = () => {
  const meta = {
    version: "v2",
    title: "VIP-289 Risk Parameters Adjustments (Stablecoins)",
    description: `Following up the [VIP-288](https://app.venus.io/#/governance/proposal/288?chainId=56), if passes, this VIP will perform the second set of changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Stablecoin IR Updates - 04/04/24](https://community.venus.io/t/chaos-labs-stablecoin-ir-updates-04-04-24/4241).

- BNB chain
    - Increase multiplier (annualized), from 0.1 (8% APR at kink) to 0.125 (10% APR at kink): [DAI (Core pool)](https://bscscan.com/address/0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1), [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba), [TUSD (Core pool)](https://bscscan.com/address/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E), [USDT (Stablecoins)](https://bscscan.com/address/0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B)
    - Increase multiplier (annualized), from 0.15 (12% APR at kink) to 0.175 (14% APR at kink): [USDT (GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37), [USDT (DeFi)](https://bscscan.com/address/0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854)
    - This VIP is **not** performing any changes on [USDT (Core pool)](https://bscscan.com/address/0xfD5840Cd36d94D7229439859C0112a4185BC0255) and [USDC (Core pool)](https://bscscan.com/address/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8), following [the last comment from Chaos labs about these two markets](https://community.venus.io/t/chaos-labs-stablecoin-ir-updates-04-04-24/4241/5).
- Ethereum
    - Increase multiplier (annualized), from 0.1 (8% APR at kink) to 0.125 (10% APR at kink): [USDT (Core pool)](https://etherscan.io/address/0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E), [USDC (Core pool)](https://etherscan.io/address/0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb), [crvUSD (Core pool)](https://etherscan.io/address/0x672208C10aaAA2F9A6719F449C4C8227bc0BC202), [crvUSD (Curve pool)](https://etherscan.io/address/0x2d499800239C4CD3012473Cb1EAE33562F0A6933)
- opBNB
    - Increase multiplier (annualized), from 0.1 (8% APR at kink) to 0.125 (10% APR at kink): [FDUSD (Core pool)](https://opbnbscan.com/address/0x13B492B8A03d072Bab5C54AC91Dba5b830a50917), [USDT (Core pool)](https://opbnbscan.com/address/0xb7a01Ba126830692238521a1aA7E7A7509410b8e)

There will be one VIP in the following weeks to perform the rest of the changes recommended by Chaos Labs.

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/260](https://github.com/VenusProtocol/vips/pull/260)

#### Disclaimer for Ethereum and opBNB commands

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x3d4d7093b906a78d72da2eadc3645002a413c90bf99e5d36002e852b4f5da1dd) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xa708de9acdff181e21ba8fa3cdd7fa5efe706c343231603ba54495d4f62fea77) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VDAI,
        signature: "_setInterestRateModel(address)",
        params: [VDAI_IR],
      },
      {
        target: VFDUSD,
        signature: "_setInterestRateModel(address)",
        params: [VFDUSD_IR],
      },
      {
        target: VTUSD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSD_IR],
      },

      {
        target: VUSDT_StableCoin,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_StableCoin_IR],
      },
      {
        target: VUSDT_GameFi,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_GameFi_IR],
      },
      {
        target: VUSDT_DeFi,
        signature: "setInterestRateModel(address)",
        params: [VUSDT_DeFi_IR],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip289;
