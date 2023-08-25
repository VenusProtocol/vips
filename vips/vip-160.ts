import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const STORAGE_UINT_CONTRACT = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const STORAGE_MAPPING_COTNRACT = "0x435D55709070ee1f0789685F9859038e9D5C39d7";
const VENUS_DEPLOYER_ADDRESS = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";

export const vip160 = () => {
  const meta = {
    version: "v2",
    title: "VIP-160 Sepolia Multisig POC",
    description: `
      This VIP is supposed to showcase the txBuilder VIP generation to be executed from Gnosis Multisig
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: STORAGE_UINT_CONTRACT,
        signature: "store(uint256)",
        params: [1],
      },
      {
        target: STORAGE_MAPPING_COTNRACT,
        signature: "store(address,uint256)",
        params: [VENUS_DEPLOYER_ADDRESS,2],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
