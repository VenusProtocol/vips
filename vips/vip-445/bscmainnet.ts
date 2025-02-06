import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

const yvUSDC_1_ORACLE = "0x49C6858B3ce4F3829b716fD3FafCa6Cb4Ccb7843";
const yvUSDT_1_ORACLE = "0xE113AE8D80Fb6dfB3221e0A396e297Aa42813d0A";
const yvUSDS_1_ORACLE = "0x50f97063b4097D4e81C4DD9c3278258A04DF15aA";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
  oracle: string;
  price: BigNumber;
};

export const tokens: Token[] = [
  {
    address: "0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204",
    decimals: 6,
    symbol: "yvUSDC-1",
    oracle: yvUSDC_1_ORACLE,
    price: parseUnits("1.04980005086922", 30),
  },
  {
    address: "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa",
    decimals: 6,
    symbol: "yvUSDT-1",
    oracle: yvUSDT_1_ORACLE,
    price: parseUnits("1.027182503071620", 30),
  },
  {
    address: "0x182863131F9a4630fF9E27830d945B1413e347E8",
    decimals: 18,
    symbol: "yvUSDS-1",
    oracle: yvUSDS_1_ORACLE,
    price: parseUnits("1.030409516280000868", 18),
  },
];

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
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const markets: Market[] = [
  {
    vToken: {
      address: "0xf87c0a64dc3a8622D6c63265FA29137788163879",
      name: "Venus yvUSDC-1 (Core)",
      symbol: "vyvUSDC-1_Core",
      underlying: tokens[0],
      decimals: 8,
      exchangeRate: parseUnits("1", 16),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.5", 18),
      liquidationThreshold: parseUnits("0.6", 18),
      supplyCap: parseUnits("400000", 6),
      borrowCap: parseUnits("0", 6),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("9533.021607", 6),
      vTokenReceiver: "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7",
    },
    interestRateModel: {
      address: "0x322072b84434609ff64333A125516055B5B4405F",
      base: "0",
      multiplier: "0.15625",
      jump: "2.5",
      kink: "0.8",
    },
  },
  {
    vToken: {
      address: "0x475d0C68a8CD275c15D1F01F4f291804E445F677",
      name: "Venus yvUSDT-1 (Core)",
      symbol: "vyvUSDT-1_Core",
      underlying: tokens[1],
      decimals: 8,
      exchangeRate: parseUnits("1", 16),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.5", 18),
      liquidationThreshold: parseUnits("0.6", 18),
      supplyCap: parseUnits("630000", 6),
      borrowCap: parseUnits("0", 6),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("8321.541317", 6),
      vTokenReceiver: "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7",
    },
    interestRateModel: {
      address: "0x322072b84434609ff64333A125516055B5B4405F",
      base: "0",
      multiplier: "0.15625",
      jump: "2.5",
      kink: "0.8",
    },
  },
  {
    vToken: {
      address: "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764",
      name: "Venus yvUSDS-1 (Core)",
      symbol: "vyvUSDS-1_Core",
      underlying: tokens[2],
      decimals: 8,
      exchangeRate: parseUnits("1.0000000000002461286708091704", 28),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.5", 18),
      liquidationThreshold: parseUnits("0.6", 18),
      supplyCap: parseUnits("640000", 18),
      borrowCap: parseUnits("0", 18),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("9723.178564012393153016", 18),
      vTokenReceiver: "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7",
    },
    interestRateModel: {
      address: "0x322072b84434609ff64333A125516055B5B4405F",
      base: "0",
      multiplier: "0.15625",
      jump: "2.5",
      kink: "0.8",
    },
  },
];

