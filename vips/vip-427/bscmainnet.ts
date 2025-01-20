import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours
export const USDM_CHAINLINK_FEED = "0x6Ab6c24f9312a6cB458761143D373A8f11573C4B";
export const WUSDM_ERC4626_ORACLE = "0x7Fb95a0B7b933A9F3Fe3Ead4b69B0267BD8Fe55F";

export const tokens = {
  USDM: {
    address: "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31",
    decimals: 18,
    symbol: "USDM",
  },
  wUSDM: {
    address: "0xA900cbE7739c96D2B153a273953620A701d5442b",
    decimals: 18,
    symbol: "wUSDM",
  },
};

export const newMarket = {
  vToken: {
    address: "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c",
    name: "Venus wUSDM (Core)",
    symbol: "vwUSDM_Core",
    underlying: tokens["wUSDM"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("5000000", 18),
    borrowCap: parseUnits("4000000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 18),
    vTokenReceiver: "0xFfCf33Ed3fc6B7eC7d4F6166cC1B86d4F42Af192",
  },
  interestRateModel: {
    address: "0x40a0DEC6AcA207F45212B14dE1312cEae6FB3E5A",
    base: "0",
    multiplier: "0.06875",
    jump: "2.5",
    kink: "0.8",
  },
};

const vip427 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "[zkSync] Add wUSDM market",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tokens["USDM"].address, USDM_CHAINLINK_FEED, chainlinkStalePeriod]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["USDM"].address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["wUSDM"].address,
            [WUSDM_ERC4626_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Market
      {
        target: newMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["28800"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [newMarket.riskParameters.reserveFactor],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [newMarket.vToken.underlying.address, newMarket.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarket.vToken.address,
            newMarket.riskParameters.collateralFactor,
            newMarket.riskParameters.liquidationThreshold,
            newMarket.initialSupply.amount,
            newMarket.initialSupply.vTokenReceiver,
            newMarket.riskParameters.supplyCap,
            newMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip427;
