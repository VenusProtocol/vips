import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["sepolia"];

export const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const sUSDS_ERC4626_ORACLE = "0x386C41A4Ff2e4da2C5CC6B1A13fD34A98B48C51d";
export const USDS = "0xfB287f9A45E54df6AADad95C6F37b1471e744762";
export const sUSDS = "0xE9E34fd81982438E96Bd945f5810F910e35F0165";
export const vUSDS = "0x459C6a6036e2094d1764a9ca32939b9820b2C8e0";
export const vsUSDS = "0x083a24648614df4b72EFD4e4C81141C044dBB253";

export const FIXED_STABLECOIN_PRICE = parseUnits("1.1", 18);

const vip440 = () => {
  const meta = {
    version: "v2",
    title: "Configure USDS & sUSDS markets on sepolia - Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDS, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDS, [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sUSDS,
            [sUSDS_ERC4626_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      // USDS Market
      {
        target: vUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vUSDS,
            parseUnits("0.73", 18),
            parseUnits("0.75", 18),
            parseUnits("10000", 18),
            VTREASURY,
            parseUnits("65000000", 18),
            parseUnits("7680000", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },

      // // VSUSDS market
      {
        target: vsUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vsUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vsUSDS,
            parseUnits("0.73", 18),
            parseUnits("0.75", 18),
            parseUnits("10000", 18),
            VTREASURY,
            parseUnits("30000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vsUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vsUSDS], [2], true],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip440;
