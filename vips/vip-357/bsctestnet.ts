import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const SEPOLIA_CONVERTERS = [
  "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40",
  "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2",
  "0x511a559a699cBd665546a1F75908f7E9454Bfc67",
  "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE",
  "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46",
  "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2",
];
export const SEPOLIA_CONVERTER_NETWORK = "0xB5A4208bFC4cC2C4670744849B8fC35B21A690Fa";

const vip357 = () => {
  const meta = {
    version: "v2",
    title: "VIP-357",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Revoke Permissions
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [converter, "setMinAmountToConvert(uint256)", sepolia.GUARDIAN],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [converter, "setConversionConfig(address,address,ConversionConfig)", sepolia.GUARDIAN],
          dstChainId: LzChainId.sepolia,
        };
      }),
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_CONVERTER_NETWORK, "addTokenConverter(address)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_CONVERTER_NETWORK, "removeTokenConverter(address)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip357;
