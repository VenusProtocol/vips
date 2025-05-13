import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;
const sUSDe_ERC4626ORACLE = "0xeD4E76bAbA330287Ca2D8d5857da6703bc653621";
const CHAINLINK_USDe_FEED = "0x55ec7c3ed0d7CB5DF4d3d8bfEd2ecaf28b4638fb";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)

export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const sUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
export const USDe = "0x8bAe3E12870a002A0D4b6Eb0F0CBf91b29d9806F";

export const VsUSDe_CORE = "0x33e4C9227b8Fca017739419119BbBA33A089D4a0";
export const VUSDe_CORE = "0x36e8955c305aa48A99e4c953C9883989a7364a42";

export const sUSDe_INITIAL_SUPPLY = parseUnits("10000", 18);
export const USDe_INITIAL_SUPPLY = parseUnits("10000", 18);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vip491 = () => {
  const meta = {
    version: "v2",
    title: "[sepolia] New sUSDe and USDe market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add sUSDe Market
      // oracle config
      {
        target: sepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDe, parseUnits("1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, CHAINLINK_USDe_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDe, [sepolia.REDSTONE_ORACLE, sepolia.CHAINLINK_ORACLE, sepolia.CHAINLINK_ORACLE], [true, true, true]],
        ],
        dstChainId: LzChainId.sepolia,
      },

      // Market configurations
      {
        target: VsUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "faucet(uint256)",
        params: [sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            sUSDe_INITIAL_SUPPLY, // initial supply
            sepolia.VTREASURY,
            parseUnits("20000000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: VsUSDe_CORE,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },
      // Add USDe Market
      // oracle config
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sUSDe,
            [sUSDe_ERC4626ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      // Market configurations
      {
        target: VUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "faucet(uint256)",
        params: [USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            USDe_INITIAL_SUPPLY, // initial supply
            sepolia.VTREASURY,
            parseUnits("30000000", 18), // supply cap
            parseUnits("25000000", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VUSDe_CORE,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip491;
