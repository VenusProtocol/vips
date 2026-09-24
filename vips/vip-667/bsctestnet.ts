import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
export const vWBETH = "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b";
export const EMODE_POOL = {
  label: "ETH",
  id: 5,
  markets: [vETH, vWBETH],
  allowCorePoolFallback: true,
  marketsConfig: {
    vETH: {
      address: vETH,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vWBETH: {
      address: vWBETH,
      collateralFactor: parseUnits("0.93", 18),
      liquidationThreshold: parseUnits("0.95", 18),
      liquidationIncentive: parseUnits("1.02", 18),
      borrowAllowed: false,
    },
  },
};

export const vip557 = () => {
  const meta = {
    version: "v2",
    title: "VIP-557 [BNB Chain] ETH emode group",
    description: "VIP-554 [BNB Chain] ETH emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.collateralFactor,
          EMODE_POOL.marketsConfig.vWBETH.liquidationThreshold,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vETH.address,
          EMODE_POOL.marketsConfig.vETH.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketsConfig.vETH.address, EMODE_POOL.marketsConfig.vETH.borrowAllowed],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip557;
