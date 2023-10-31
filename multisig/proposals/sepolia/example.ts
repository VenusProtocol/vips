import { makeProposal } from "../../../src/utils";

const STORAGE_UINT_CONTRACT = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const STORAGE_MAPPING_COTNRACT = "0x435D55709070ee1f0789685F9859038e9D5C39d7";
const VENUS_DEPLOYER_ADDRESS = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";

export const example = () => {
  return makeProposal([
    {
      target: STORAGE_UINT_CONTRACT,
      signature: "store(uint256)",
      params: [10],
    },
    {
      target: STORAGE_MAPPING_COTNRACT,
      signature: "store(address,uint256)",
      params: [VENUS_DEPLOYER_ADDRESS, 11],
    },
  ]);
};
