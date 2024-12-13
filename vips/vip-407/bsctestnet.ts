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
export const MocksUSDe = "0xD28894b4A8AB53Ce55965AfD330b55C2DbB3E07D";
export const MockUSDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const MockUSDe = "0x8bAe3E12870a002A0D4b6Eb0F0CBf91b29d9806F";

export const VPT_USDe_27MAR2025_ETHENA = "0x11B3a14D9F4182b841bBb48637B26ecCC527A30c";
export const VPT_sUSDE_27MAR2025_ETHENA = "0x4975ECc52179b49ECE4B8328601572f07a1fC51D";
export const VsUSDe_Ethena = "0xb17abC45289EE8075447853D4E443f1E7e36fF99";
export const VUSDC_Ethena = "0xf3c213775e0592108350Bd0A1864d7e581fBd3a0";

const ERC4626ORACLE = "0x4EeA919A68db78572f5B2bb69815D325923AE5AD";
const MockPendleOracle_PT_USDe_27MAR2025 = "0x063a57223EE477d7CB959bc7328d3A06494931A9";
const MockPendleOracle_PT_sUSDe_27MAR2025 = "0x981217A0bb898752543D54cE782DAfb7427b9B54";
const PendleOracle_PT_USDe_27MAR2025 = "0xFad31F9f22ED81F4aa998A12B51ED9f2169C7D3E";
const PendleOracle_PT_sUSDe_27MAR2025 = "0x6123151E67922a197DdF9e7F73c8a28A0664fCd5";
const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";

const CHAINLINK_USDe_FEED = "0x55ec7c3ed0d7CB5DF4d3d8bfEd2ecaf28b4638fb";

export const EXCHANGE_RATE = parseUnits("1", 18);
const TWAP_DURATION = 1800;
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

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
        params: [[MockPT_USDe_27MAR2025, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
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
          [
            MockPT_USDe_27MAR2025,
            [sepolia.REDSTONE_ORACLE, sepolia.CHAINLINK_ORACLE, sepolia.CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            MocksUSDe,
            [ERC4626ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: MockPendleOracle_PT_USDe_27MAR2025,
        signature: "setPtToAssetRate(address,uint32,uint256)",
        params: [VPT_USDe_27MAR2025_ETHENA, TWAP_DURATION, EXCHANGE_RATE],
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
        params: [MockPT_sUSDE_27MAR2025, TWAP_DURATION, EXCHANGE_RATE],
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
        params: ["Core", COMPTROLLER_ETHENA, parseUnits("0.5", 18), parseUnits("1.04", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MockPT_USDe_27MAR2025, parseUnits("10619", 18), sepolia.NORMAL_TIMELOCK],
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
        params: [sepolia.POOL_REGISTRY, parseUnits("10619", 18)],
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
            parseUnits("10619", 18),
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
        params: [MockPT_sUSDE_27MAR2025, parseUnits("10000", 18), sepolia.NORMAL_TIMELOCK],
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
        params: [sepolia.POOL_REGISTRY, parseUnits("10000", 18)],
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
            parseUnits("10000", 18),
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
        target: VsUSDe_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.0010", 18)],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: VUSDC_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.0020", 18)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip407;
