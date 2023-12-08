import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const grant = (target: string, signature: string, caller: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
});

export const vip188 = () => {
  const meta = {
    version: "v2",
    title: "VIP-188 Update XVS Distributions APR based on Q3 Buyback results",
    description: `#### Summary

This VIP will perform the following actions:

- Set the new XVS Vault distribution speed to 1,440 XVS/day
- Authorize Fast-track and Critical timelock contracts to adjust the XVS Vault distribution speed in the future

#### Description

Our latest [buyback](https://app.venus.io/#/governance/proposal/183) earlier this month for the amount of approximately USD $191,000 resulted in the buyback of 39,844.98 XVS at an average buy price of $4.79. These XVS were [already sent](https://bscscan.com/tx/0xccc066ce68a82e7df1ed66002d376f0dc3772f1074cdcf707fcabe3f64b0a7a9) to the XVS Vault rewards distribution wallet.

Due to the slight delay in performing the buyback off-chain, we were not able to adjust the XVS Vault distribution APR until this VIP and more XVS have been distributed in the earlier weeks, thus the need to further lower the APR for the remainder of this quarter to compensate for the extra XVS that were already distributed.

The new distribution speed will be 1,440 XVS per day for a period of 81 Days. resulting in an APR of 7.91%.`,
    forDescription: "I agree, Venus Protocol should immediately proceed with these adjustments.",
    againstDescription: "I do not think that Venus Protocol should proceed with these adjustments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these adjustments or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, "50000000000000000"],
      },
      grant(XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", FAST_TRACK_TIMELOCK),
      grant(XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", CRITICAL_TIMELOCK),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
