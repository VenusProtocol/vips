import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
export const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
export const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

export const EMODE_POOLS = [
  {
    label: "LTC",
    id: 11,
    markets: [vLTC, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vLTC: {
        address: vLTC,
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
    label: "FIL",
    id: 12,
    markets: [vFIL, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vFIL: {
        address: vFIL,
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
    label: "MATIC",
    id: 13,
    markets: [vMATIC, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vMATIC: {
        address: vMATIC,
        collateralFactor: parseUnits("0", 18),
        liquidationThreshold: parseUnits("0.65", 18),
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
    label: "TRX",
    id: 14,
    markets: [vTRX, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vTRX: {
        address: vTRX,
        collateralFactor: parseUnits("0.525", 18),
        liquidationThreshold: parseUnits("0.525", 18),
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
    label: "DOT",
    id: 15,
    markets: [vDOT, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vDOT: {
        address: vDOT,
        collateralFactor: parseUnits("0.65", 18),
        liquidationThreshold: parseUnits("0.65", 18),
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
    label: "THE",
    id: 16,
    markets: [vTHE, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vTHE: {
        address: vTHE,
        collateralFactor: parseUnits("0.53", 18),
        liquidationThreshold: parseUnits("0.53", 18),
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
    title: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
    description: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(EMODE_POOLS.flatMap(generateEmodePoolCommands), meta, ProposalType.REGULAR);
};
