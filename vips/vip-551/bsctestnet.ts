import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

// BTC emode group
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
export const vSolvBTC = "0xA38110ae4451A86ab754695057d5B5a9BEAd0387";
export const vxSolvBTC = "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e";
export const EMODE_POOL = {
  label: "BTC",
  id: 3,
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

export const vip551 = () => {
  const meta = {
    version: "v2",
    title: "VIP-551 [BNB Chain] BTC emode group",
    description: "VIP-551 [BNB Chain] BTC emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // BTC Emode Group
      {
        target: bsctestnet.UNITROLLER,
        signature: "createPool(string)",
        params: [EMODE_POOL.label],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL.markets.length).fill(EMODE_POOL.id), EMODE_POOL.markets],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vBTC.address,
          EMODE_POOL.marketConfig.vBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketConfig.vBTC.address, EMODE_POOL.marketConfig.vBTC.borrowAllowed],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [bsctestnet.UNITROLLER, "_supportMarket(address)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip551;
