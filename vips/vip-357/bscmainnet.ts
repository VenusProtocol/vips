import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;
export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ARBITRUM_ONE_IRMs = [
  "0x390D1C248217615D79f74f2453D682906Bd2dD20",
  "0x305f960b00594200ed80373B61b38e669651469E",
  "0xC7EDE29FE265aA46C1Bbc62Dc7e0f3565cce3Db6",
];
export const ETHEREUM_IRMs = [
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
export const OPBNBMAINNET_IRMs = [
  "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264",
  "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B",
  "0x102F0b714E5d321187A4b6E5993358448f7261cE",
  "0x31061a662A87005E5EdbC56EBAd5422eD7952084",
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

      ...ARBITRUM_ONE_IRMs.map(irm => {
        return {
          target: ARBITRUM_ONE_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumone.GUARDIAN],
          dstChainId: LzChainId.arbitrumone,
        };
      }),

      ...ETHEREUM_IRMs.map(irm => {
        return {
          target: ETHEREUM_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", ethereum.GUARDIAN],
          dstChainId: LzChainId.ethereum,
        };
      }),

      ...OPBNBMAINNET_IRMs.map(irm => {
        return {
          target: OPBNBMAINNET_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbmainnet.GUARDIAN],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip357;
