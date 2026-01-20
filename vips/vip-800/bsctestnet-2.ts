import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

// Link, bch, Fil and Dot are not supported on BSC Testnet
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vMATIC = "0x3619bdDc61189F33365CC572DF3a68FB3b316516";
export const vTRX = "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04";
export const vTHE = "0x39A239F5117BFaC7a1b0b3A517c454113323451d";

export const EMODE_POOLS = [
  // The vMATIC oracle is returning "invalid resilient oracle price" error currently, so this pool is commented out for now
  //   {
  //     label: "MATIC",
  //     id: 11,
  //     markets: [vMATIC, vUSDT, vUSDC],
  //     allowCorePoolFallback: true,
  //     marketsConfig: {
  //       vMATIC: {
  //         address: vMATIC,
  //         collateralFactor: parseUnits("0.6", 18),
  //         liquidationThreshold: parseUnits("0.6", 18),
  //         liquidationIncentive: parseUnits("1.1", 18),
  //         borrowAllowed: true,
  //       },
  //       vUSDT: {
  //         address: vUSDT,
  //         collateralFactor: parseUnits("0.8", 18),
  //         liquidationThreshold: parseUnits("0.8", 18),
  //         liquidationIncentive: parseUnits("1.1", 18),
  //         borrowAllowed: true,
  //       },
  //       vUSDC: {
  //         address: vUSDC,
  //         collateralFactor: parseUnits("0.81", 18),
  //         liquidationThreshold: parseUnits("0.81", 18),
  //         liquidationIncentive: parseUnits("1.1", 18),
  //         borrowAllowed: true,
  //       },
  //     },
  //   },
  {
    label: "TRX",
    id: 11,
    markets: [vTRX, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      vTRX: {
        address: vTRX,
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
    label: "THE",
    id: 12,
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
    title: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
    description: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(EMODE_POOLS.flatMap(generateEmodePoolCommands), meta, ProposalType.REGULAR);
};
