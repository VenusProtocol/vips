import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";

export const EMODE_POOLS = [
  {
    label: "LINK",
    id: 4,
    markets: [vLINK, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vLINK: {
        address: vLINK,
        collateralFactor: parseUnits("0.63", 18),
        liquidationThreshold: parseUnits("0.63", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "UNI",
    id: 5,
    markets: [vUNI, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vUNI: {
        address: vUNI,
        collateralFactor: parseUnits("0.55", 18),
        liquidationThreshold: parseUnits("0.55", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "AAVE",
    id: 6,
    markets: [vAAVE, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vAAVE: {
        address: vAAVE,
        collateralFactor: parseUnits("0.55", 18),
        liquidationThreshold: parseUnits("0.55", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "DOGE",
    id: 7,
    markets: [vDOGE, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vDOGE: {
        address: vDOGE,
        collateralFactor: parseUnits("0.43", 18),
        liquidationThreshold: parseUnits("0.43", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "BCH",
    id: 8,
    markets: [vBCH, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vBCH: {
        address: vBCH,
        collateralFactor: parseUnits("0.6", 18),
        liquidationThreshold: parseUnits("0.6", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "TWT",
    id: 9,
    markets: [vTWT, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vTWT: {
        address: vTWT,
        collateralFactor: parseUnits("0.5", 18),
        liquidationThreshold: parseUnits("0.5", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "ADA",
    id: 10,
    markets: [vADA, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vADA: {
        address: vADA,
        collateralFactor: parseUnits("0.63", 18),
        liquidationThreshold: parseUnits("0.63", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDT: {
        address: vUSDT,
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
      vUSDC: {
        address: vUSDC,
        collateralFactor: parseUnits("0.825", 18),
        liquidationThreshold: parseUnits("0.825", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
];

function generateEmodePoolCommands(pool: any) {
  const commands = [
    {
      target: bscmainnet.UNITROLLER,
      signature: "createPool(string)",
      params: [pool.label],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "setPoolActive(uint96,bool)",
      params: [pool.id, true],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "addPoolMarkets(uint96[],address[])",
      params: [Array(pool.markets.length).fill(pool.id), pool.markets],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "setAllowCorePoolFallback(uint96,bool)",
      params: [pool.id, pool.allowCorePoolFallback],
    },
  ];

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setCollateralFactor(uint96,address,uint256,uint256)",
      params: [pool.id, market.address, market.collateralFactor, market.liquidationThreshold],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setLiquidationIncentive(uint96,address,uint256)",
      params: [pool.id, market.address, market.liquidationIncentive],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setIsBorrowAllowed(uint96,address,bool)",
      params: [pool.id, market.address, market.borrowAllowed],
    });
  }

  return commands;
}

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools",
    description: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(EMODE_POOLS.flatMap(generateEmodePoolCommands), meta, ProposalType.REGULAR);
};
