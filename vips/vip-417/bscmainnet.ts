import { LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { parseUnits } from "ethers/lib/utils";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const TOTAL_XVS = parseUnits("104640", 18);
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS_STORE_AMOUNT = parseUnits("39690", 18);
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

const {bscmainnet} = NETWORK_ADDRESSES;

export const vip417 = () => {
  const meta = {
    version: "v2",
    title: "VIP-417",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, TOTAL_XVS],
      },
      {
        target: XVS,
        signature: "transfer(address,uint256)",
        params: [XVS_STORE, XVS_STORE_AMOUNT],
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip417;
