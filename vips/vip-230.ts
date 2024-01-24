import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

export const vip230 = () => {
  const meta = {
    version: "v2",
    title: "VIP-230 Allocate Legacy XVS Rewards to the XVS Vault",
    description: `#### Summary

If passed, this VIP will allocate legacy XVS market rewards to the [XVS Vault Rewards smart contract](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359).

#### Description

In preparation for our new Quarterly Buyback, this VIP Proposal will allocate legacy XVS market rewards to the XVS Vault in accordance with the [Tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9). The last legacy XVS rewards allocation was made in June 2023 with [VIP-133](https://app.venus.io/#/governance/proposal/133) for a period of 6 months hence, the necessity to top-up the Vault Rewards for another 6 months period.

January 1, 2024 to June 30, 2024 = 182 Days. This VIP will allocate 182 days x 1,050 XVS/day = **191,100 XVS** to the vault rewards distribution contract`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_STORE, parseUnits("191100", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
