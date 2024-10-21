import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ARBITRUM_SEPOLIA_CORE_COMPTROLLER = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const ARBITRUM_SEPOLIA_vUSDC = "0xd9d1e754464eFc7493B177d2c7be04816E089b4C";
export const SEPOLIA_CORE_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const SEPOLIA_vUSDC = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const OPBNBTESTNET_CORE_COMPTROLLER = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
export const OPBNBTESTNET_vUSDT = "0xe3923805f6E117E51f5387421240a86EF1570abC";
export const CF = parseUnits("0.8", 18);
export const LT = parseUnits("0.8", 18);

const vip386 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_SEPOLIA_CORE_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ARBITRUM_SEPOLIA_vUSDC, CF, LT],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_CORE_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [SEPOLIA_vUSDC, CF, LT],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_CORE_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [OPBNBTESTNET_vUSDT, CF, LT],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip386;