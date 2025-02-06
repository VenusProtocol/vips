import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

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
    price: parseUnits("1.04999495388567", 30),
  },
  {
    address: "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa",
    decimals: 6,
    symbol: "yvUSDT-1",
    oracle: yvUSDT_1_ORACLE,
    price: parseUnits("1.02728047118582", 30),
  },
  {
    address: "0x182863131F9a4630fF9E27830d945B1413e347E8",
    decimals: 18,
    symbol: "yvUSDS-1",
    oracle: yvUSDS_1_ORACLE,
    price: parseUnits("1.029165904957293506", 18),
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

const vip442 = () => {
  const meta = {
    version: "v2",
    title: "Add yvUSDC-1, yvUSDT-1 and yvUSDS-1 to the Core pool",
    description: ``,
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

export default vip442;
