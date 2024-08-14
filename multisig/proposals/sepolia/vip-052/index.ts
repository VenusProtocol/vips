import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const CONVERTERS = [
  "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40",
  "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2",
  "0x511a559a699cBd665546a1F75908f7E9454Bfc67",
  "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE",
  "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46",
  "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0xb86e532a5333d413A1c35d86cCdF1484B40219eF";
export const CONVERTER_NETWORK = "0xB5A4208bFC4cC2C4670744849B8fC35B21A690Fa";

const vip052 = () => {
  return makeProposal([
    {
      target: SINGLE_TOKEN_CONVERTER_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),

    // Revoke permissions
    ...CONVERTERS.map(converter => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [converter, "setMinAmountToConvert(uint256)", sepolia.GUARDIAN],
      };
    }),
    ...CONVERTERS.map(converter => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [converter, "setConversionConfig(address,address,ConversionConfig)", sepolia.GUARDIAN],
      };
    }),
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [CONVERTER_NETWORK, "addTokenConverter(address)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [CONVERTER_NETWORK, "removeTokenConverter(address)", sepolia.GUARDIAN],
    },
  ]);
};

export default vip052;
