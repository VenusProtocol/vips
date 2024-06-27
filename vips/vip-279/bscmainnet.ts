import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { accounts3, accounts4, accounts5, accounts6 } from "./users";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip279 = () => {
  const meta = {
    version: "v2",
    title: "VIP-279 Recover XVS rewards from bad debtors",
    description: `Related to the [VIP-276](https://app.venus.io/#/governance/proposal/276), if this VIP passes, it will recover all XVS rewards allocated to the pending 12 wallets whose bad debt was removed in the [VIP-244](https://app.venus.io/#/governance/proposal/244), for an estimated total of 125 XVS.

The recovered XVS will be sent to the [XVS Distributor contract](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384), on BNB Chain.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/195)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts3, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts4, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts5, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts6, UNITROLLER],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip279;
