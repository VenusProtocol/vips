import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const COMPTROLLER_ETHENA = "0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c";

const MockPT_USDe_27MAR2025 = "0x74671106a04496199994787B6BcB064d08afbCCf";
const MockPT_sUSDE_27MAR2025 = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
const MocksUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
const MockUSDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
export const VsUSDe_Ethena = "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC";
export const VUSDC_Ethena = "0x466fe60aE3d8520e49D67e3483626786Ba0E6416";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";

export const underlyingAddress = [MockPT_USDe_27MAR2025, MockPT_sUSDE_27MAR2025, MocksUSDe, MockUSDC];

export const vip412 = () => {
  const meta = {
    version: "v2",
    title: "VIP-412 [Sepolia] New Ethena pool (Part-II)",
    description: `#### Summary`,
    forDescription: "Process to configure and launch the new pool",
    againstDescription: "Defer configuration and launch of the new pool",
    abstainDescription: "No opinion on the matter",
  };
  return makeProposal(
    [
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MocksUSDe, parseUnits("10000", 18), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MocksUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MocksUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VsUSDe_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_Ethena,
            parseUnits("0.9", 18),
            parseUnits("0.92", 18),
            parseUnits("10000", 18),
            sepolia.VTREASURY,
            parseUnits("50000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MockUSDC, parseUnits("10000", 6), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockUSDC,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockUSDC,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10000", 6)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VUSDC_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDC_Ethena,
            parseUnits("0", 18),
            parseUnits("0", 18),
            parseUnits("10000", 6),
            sepolia.VTREASURY,
            parseUnits("50000000", 6),
            parseUnits("46000000", 6),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VsUSDe_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.010", 18)],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: VUSDC_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.020", 18)],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VsUSDe_Ethena], [2], true],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};

export default vip412;
