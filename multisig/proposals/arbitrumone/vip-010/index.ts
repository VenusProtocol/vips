import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";

const vip010 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;
