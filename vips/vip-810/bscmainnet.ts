import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const vU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";

export const EMODE_POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vU],
  marketsConfig: {
    vU: {
      address: vU,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
  },
};

export const vip810 = () => {
  const meta = {
    version: "v2",
    title: "VIP-810 [BNB Chain] Add U market to the stablecoin Emode pool",
    description: "VIP-810 [BNB Chain] Add U market to the stablecoin Emode pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add market to Stablecoins emode
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL_SPECS.markets.length).fill(EMODE_POOL_SPECS.id), EMODE_POOL_SPECS.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vU.address,
          EMODE_POOL_SPECS.marketsConfig.vU.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vU.address,
          EMODE_POOL_SPECS.marketsConfig.vU.borrowAllowed,
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
