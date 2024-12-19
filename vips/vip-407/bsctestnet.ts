import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const COMPTROLLER_ETHENA = "0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c";

export const MockPT_USDe_27MAR2025 = "0x74671106a04496199994787B6BcB064d08afbCCf";
export const MockPT_sUSDE_27MAR2025 = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
export const MocksUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
export const MockUSDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const MockUSDe = "0x8bAe3E12870a002A0D4b6Eb0F0CBf91b29d9806F";

export const VPT_USDe_27MAR2025_ETHENA = "0xf2C00a9C3314f7997721253c49276c8531a30803";
export const VPT_sUSDE_27MAR2025_ETHENA = "0x6c87587b1813eAf5571318E2139048b04eAaFf97";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";

const sUSDE_ERC4626ORACLE = "0xeD4E76bAbA330287Ca2D8d5857da6703bc653621";
const MockPendleOracle_PT_USDe_27MAR2025 = "0x063a57223EE477d7CB959bc7328d3A06494931A9";
const MockPendleOracle_PT_sUSDe_27MAR2025 = "0x981217A0bb898752543D54cE782DAfb7427b9B54";
const PendleOracle_PT_USDe_27MAR2025 = "0xFad31F9f22ED81F4aa998A12B51ED9f2169C7D3E";
const PendleOracle_PT_sUSDe_27MAR2025 = "0x6123151E67922a197DdF9e7F73c8a28A0664fCd5";
const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";

const CHAINLINK_USDe_FEED = "0x55ec7c3ed0d7CB5DF4d3d8bfEd2ecaf28b4638fb";

export const EXCHANGE_RATE = parseUnits("1.1", 18);
const TWAP_DURATION = 1800;
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";

export const vip407 = () => {
  const meta = {
    version: "v2",
    title: "VIP-407 [Sepolia] New Ethena pool",
    description: `#### Summary`,
    forDescription: "Process to configure and launch the new pool",
    againstDescription: "Defer configuration and launch of the new pool",
    abstainDescription: "No opinion on the matter",
  };
  return makeProposal(
    [
      {
        target: COMPTROLLER_ETHENA,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[MockUSDe, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [MockUSDe, parseUnits("1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[MockUSDe, CHAINLINK_USDe_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [MockUSDe, [sepolia.REDSTONE_ORACLE, sepolia.CHAINLINK_ORACLE, sepolia.CHAINLINK_ORACLE], [true, true, true]],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            MocksUSDe,
            [sUSDE_ERC4626ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: MockPendleOracle_PT_USDe_27MAR2025,
        signature: "setPtToAssetRate(address,uint32,uint256)",
        params: [ADDRESS_ONE, TWAP_DURATION, EXCHANGE_RATE],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            MockPT_USDe_27MAR2025,
            [PendleOracle_PT_USDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockPendleOracle_PT_sUSDe_27MAR2025,
        signature: "setPtToAssetRate(address,uint32,uint256)",
        params: [ADDRESS_ONE, TWAP_DURATION, EXCHANGE_RATE],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            MockPT_sUSDE_27MAR2025,
            [PendleOracle_PT_sUSDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setPriceOracle(address)",
        params: [sepolia.RESILIENT_ORACLE],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Ethena", COMPTROLLER_ETHENA, parseUnits("0.5", 18), parseUnits("1.04", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MockPT_USDe_27MAR2025, parseUnits("10619.584104736976014893", 18), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockPT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockPT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10619.584104736976014893", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_USDe_27MAR2025_ETHENA,
            parseUnits("0.86", 18),
            parseUnits("0.88", 18),
            parseUnits("10619.584104736976014893", 18),
            sepolia.VTREASURY,
            parseUnits("850000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MockPT_sUSDE_27MAR2025, parseUnits("10653.072723772024710328", 18), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockPT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockPT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10653.072723772024710328", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_sUSDE_27MAR2025_ETHENA,
            parseUnits("0.85", 18),
            parseUnits("0.87", 18),
            parseUnits("10653.072723772024710328", 18),
            sepolia.VTREASURY,
            parseUnits("12000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VPT_USDe_27MAR2025_ETHENA, VPT_sUSDE_27MAR2025_ETHENA], [2, 2], true],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setPrimeToken(address)",
        params: [PRIME],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip407;
