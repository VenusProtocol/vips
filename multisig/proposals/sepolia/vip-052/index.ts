import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const IRMs = [
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

const vip052 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.GUARDIAN],
      };
    }),
  ]);
};

export default vip052;
