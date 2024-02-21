import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
const OLD_IMPL = "0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965";
const TEMP_IMPL = "0x3aD4b5677AdC2a6930B2A08f443b9B3c6c605CD8";

export const vip260 = (data?: string) => {
  const meta = {
    version: "v2",
    title: "VIP-260 Liquidator contract owner upgrade",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgradeAndCall(address,address,bytes)",
        params: [LIQUIDATOR, TEMP_IMPL, data],
      },

      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, OLD_IMPL],
      },

      {
        target: LIQUIDATOR,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip260;
