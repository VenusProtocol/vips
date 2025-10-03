import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

// BTC emode group
export const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const EMODE_POOL = {
  label: "BTC",
  id: 2,
  allowCorePoolFallback: true,
  markets: [vBTC, vSolvBTC, vxSolvBTC],
  marketConfig: {
    vBTC: {
      address: vBTC,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vSolvBTC: {
      address: vSolvBTC,
      collateralFactor: parseUnits("0.83", 18),
      liquidationThreshold: parseUnits("0.85", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
    vxSolvBTC: {
      address: vxSolvBTC,
      collateralFactor: parseUnits("0.81", 18),
      liquidationThreshold: parseUnits("0.83", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
  },
};

export const vip553 = () => {
  const meta = {
    version: "v2",
    title: "VIP-553 [BNB Chain] BTC emode group",
    description: "VIP-553 [BNB Chain] BTC emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // BTC Emode Group
      {
        target: bscmainnet.UNITROLLER,
        signature: "createPool(string)",
        params: [EMODE_POOL.label],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL.markets.length).fill(EMODE_POOL.id), EMODE_POOL.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vBTC.address,
          EMODE_POOL.marketConfig.vBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketConfig.vBTC.address, EMODE_POOL.marketConfig.vBTC.borrowAllowed],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [bscmainnet.UNITROLLER, "_supportMarket(address)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip553;
