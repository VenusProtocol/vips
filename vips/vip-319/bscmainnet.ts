import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vBNBAdmin_Implementation = "0xaA8D9558d8D45666552a72CECbdd0a746aeaCDc9";
export const vBNBAdmin = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const ProxyAdmin = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const vip320 = () => {
  const meta = {
    version: "v2",
    title: "VIP-319",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ProxyAdmin,
        signature: "upgrade(address,address)",
        params: [vBNBAdmin, vBNBAdmin_Implementation],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip320;
