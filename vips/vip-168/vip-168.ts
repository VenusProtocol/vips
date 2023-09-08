import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xb5Cb55cAbC34544C708289D899Dfe2f190794C8D";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

export const vip168 = () => {
  const meta = {
    version: "v2",
    title: "VIP-168",
    description: ``,
    forDescription: "Process to configure Liquidity Mining",
    againstDescription: "Defer configuration of Liquidity Mining",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_COMPTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
