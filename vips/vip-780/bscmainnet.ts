import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import arbitrumoneData from "../../simulations/vip-780/utils/marketData_arbitrumone.json";
import bscMainnetData from "../../simulations/vip-780/utils/marketData_bscmainnet.json";
import ethereumData from "../../simulations/vip-780/utils/marketData_ethereum.json";

interface Market {
  name: string;
  address: string;
  isMintActionPaused: boolean;
  isBorrowActionPaused: boolean;
  supplyCap: string;
  borrowCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  rewardSpeeds?: {
    [distributorAddress: string]: {
      supplySpeed: string;
      borrowSpeed: string;
    };
  };
}

interface RewardDistributor {
  address: string;
  rewardToken: string;
  balance: string;
  marketsWithNonZeroSpeeds?: string[];
}

interface Pool {
  name: string;
  comptroller: string;
  rewardDistributor: RewardDistributor[];
  markets: Market[];
}

interface NetworkData {
  pools: Pool[];
}

export const ADDRESS_DATA = {
  bscmainnet: bscMainnetData as NetworkData,
  ethereum: ethereumData as NetworkData,
  arbitrumone: arbitrumoneData as NetworkData,
};

export const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

// Helper function to generate commands for setting reward token speeds to zero
const generateSetRewardSpeedsToZeroCommands = (rewardDistributors: RewardDistributor[], dstChainId?: LzChainId) => {
  const commands = [];

  for (const distributor of rewardDistributors) {
    // Skip if no markets have non-zero speeds for this distributor
    if (!distributor.marketsWithNonZeroSpeeds || distributor.marketsWithNonZeroSpeeds.length === 0) {
      continue;
    }

    // Only set speeds to zero for markets that currently have non-zero speeds
    const marketAddresses = distributor.marketsWithNonZeroSpeeds;
    const supplySpeeds = marketAddresses.map(() => 0);
    const borrowSpeeds = marketAddresses.map(() => 0);

    commands.push({
      target: distributor.address,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [marketAddresses, supplySpeeds, borrowSpeeds],
      ...(dstChainId && { dstChainId }),
    });
  }

  return commands;
};

// Helper function to generate deprecation commands for a pool
const generatePoolDeprecationCommands = (comptroller: string, markets: Market[], dstChainId?: LzChainId) => {
  const commands = [];

  // Filter markets that need MINT paused (only those not already paused)
  const marketsNeedingMintPause = markets.filter(m => !m.isMintActionPaused);
  if (marketsNeedingMintPause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [marketsNeedingMintPause.map(m => m.address), [Actions.MINT], true],
      ...(dstChainId && { dstChainId }),
    });
  }

  // Filter markets that need BORROW paused (only those not already paused)
  const marketsNeedingBorrowPause = markets.filter(m => !m.isBorrowActionPaused);
  if (marketsNeedingBorrowPause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [marketsNeedingBorrowPause.map(m => m.address), [Actions.BORROW], true],
      ...(dstChainId && { dstChainId }),
    });
  }

  // Filter markets that need supply cap set to 0 (skip if already 0)
  const marketsNeedingSupplyCapZero = markets.filter(m => m.supplyCap !== "0");
  if (marketsNeedingSupplyCapZero.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [marketsNeedingSupplyCapZero.map(m => m.address), marketsNeedingSupplyCapZero.map(() => 0)],
      ...(dstChainId && { dstChainId }),
    });
  }

  // Filter markets that need borrow cap set to 0 (skip if already 0)
  const marketsNeedingBorrowCapZero = markets.filter(m => m.borrowCap !== "0");
  if (marketsNeedingBorrowCapZero.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [marketsNeedingBorrowCapZero.map(m => m.address), marketsNeedingBorrowCapZero.map(() => 0)],
      ...(dstChainId && { dstChainId }),
    });
  }

  // Filter markets that need collateral factor set to 0 (skip if already 0)
  const marketsNeedingCFZero = markets.filter(m => m.collateralFactor !== "0");
  for (const market of marketsNeedingCFZero) {
    commands.push({
      target: comptroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [market.address, 0, market.liquidationThreshold],
      ...(dstChainId && { dstChainId }),
    });
  }

  return commands;
};

export const vip780 = () => {
  const meta = {
    version: "v2",
    title: "VIP-780 Deprecate Isolated Pools on BNB Chain, Ethereum, and Arbitrum One",
    description: `#### Summary

If passed, this VIP will deprecate isolated pools across multiple networks as part of the Isolated Lending (IL) deprecation flow.

#### Description

This VIP will perform the following actions for each market in the specified isolated pools:

**BNB Chain:**
- **DeFi Pool**: 4 markets (vBSW, vANKR, vUSDT, vTWT)
- **GameFi Pool**: 3 markets (vUSDT, vFLOKI, vRACA)
- **LiquidStakedBNB Pool**: 5 markets (vasBNB, vankrBNB, vslisBNB, vWBNB, vBNBx)

**Ethereum:**
- **LiquidStakedETH Pool**: 6 markets (vezETH, vwstETH, vweETH, vWETH, vPufETH, vweETHs)

**Arbitrum One:**
- **LiquidStakedETH Pool**: 3 markets (vWETH, vweETH, vwstETH)

**Total: 21 markets across 3 networks**

For each market, the VIP will:
1. Pause Mint and Borrow actions
2. Set supply and borrow caps to 0
3. Set collateral factor to 0 (liquidation thresholds will remain unchanged to protect existing positions)

Additionally, for each pool:
4. Set reward token supply and borrow speeds to 0 for all markets in the RewardsDistributor contracts

These actions will effectively deprecate the markets while allowing users to:
- Repay their borrows
- Withdraw their supplied assets
- Liquidate unhealthy positions (liquidation threshold unchanged)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the markets are properly deprecated with the correct parameters
- **Deployment on testnet**: the same deprecation flow has been tested on testnet

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  const commands = [];

  // Generate commands for BNB Chain Isolated Pools
  for (const pool of ADDRESS_DATA.bscmainnet.pools) {
    commands.push(...generatePoolDeprecationCommands(pool.comptroller, pool.markets));
    commands.push(...generateSetRewardSpeedsToZeroCommands(pool.rewardDistributor));
  }

  // Generate commands for Ethereum Isolated Pools
  for (const pool of ADDRESS_DATA.ethereum.pools) {
    commands.push(...generatePoolDeprecationCommands(pool.comptroller, pool.markets, LzChainId.ethereum));
    commands.push(...generateSetRewardSpeedsToZeroCommands(pool.rewardDistributor, LzChainId.ethereum));
  }

  // Generate commands for Arbitrum One Isolated Pools
  for (const pool of ADDRESS_DATA.arbitrumone.pools) {
    commands.push(...generatePoolDeprecationCommands(pool.comptroller, pool.markets, LzChainId.arbitrumone));
    commands.push(...generateSetRewardSpeedsToZeroCommands(pool.rewardDistributor, LzChainId.arbitrumone));
  }

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip780;
