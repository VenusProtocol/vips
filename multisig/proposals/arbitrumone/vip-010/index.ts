import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const IRMs = [
  "0x390D1C248217615D79f74f2453D682906Bd2dD20",
  "0x305f960b00594200ed80373B61b38e669651469E",
  "0xC7EDE29FE265aA46C1Bbc62Dc7e0f3565cce3Db6",
];

const vip010 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumone.GUARDIAN],
      };
    }),
  ]);
};

export default vip010;
