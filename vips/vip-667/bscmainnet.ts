import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const EMODE_POOL = {
  label: "ETH",
  id: 4,
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
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.collateralFactor,
          EMODE_POOL.marketsConfig.vWBETH.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vETH.address,
          EMODE_POOL.marketsConfig.vETH.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketsConfig.vETH.address, EMODE_POOL.marketsConfig.vETH.borrowAllowed],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip557;
