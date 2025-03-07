import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet, zksyncmainnet } = NETWORK_ADDRESSES;

const REDSTONE_UNI_FEED = "0xf1454949C6dEdfb500ae63Aa6c784Aa1Dde08A6c";
const STALE_PERIOD_26H = 26 * 60 * 60; // heartbeat of 24H

export const ZKETH_COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const ZKETH_ORACLE = "0x540aA1683E5E5592E0444499bDA41f6DF8de2Dd8";
export const UNI_COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const tokens = {
  WETH: {
    address: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    decimals: 18,
    symbol: "WETH",
  },
  zkETH: {
    address: "0xb72207E1FB50f341415999732A20B6D25d8127aa",
    decimals: 18,
    symbol: "zkETH",
  },
  UNI: {
    address: "0x8f187aA05619a017077f5308904739877ce9eA21",
    decimals: 18,
    symbol: "UNI",
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const newMarkets = {
  zkETH: {
    vToken: {
      address: "0xCEb7Da150d16aCE58F090754feF2775C23C8b631",
      name: "Venus zkETH (Core)",
      symbol: "vzkETH_Core",
      underlying: tokens["zkETH"],
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: ZKETH_COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.7", 18),
      liquidationThreshold: parseUnits("0.75", 18),
      supplyCap: parseUnits("650", 18),
      borrowCap: BigNumber.from("0"),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("3.734", 18),
      vTokensToBurn: parseUnits("0.0037", 8), // Approximately $10
      vTokenReceiver: "0x3d97E13A1D2bb4C9cE9EA9d424D83d3638F052ad",
    },
    interestRateModel: {
      address: "0x6e0f830e7fc78a296B0EbD5694573C2D9f0994B1",
      base: "0",
      multiplier: "0.0875",
      jump: "0.8",
      kink: "0.8",
    },
  },
  UNI: {
    vToken: {
      address: "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2",
      name: "Venus UNI (Core)",
      symbol: "vUNI_Core",
      underlying: tokens["UNI"],
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: UNI_COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: BigNumber.from("0"),
      liquidationThreshold: BigNumber.from("0"),
      supplyCap: parseUnits("20000", 18),
      borrowCap: BigNumber.from("0"),
      reserveFactor: parseUnits("0.25", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("529.463427983309919376", 18),
      vTokensToBurn: parseUnits("1", 8), // Approximately $10
      vTokenReceiver: unichainmainnet.VTREASURY,
    },
    interestRateModel: {
      address: "0x6379613ceE9f40E187971c9917fdf33ba5386CAb",
      base: "0",
      multiplier: "0.15",
      jump: "3",
      kink: "0.3",
    },
  },
};

const vip464 = () => {
  const meta = {
    version: "v2",
    title: "VIP-464 [ZKsync][Unichain] New zkETH and UNI markets in the Core pools",
    description: `#### Summary

If passed, this VIP will add the following markets:

- [zkETH](https://explorer.zksync.io/address/0xb72207E1FB50f341415999732A20B6D25d8127aa) to the Core pool on ZKsync Era, following the Community proposal “[Proposal: List Dinero’s zkETH on Venus zkSync](https://community.venus.io/t/proposal-list-dineros-zketh-on-venus-zksync/4830)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xb431710c5777c5a2b8eeba8e4e1d03e0ae2732918fc0005fbd6203d7dabd975f).
- [UNI](https://uniscan.xyz/token/0x8f187aa05619a017077f5308904739877ce9ea21) to the Core pool on Unichain, following the Community proposal “[Proposal: List UNI on Unichain](https://community.venus.io/t/proposal-list-uni-on-unichain/4951)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x18b3c52ba003d4e9c91011ad35df69f9adab6283c5084433392aaba8b01cfe44)

Moreover, it will transfer 5,000 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca), to refund [the provided bootstrap liquidity](https://uniscan.xyz/tx/0x3ee89b3b17f85da9d8bcf5c8bae3686c53665f7b0d56aca6bd4d51a504a3fd02) for the UNI market.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-list-dineros-zketh-on-venus-zksync/4830/7), the risk parameters for the new zkETH market are:

Underlying token: [zkETH](https://explorer.zksync.io/address/0xb72207E1FB50f341415999732A20B6D25d8127aa)

- Borrow cap: 0 zkETH
- Supply cap: 650 zkETH
- Collateral factor: 70%
- Liquidation threshold: 75%
- Reserve factor: 10%

Bootstrap liquidity: 3.734 zkETH, provided by the [Dinero.xyz project](https://explorer.zksync.io/address/0x3d97E13A1D2bb4C9cE9EA9d424D83d3638F052ad)

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 8.75%
- jump multiplier (yearly): 80%

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-list-uni-on-unichain/4951/3), the risk parameters for the new UNI market are:

Underlying token: [UNI](https://uniscan.xyz/token/0x8f187aa05619a017077f5308904739877ce9ea21)

- Borrow cap: 0 UNI
- Supply cap: 20,000 UNI
- Collateral factor: 0%
- Liquidation threshold: 0%
- Reserve factor: 25%

Bootstrap liquidity: 5,29.46 UNI, provided by the market supporter [Venus Treasury](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B)

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 30%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [ZKsync Era](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182) is used for zkETH, using under the hood the [new ZkETHOracle](https://github.com/VenusProtocol/oracle/pull/269) for the MAIN oracle.

- CORRELATED_TOKEN: [zkETH](https://explorer.zksync.io/address/0xb72207E1FB50f341415999732A20B6D25d8127aa)
- UNDERLYING_TOKEN: [WETH](https://explorer.zksync.io/address/0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91) (assuming 1 rzkETH is equal to 1 ETH)

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Unichain](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E) is used for UNI, using under the hood the [RedStone price feed](https://unichain.blockscout.com/address/0xf1454949C6dEdfb500ae63Aa6c784Aa1Dde08A6c) for the MAIN oracle.

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the ZkETHOracle
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on ZKsync Era and Unichain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to ZKsync Sepolia and Unichain Sepolia, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report of ZkETHOracle (2025/February/25)](https://github.com/VenusProtocol/oracle/blob/420a6d3a42d1d2dd8c12f0eb917bf2f1d9359c77/audits/124_oracles_certik_20250225.pdf)
- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) (2024/August/23)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

**Deployed contracts**

- ZKsync Era:
    - Mainnet vzkETH_Core: [0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2](https://uniscan.xyz/address/0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2)
    - Sepolia vzkETH_Core: [0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642](https://sepolia.uniscan.xyz/address/0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642)
- Unichain:
    - Mainnet vUNI_Core: [0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2](https://uniscan.xyz/address/0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2)
    - Sepolia vUNI_Core: [0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642](https://sepolia.uniscan.xyz/address/0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/510)
- [ZkETHOracle source code](https://github.com/VenusProtocol/oracle/pull/269)
- [Deployment of zkETH to ZKsync Sepolia](https://sepolia.explorer.zksync.io/tx/0xefd8e081808f5ff4e7174871300d936d2e60f372d7e270912f016b609c488a81)
- [Deployment of UNI to Unichain sepolia](https://sepolia.uniscan.xyz/tx/0x0665700f1e833058e4384b30ee5212ba30914ffc29a60571bd59830e6907968e)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: zksyncmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["zkETH"].address,
            [ZKETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tokens["UNI"].address, REDSTONE_UNI_FEED, STALE_PERIOD_26H]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["UNI"].address,
            [unichainmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // Market
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          newMarkets["zkETH"].vToken.underlying.address,
          newMarkets["zkETH"].initialSupply.amount,
          zksyncmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncmainnet.POOL_REGISTRY, newMarkets["zkETH"].initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarkets["zkETH"].vToken.address,
            newMarkets["zkETH"].riskParameters.collateralFactor,
            newMarkets["zkETH"].riskParameters.liquidationThreshold,
            newMarkets["zkETH"].initialSupply.amount,
            zksyncmainnet.NORMAL_TIMELOCK,
            newMarkets["zkETH"].riskParameters.supplyCap,
            newMarkets["zkETH"].riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [zksyncmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarkets["zkETH"].initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          newMarkets["zkETH"].initialSupply.amount,
          newMarkets["zkETH"].vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(newMarkets["zkETH"].initialSupply.vTokensToBurn);
        return {
          target: newMarkets["zkETH"].vToken.address,
          signature: "transfer(address,uint256)",
          params: [newMarkets["zkETH"].initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncmainnet,
        };
      })(),
      {
        target: newMarkets["zkETH"].vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarkets["zkETH"].riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKETH_COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["zkETH"].vToken.address], [2], true],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: newMarkets["UNI"].vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          newMarkets["UNI"].vToken.underlying.address,
          newMarkets["UNI"].initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, newMarkets["UNI"].initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarkets["UNI"].vToken.address,
            0, // CF
            0, // LT
            newMarkets["UNI"].initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK,
            parseUnits("20000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: newMarkets["UNI"].vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, newMarkets["UNI"].initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          newMarkets["UNI"].initialSupply.amount,
          newMarkets["UNI"].vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(newMarkets["UNI"].initialSupply.vTokensToBurn);
        return {
          target: newMarkets["UNI"].vToken.address,
          signature: "transfer(address,uint256)",
          params: [unichainmainnet.VTREASURY, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),
      {
        target: newMarkets["UNI"].vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarkets["UNI"].riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: UNI_COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["UNI"].vToken.address], [2], true],
        dstChainId: LzChainId.unichainmainnet,
      },

      // Refund 5000 USDT to Vanguard Treasury
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), VANGUARD_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip464;
