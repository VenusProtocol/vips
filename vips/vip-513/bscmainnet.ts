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
    vTokensToBurn: parseUnits("102.84258", 8), // 100%
  },
};

export const vip513 = async () => {
  const meta = {
    version: "v2",
    title: "VIP-513 [Unichain] Add WBTC and USD₮0 markets to the Core pool",
    description: `#### Summary

If passed, this VIP will add markets for [WBTC](https://uniscan.xyz/address/0x0555e30da8f98308edb960aa94c0db47230d2b9c) and [USD₮0](https://uniscan.xyz/token/0x9151434b16b9763660705744891fa906f660ecc5) to the Core pool on Unichain, following the Community proposals:

- [Proposal: Add support for WBTC to the Venus Core Pool on Unichain](https://community.venus.io/t/proposal-add-support-for-wbtc-to-the-venus-core-pool-on-unichain/5134) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x858565d6f4fa73652f26796e9d7fc00750f2029ea6e094ed47f24708b23a585c))
- [[UNICHAIN] Add Support for USD₮0 Market on Venus Core Pool](https://community.venus.io/t/unichain-add-support-for-usd-0-market-on-venus-core-pool/5104) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xc0aa772f95bddaa21743ad49bf8a0345af2089c12eb6a504457d23e133f58823))

#### Description

#### Risk parameters for WBTC

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-add-support-for-wbtc-to-the-venus-core-pool-on-unichain/5134/4), the risk parameters for the new market are:

Underlying token: [WBTC](https://uniscan.xyz/address/0x0555e30da8f98308edb960aa94c0db47230d2b9c)

- Borrow cap: 40 WBTC
- Supply cap: 400 WBTC
- Collateral factor: 77%
- Liquidation threshold: 80%
- Reserve factor: 20%

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 200%

**Oracles configuration for WBTC**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Unichain](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E) is used for WBTC, using [price feed provided by RedStone](https://uniscan.xyz/address/0xc44be6D00307c3565FDf753e852Fc003036cBc13) for the MAIN oracle.

#### Risk parameters for USD₮0

Following [Chaos Labs recommendations](https://community.venus.io/t/unichain-add-support-for-usd-0-market-on-venus-core-pool/5104/5), the risk parameters for the new market are:

Underlying token: [USD₮0](https://uniscan.xyz/token/0x9151434b16b9763660705744891fa906f660ecc5)

- Borrow cap: 45M USD₮0
- Supply cap: 50M USD₮0
- Collateral factor: 77%
- Liquidation threshold: 80%
- Reserve factor: 10%

Interest rate curve for the new market:

- Kink 1: 80%
- Base: 0%
- Multiplier: 10%
- Kink 2: 90%
- Multiplier 2: 70%
- Jump Multiplier: 80%

**Oracles configuration for USD₮0**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Unichain](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E) is used for USD₮0, using [price feed provided by RedStone](https://uniscan.xyz/address/0x58fa68A373956285dDfb340EDf755246f8DfCA16) for the MAIN oracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on Unichain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Unichain mainnet:

- vWBTC_Core: [0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5](https://uniscan.xyz/address/0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5)
- vUSD₮0_Core: [0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD](https://uniscan.xyz/address/0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD)

Unichain Sepolia testnet:

- vWBTC_Core: [0x3aaa754E66fcACd84b01Ae5493c922AF8D4E77c7](https://sepolia.uniscan.xyz/address/0x3aaa754E66fcACd84b01Ae5493c922AF8D4E77c7)
- vUSD₮0_Core: [0x02A5E844C4B0FF5a587B4EE239BEe7c479530447](https://sepolia.uniscan.xyz/address/0x02A5E844C4B0FF5a587B4EE239BEe7c479530447)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/570)
- Deployment of WBTC and USD₮0 to Unichain Sepolia testnet
- [Documentation](https://docs-v4.venus.io/)`,
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

export default vip513;
