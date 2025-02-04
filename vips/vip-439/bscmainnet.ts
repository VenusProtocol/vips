import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";

const yvUSDC_1_ORACLE = "0x64725823f70dcE89d17e4dDE9C5D53Fe47ce507c";
const yvUSDT_1_ORACLE = "0x591a4124cE63C3d42e80B60E80DeD7F6e383b6F9";
const yvUSDS_1_ORACLE = "0x9026cDC8c08652C6130182772aC197b0367A71C5";

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
    price: parseUnits("1.04886575582268136555792443", 42),
  },
  {
    address: "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa",
    decimals: 6,
    symbol: "yvUSDT-1",
    oracle: yvUSDT_1_ORACLE,
    price: parseUnits("1.0272603053033119936994", 42),
  },
  {
    address: "0x182863131F9a4630fF9E27830d945B1413e347E8",
    decimals: 18,
    symbol: "yvUSDS-1",
    oracle: yvUSDS_1_ORACLE,
    price: parseUnits("1.1", 18),
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
      amount: parseUnits("10000", 6),
      vTokenReceiver: VTREASURY,
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
      amount: parseUnits("10000", 6),
      vTokenReceiver: VTREASURY,
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
      exchangeRate: parseUnits("1", 28),
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
      amount: parseUnits("10000", 18),
      vTokenReceiver: VTREASURY,
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

const vip439 = () => {
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

export default vip439;
