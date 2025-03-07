import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";

export const UNI = "0x873A6C4B1e3D883920541a0C61Dc4dcb772140b3";

export const VUNI_CORE = "0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642";

export const UNI_INITIAL_SUPPLY = parseUnits("529.463427983309919376", 18);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vip464 = () => {
  const meta = {
    version: "v2",
    title: "[Unichain sepolia] New UNI market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // oracle config
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [UNI, parseUnits("10", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            UNI,
            [unichainsepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },

      // Market configurations
      {
        target: VUNI_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNI,
        signature: "faucet(uint256)",
        params: [UNI_INITIAL_SUPPLY],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [unichainsepolia.POOL_REGISTRY, UNI_INITIAL_SUPPLY],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: unichainsepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUNI_CORE,
            0, // CF
            0, // LT
            UNI_INITIAL_SUPPLY, // initial supply
            unichainsepolia.NORMAL_TIMELOCK,
            parseUnits("20000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: VUNI_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("1", 8)], // around $10
        dstChainId: LzChainId.unichainsepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(UNI_INITIAL_SUPPLY, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("1", 8));
        return {
          target: VUNI_CORE,
          signature: "transfer(address,uint256)",
          params: [unichainsepolia.VTREASURY, vTokensRemaining],
          dstChainId: LzChainId.unichainsepolia,
        };
      })(),
      {
        target: VUNI_CORE,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VUNI_CORE], [2], true],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip464;
