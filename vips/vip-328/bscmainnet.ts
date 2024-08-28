import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vUSDT = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vUSDT_SUPPLY_CAP = parseUnits("5000000", 18);

const vip328 = () => {
  const meta = {
    version: "v2",
    title: "VIP-328 Risk Parameters Adjustments (USDT, sFRAX)",
    description: `If passed, this VIP will perform the set changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 06/17/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-06-17-24/4430).

- Increase [sFRAX’s (Ethereum Core)](https://etherscan.io/address/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe) borrow cap, from 1M to 2M
- Increase [USDT’s (BNB GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37) supply cap, from 4M to 5M

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/307](https://github.com/VenusProtocol/vips/pull/307)

#### Disclaimer for Ethereum commands

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x983400a383913ad0f91d46dc63e2deeec89418236eb2f67518c2fe2c52e2ffd8) multisig transaction will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vUSDT], [vUSDT_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip328;
