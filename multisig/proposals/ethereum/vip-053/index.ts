import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const CONVERTERS = [
  "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE",
  "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD",
  "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E",
  "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0",
  "0xb8fD67f215117FADeF06447Af31590309750529D",
  "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1";
export const CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";

const vip053 = () => {
  return makeProposal([
    {
      target: SINGLE_TOKEN_CONVERTER_BEACON,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),

    // Revoke permissions
    ...CONVERTERS.map(converter => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [converter, "setMinAmountToConvert(uint256)", ethereum.GUARDIAN],
      };
    }),
    ...CONVERTERS.map(converter => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [converter, "setConversionConfig(address,address,ConversionConfig)", ethereum.GUARDIAN],
      };
    }),
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [CONVERTER_NETWORK, "addTokenConverter(address)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [CONVERTER_NETWORK, "removeTokenConverter(address)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip053;
