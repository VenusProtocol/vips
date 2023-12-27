import { cutParams as params } from "../../simulations/vip-223/vip-223/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const cutParams = params;

export const vip223 = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 Fix on the Diamond Comptroller configuration",
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
        params: [UNITROLLER, "_setForcedLiquidationForUser(address,address,bool)", timelock],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
