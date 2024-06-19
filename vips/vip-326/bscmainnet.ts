import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vUSDT = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vUSDT_SUPPLY_CAP = parseUnits("5000000", 18);

const vip326 = () => {
  const meta = {
    version: "v2",
    title: "VIP-326",
    description: ``,
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

export default vip326;