const vip445 = () => {
  const meta = {
    version: "v2",
    title: "VIP-445 [Ethereum] New Yearn markets in the Core pool (yvUSDC-1, yvUSDT-1, yvUSDS-1)",
    description: `#### Summary

If passed, this VIP will add the following [Yearn](https://yearn.fi/) markets to the Core pool on Ethereum, following the Community proposal “[Deploy Yearn Vaults as collateral on Venus - yvUSDC, yvUSDT, yvDAI, yvUSDS, yvWETH](https://community.venus.io/t/deploy-yearn-vaults-as-collateral-on-venus-yvusdc-yvusdt-yvdai-yvusds-yvweth/4705)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xebbc39baf07596cab6cd0e0d36ffce9976c53b1f833a33ddb3c4b663721bd565).

- [yvUSDC-1](https://etherscan.io/address/0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204)
- [yvUSDT-1](https://etherscan.io/address/0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa)
- [yvUSDS-1](https://etherscan.io/address/0x182863131F9a4630fF9E27830d945B1413e347E8)

There will be another VIP soon to add [yvWETH-1](https://etherscan.io/address/0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0) to the Core pool on Ethereum.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/deploy-yearn-vaults-as-collateral-on-venus-yvusdc-yvusdt-yvdai-yvusds-yvweth/4705/7), the risk parameters for the new market are:

Underlying token: [yvUSDC-1](https://etherscan.io/address/0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204)

- Borrow cap: 0 yvUSDC-1
- Supply cap: 400,000 yvUSDC-1
- Collateral factor: 50%
- Liquidation threshold: 60%
- Reserve factor: 10%

Underlying token: [yvUSDT-1](https://etherscan.io/address/0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa)

- Borrow cap: 0 yvUSDT-1
- Supply cap: 630,000 yvUSDT-1
- Collateral factor: 50%
- Liquidation threshold: 60%
- Reserve factor: 10%

Underlying token: [yvUSDS-1](https://etherscan.io/address/0x182863131F9a4630fF9E27830d945B1413e347E8)

- Borrow cap: 0 yvUSDS-1
- Supply cap: 640,000 yvUSDS-1
- Collateral factor: 50%
- Liquidation threshold: 60%
- Reserve factor: 10%

Bootstrap liquidity (provided by the [Yearn.fi project](https://etherscan.io/address/0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7)):

- 9,533.021607 yvUSDC-1
- 8,321.541317 yvUSDT-1
- 9,723.178564012393153016 yvUSDS-1

The interest rate curve for the new markets is not relevant because the assets are not borrowable, but these parameters will be set anyway:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 15.625%
- jump multiplier (yearly): 250%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for the new markets, using under the hood the conversion rates provided by the [ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/253).

- yvUSDC-1. Onchain conversion rate yvUSDC-1/USDC multiplied by the USDC/USD price considered by the ResilientOracle
- yvUSDT-1. Onchain conversion rate yvUSDT-1/USDT multiplied by the USDT/USD price considered by the ResilientOracle
- yvUSDS-1. Onchain conversion rate yvUSDS-1/USDS multiplied by the USDS/USD price considered by the ResilientOracle

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audit**: Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the ERC4626 Oracle.
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to Sepolia, and used in the Venus Protocol testnet deployment

**Audit reports**

- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/b6d581ddac010a8a80ba4c6fe819c756568c4a92/audits/123_erc4626Oracle_certik_20250206.pdf) (2025/02/06)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

Mainnet

- Markets:
    - vyvUSDC-1_Core: [0xf87c0a64dc3a8622D6c63265FA29137788163879](https://etherscan.io/address/0xf87c0a64dc3a8622D6c63265FA29137788163879)
    - vyvUSDT-1_Core: [0x475d0C68a8CD275c15D1F01F4f291804E445F677](https://etherscan.io/address/0x475d0C68a8CD275c15D1F01F4f291804E445F677)
    - vyvUSDS-1_Core: [0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764](https://etherscan.io/address/0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764)
- Oracles:
    - yvUSDC-1_ERC4626Oracle: [0x49C6858B3ce4F3829b716fD3FafCa6Cb4Ccb7843](https://etherscan.io/address/0x49C6858B3ce4F3829b716fD3FafCa6Cb4Ccb7843)
    - yvUSDT-1_ERC4626Oracle: [0xE113AE8D80Fb6dfB3221e0A396e297Aa42813d0A](https://etherscan.io/address/0xE113AE8D80Fb6dfB3221e0A396e297Aa42813d0A)
    - yvUSDS-1_ERC4626Oracle: [0x50f97063b4097D4e81C4DD9c3278258A04DF15aA](https://etherscan.io/address/0x50f97063b4097D4e81C4DD9c3278258A04DF15aA)

Sepolia

- Markets:
    - vyvUSDC-1_Core: [0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e](https://sepolia.etherscan.io/address/0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e)
    - vyvUSDT-1_Core: [0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10](https://sepolia.etherscan.io/address/0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10)
    - vyvUSDS-1_Core: [0x5e2fB6a1e1570eB61360E87Da44979cb932090B0](https://sepolia.etherscan.io/address/0x5e2fB6a1e1570eB61360E87Da44979cb932090B0)
- Oracles:
    - yvUSDC-1_ERC4626Oracle: [0xd680aA82d58D5cc5385A4a3ACdEbE93D84D65a00](https://sepolia.etherscan.io/address/0xd680aA82d58D5cc5385A4a3ACdEbE93D84D65a00)
    - yvUSDT-1_ERC4626Oracle: [0x930F0fC7321eB35Ff93556C264EA076d3Aaf1692](https://sepolia.etherscan.io/address/0x930F0fC7321eB35Ff93556C264EA076d3Aaf1692)
    - yvUSDS-1_ERC4626Oracle: [0x5a93e425e42470b9bB609862abf2A38E7041250E](https://sepolia.etherscan.io/address/0x5a93e425e42470b9bB609862abf2A38E7041250E)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/473)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0x6562e0787d91c7836b13ab0007fd60e4cd81de8f86478853530a1bf4509e8ed7)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3])[])",
        params: [
          [
            ...tokens.map(t => [
              t.address,
              [t.oracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ]),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      ...markets.flatMap(market => [
        {
          target: market.vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: ["7200"],
          dstChainId: LzChainId.ethereum,
        },
        {
          target: market.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, market.initialSupply.amount],
          dstChainId: LzChainId.ethereum,
        },
        {
          target: POOL_REGISTRY,
          signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
          params: [
            [
              market.vToken.address,
              market.riskParameters.collateralFactor,
              market.riskParameters.liquidationThreshold,
              market.initialSupply.amount,
              market.initialSupply.vTokenReceiver,
              market.riskParameters.supplyCap,
              market.riskParameters.borrowCap,
            ],
          ],
          dstChainId: LzChainId.ethereum,
        },
        {
          target: market.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, 0],
          dstChainId: LzChainId.ethereum,
        },
      ]),
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[...markets.map(m => m.vToken.address)], [2], true],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip445;
