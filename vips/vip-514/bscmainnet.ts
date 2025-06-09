import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const WBTC_REDSTONE_FEED = "0xc44be6D00307c3565FDf753e852Fc003036cBc13";
export const USDTO_REDSTONE_FEED = "0x58fa68A373956285dDfb340EDf755246f8DfCA16";
export const WBTC_MAX_STALE_PERIOD = 7 * 60 * 60; // 7 hours in seconds
export const USDTO_MAX_STALE_PERIOD = 4 * 60 * 60; // 4 hours in seconds

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const WBTC: Token = {
  address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  decimals: 8,
  symbol: "WBTC",
};

export const USDTO: Token = {
  address: "0x9151434b16b9763660705744891fA906F660EcC5",
  decimals: 6,
  symbol: "USD₮0",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokensToBurn: BigNumber;
  };
};

export const WBTCMarket: Market = {
  vToken: {
    address: "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5",
    name: "Venus WBTC (Core)",
    symbol: "vWBTC_Core",
    underlying: WBTC,
    decimals: 8,
    exchangeRate: parseUnits("1", 18),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.77", 18),
    liquidationThreshold: parseUnits("0.8", 18),
    supplyCap: parseUnits("400", 8),
    borrowCap: parseUnits("40", 8),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.00100364", 8),
    vTokensToBurn: parseUnits("0.00100364", 8), // 100%
  },
};

export const USDTOMarket: Market = {
  vToken: {
    address: "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD",
    name: "Venus USD₮0 (Core)",
    symbol: "vUSD₮0_Core",
    underlying: USDTO,
    decimals: 8,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.77", 18),
    liquidationThreshold: parseUnits("0.8", 18),
    supplyCap: parseUnits("50000000", 6),
    borrowCap: parseUnits("45000000", 6),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("102.84258", 6),
    vTokensToBurn: parseUnits("102.84258", 6), // 100%
  },
};

export const vip514 = async () => {
  const meta = {
    version: "v2",
    title: "VIP-514 [Unichain] add WBTC and USDTO markets to the Core pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // oracle config
      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          [
            [WBTC.address, WBTC_REDSTONE_FEED, WBTC_MAX_STALE_PERIOD],
            [USDTO.address, USDTO_REDSTONE_FEED, USDTO_MAX_STALE_PERIOD],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // WBTC config
            [
              WBTC.address,
              [unichainmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            // USDTO config
            [
              USDTO.address,
              [unichainmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // <--- WBTC Market --->
      // Market configurations
      {
        target: WBTCMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          WBTCMarket.vToken.underlying.address,
          WBTCMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WBTC.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WBTC.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, WBTCMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            WBTCMarket.vToken.address,
            WBTCMarket.riskParameters.collateralFactor, // CF
            WBTCMarket.riskParameters.liquidationThreshold, // LT
            WBTCMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            WBTCMarket.riskParameters.supplyCap, // supply cap
            WBTCMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WBTCMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, WBTCMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },

      // <--- USDTO Market --->
      // Market configurations
      {
        target: USDTOMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          USDTOMarket.vToken.underlying.address,
          USDTOMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: USDTO.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: USDTO.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, USDTOMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            USDTOMarket.vToken.address,
            USDTOMarket.riskParameters.collateralFactor, // CF
            USDTOMarket.riskParameters.liquidationThreshold, // LT
            USDTOMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            USDTOMarket.riskParameters.supplyCap, // supply cap
            USDTOMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: USDTOMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, USDTOMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip514;
