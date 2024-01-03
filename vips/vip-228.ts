import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

export const vip228 = () => {
  const meta = {
    version: "v2",
    title: "VIP-228 Send XVS from Comptroller to XVSStore",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_STORE, parseUnits("96075", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
