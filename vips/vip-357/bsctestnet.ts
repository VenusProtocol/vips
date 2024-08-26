import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const ARBITRUM_SEPOLIA_IRMs = [
  "0xe68f42900a8cc014FC598B85463a4712b9176Cd7",
  "0xBbb522fCA8f5955942515D8EAa2222251a070a17",
  "0x50e8FF8748684F5DbDAEc5554c7FE3E82Cdc19e1",
];
export const SEPOLIA_IRMs = [
  "0xfBa27be0766acb9a60d2cede3d4293193f3b749d",
  "0x05A02a17151947a8c25e3e8F607503122DB958dD",
  "0xe948BBE16a846988A501A33Fb6A82Af4E2f231aE",
  "0x1A9ca9032C7ee7335736fCaa5e8fb62b283538da",
  "0xA03205bC635A772E533E7BE36b5701E331a70ea3",
  "0xf5EA67C92EF40b948EF672DE5fb913237A880A9E",
  "0x0F2F036067BBFc5841d394Aee78F611C64f7c759",
  "0x9Fafd82fE0623B286FEbe02c82C9428AD6b0e420",
  "0x1b821241f5E3f3AecBeE29901BeE07f5a264915f",
  "0x710F4044007a0e72e54626394462dB57d2d8479F",
  "0xaf5feAbe347BE5DF603CE63e45155bDb8049C78c",
];
export const OPBNBTESTNET_IRMs = [
  "0x0E43acCbe2f38A0e98C6979bE5b803f813ce8be5",
  "0x0b7cdC617bFE8e63D7861AbC1139811b61DbC869",
  "0x48C8a6A591f8f0943bF5FeEFB5E1Cbc803Eda89e",
  "0xaf6862b20280818FA24fA6D17097517608Fe65d4",
];

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

      ...ARBITRUM_SEPOLIA_IRMs.map(irm => {
        return {
          target: ARBITRUM_SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumsepolia.GUARDIAN],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),

      ...SEPOLIA_IRMs.map(irm => {
        return {
          target: SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.GUARDIAN],
          dstChainId: LzChainId.sepolia,
        };
      }),

      ...OPBNBTESTNET_IRMs.map(irm => {
        return {
          target: OPBNBTESTNET_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbtestnet.GUARDIAN],
          dstChainId: LzChainId.opbnbtestnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip357;
