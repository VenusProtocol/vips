import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const ETHEREUM_CONVERTERS = [
  "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE",
  "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD",
  "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E",
  "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0",
  "0xb8fD67f215117FADeF06447Af31590309750529D",
  "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407",
];
export const ETHEREUM_CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";

const vip359 = () => {
  const meta = {
    version: "v2",
    title: "VIP-359",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Revoke Permissions
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: ETHEREUM_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [converter, "setMinAmountToConvert(uint256)", ethereum.GUARDIAN],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: ETHEREUM_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [converter, "setConversionConfig(address,address,ConversionConfig)", ethereum.GUARDIAN],
          dstChainId: LzChainId.ethereum,
        };
      }),
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "addTokenConverter(address)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "removeTokenConverter(address)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip359;
