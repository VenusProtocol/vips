import { cutParams as params } from "../../simulations/vip-seize-venus/vip-seize-venus-testnet/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const ACM = "0x69a9e5dee4007fb1311c4d086fed4803e09a30b5";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

const cutParams = params;

export const vipSeizeVenusTestnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 New seizeVenus functionality",
    description: `In Diamond Proxy implementation of comptroller, Adding seizeVenus functionality that would allow Governance (VIP) to seize
      the XVS rewards allocated to one, or several users. The seizeVenus method is added as cut param to RewardFacet of Diamond proxy implementation.`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "seizeVenus(address[],address)", timelock],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
