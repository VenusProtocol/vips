import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

// Link, bch, Fil and Dot are not supported on BSC Testnet
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
export const vAAVE = "0x714db6c38A17883964B68a07d56cE331501d9eb6";
export const vDOGE = "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9";
export const vTWT = "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF";
export const vADA = "0x37C28DE42bA3d22217995D146FC684B2326Ede64";
export const vLTC = "0xAfc13BC065ABeE838540823431055D2ea52eBA52";

export const EMODE_POOLS = [
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
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
        collateralFactor: parseUnits("0.8", 18),
        liquidationThreshold: parseUnits("0.8", 18),
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "TWT",
    id: 8,
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "ADA",
    id: 9,
    markets: [vADA, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vADA: {
        address: vADA,
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
  {
    label: "LTC",
    id: 10,
    markets: [vLTC, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vLTC: {
        address: vLTC,
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
        collateralFactor: parseUnits("0.81", 18),
        liquidationThreshold: parseUnits("0.81", 18),
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: true,
      },
    },
  },
];

function generateEmodePoolCommands(pool: any) {
  const commands = [
    {
      target: bsctestnet.UNITROLLER,
      signature: "createPool(string)",
      params: [pool.label],
    },
    {
      target: bsctestnet.UNITROLLER,
      signature: "setPoolActive(uint96,bool)",
      params: [pool.id, true],
    },
    {
      target: bsctestnet.UNITROLLER,
      signature: "addPoolMarkets(uint96[],address[])",
      params: [Array(pool.markets.length).fill(pool.id), pool.markets],
    },
    {
      target: bsctestnet.UNITROLLER,
      signature: "setAllowCorePoolFallback(uint96,bool)",
      params: [pool.id, pool.allowCorePoolFallback],
    },
  ];

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bsctestnet.UNITROLLER,
      signature: "setCollateralFactor(uint96,address,uint256,uint256)",
      params: [pool.id, market.address, market.collateralFactor, market.liquidationThreshold],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bsctestnet.UNITROLLER,
      signature: "setLiquidationIncentive(uint96,address,uint256)",
      params: [pool.id, market.address, market.liquidationIncentive],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bsctestnet.UNITROLLER,
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
