import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const IRMs = [
  "0x508a84311d19fb77E603C1d234d560b2374d0791",
  "0x244dBE6d11Ae9AadBaD552E6BD8901B680028E31",
  "0x01E002C218D70dD374566cc40D9fCA1429AB7E65",
  "0xFCaBF5b76968e010b8BC310486bE418b9d16fEb2",
  "0x07a912CD58CbB5736d015608F424c43B2CAd0B5e",
  "0x0F84aF9A902dbb5a0986e5D5003189cF2B80A760",
  "0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4",
  "0x50196dfad5030ED54190F75e5F9d88600A4CA0B4",
  "0x17F987e09896F19584799e3FFD10679b9C7C35f0",
  "0xae838dEB13Ff67681704AA69e31Da304918Ee43D",
  "0xa4f048254631119f4E899359711fB282589c4ED8",
  "0x694536cbCe185f8549Ca56cDFeE4531593762686",
  "0x162b94324279A3ad3AF3Eafd0CE3103a14e5b377",
  "0x5eD025A0a8A050bB08BC6c5FbEd526be2321A872",
  "0x87C427b00C89E82064B32Ca63c9E983fedD3e53e",
  "0xd7fbFD2A36b8b388E6d04C7a05956Df91862E146",
];

const vip053 = () => {
  return makeProposal([
    // Revoke permissions
    ...IRMs.map(irm => {
      return {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", ethereum.GUARDIAN],
      };
    }),
  ]);
};

export default vip053;
