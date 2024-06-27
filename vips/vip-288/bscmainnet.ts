import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VUSDT_StableCoin = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const VUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

const VUSDT_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDC_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VDAI_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VFDUSD_IR = "0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B";
const VTUSD_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDT_StableCoin_IR = "0x2ba0F45f7368d2A56d0c9e5a29af363987BE1d02";
const VUSDT_GameFi_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";
const VUSDT_DeFi_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";

export const vip288 = () => {
  const meta = {
    version: "v2",
    title: "VIP-288 Risk Parameters Adjustments (Stablecoins)",
    description: `#### Disclaimer for Ethereum and opBNB commands

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xffbc2559ed20c2e5189443bfc53928d426bfef4860ec9a72f77badaff8c0ed77) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xa769d5ba255858be708ebf483cf79668f1f08edfdbcbb72408ca01fa04c329ce) multisig transactions will be executed. Otherwise, they will be rejected.

#### Description

This VIP will perform the first set of changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Stablecoin IR Updates - 04/04/24](https://community.venus.io/t/chaos-labs-stablecoin-ir-updates-04-04-24/4241).

- BNB chain
    - Increase multiplier (annualized), from 0.06875 (5.5% APR at kink) to 0.1 (8% APR at kink): [USDT (Core pool)](https://bscscan.com/address/0xfD5840Cd36d94D7229439859C0112a4185BC0255), [USDC (Core pool)](https://bscscan.com/address/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8), [DAI (Core pool)](https://bscscan.com/address/0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1), [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba), [TUSD (Core pool)](https://bscscan.com/address/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E), [USDT (Stablecoins)](https://bscscan.com/address/0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B)
    - Increase multiplier (annualized), from 0.125 (10% APR at kink) to 0.15 (12% APR at kink): [USDT (GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37), [USDT (DeFi)](https://bscscan.com/address/0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854)
- Ethereum
    - Increase multiplier (annualized), from 0.07 (5.6% APR at kink) to 0.1 (8% APR at kink), and jump multiplier (annualized), from 80% to 250%: [USDT (Core pool)](https://etherscan.io/address/0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E), [USDC (Core pool)](https://etherscan.io/address/0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb), [crvUSD (Core pool)](https://etherscan.io/address/0x672208C10aaAA2F9A6719F449C4C8227bc0BC202), [crvUSD (Curve pool)](https://etherscan.io/address/0x2d499800239C4CD3012473Cb1EAE33562F0A6933)
- opBNB
    - Increase multiplier (annualized), from 0.075 (6% APR at kink) to 0.1 (8% APR at kink): [FDUSD (Core pool)](https://opbnbscan.com/address/0x13B492B8A03d072Bab5C54AC91Dba5b830a50917), [USDT (Core pool)](https://opbnbscan.com/address/0xb7a01Ba126830692238521a1aA7E7A7509410b8e)

There will be two VIPs in the following weeks to perform the rest of the changes recommended by Chaos Labs.

Moreover, this VIP will also perform this change recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs Recommendations - FDUSD Jump Multiplier Update](https://community.venus.io/t/chaos-labs-recommendations-fdusd-jump-multiplier-update/4248).

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase jump multiplier (annualized), from 2.5 to 5

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/258](https://github.com/VenusProtocol/vips/pull/258)`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VUSDT,
        signature: "_setInterestRateModel(address)",
        params: [VUSDT_IR],
      },
      {
        target: VUSDC,
        signature: "_setInterestRateModel(address)",
        params: [VUSDC_IR],
      },
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

export default vip288;
