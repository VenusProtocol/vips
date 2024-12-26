import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const COMPTROLLER_ETHENA = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";

export const PT_USDe_27MAR2025 = "0x8A47b431A7D947c6a3ED6E42d501803615a97EAa";
export const PT_sUSDE_27MAR2025 = "0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDe = "0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
export const VTOKEN_RECEIVER = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";

export const VPT_USDe_27MAR2025_ETHENA = "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B";
export const VPT_sUSDE_27MAR2025_ETHENA = "0xCca202a95E8096315E3F19E46e19E1b326634889";

const sUSDE_ERC4626ORACLE = "0x67841858BCCA8dF50B962d6A314722a6AEC0970e";
const PendleOracle_PT_USDe_27MAR2025 = "0x721C02F98bE5ef916F6574E53700a25473742093";
const PendleOracle_PT_sUSDe_27MAR2025 = "0x17B49f36878c401C1fE4D7Bf6D9CeBAAFBf4edE2";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";

const REDSTONE_USDe_FEED = "0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58";
const CHAINLINK_USDe_FEED = "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

export const vip407 = () => {
  const meta = {
    version: "v2",
    title: "VIP-407 [Ethereum] New Ethena pool",
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
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[USDe, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, REDSTONE_USDe_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, CHAINLINK_USDe_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDe, [ethereum.REDSTONE_ORACLE, ethereum.CHAINLINK_ORACLE, ethereum.CHAINLINK_ORACLE], [true, true, true]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sUSDe,
            [sUSDE_ERC4626ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PT_USDe_27MAR2025,
            [PendleOracle_PT_USDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PT_sUSDE_27MAR2025,
            [PendleOracle_PT_sUSDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setPriceOracle(address)",
        params: [ethereum.RESILIENT_ORACLE],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Ethena", COMPTROLLER_ETHENA, parseUnits("0.5", 18), parseUnits("1.04", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [PT_USDe_27MAR2025, parseUnits("10619.584104736976014893", 18), ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, parseUnits("10619.584104736976014893", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_USDe_27MAR2025_ETHENA,
            parseUnits("0.86", 18),
            parseUnits("0.88", 18),
            parseUnits("10619.584104736976014893", 18),
            VTOKEN_RECEIVER,
            parseUnits("850000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [PT_sUSDE_27MAR2025, parseUnits("10653.072723772024710328", 18), ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, parseUnits("10653.072723772024710328", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_sUSDE_27MAR2025_ETHENA,
            parseUnits("0.85", 18),
            parseUnits("0.87", 18),
            parseUnits("10653.072723772024710328", 18),
            VTOKEN_RECEIVER,
            parseUnits("12000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VPT_USDe_27MAR2025_ETHENA, VPT_sUSDE_27MAR2025_ETHENA], [2, 2], true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip407;
