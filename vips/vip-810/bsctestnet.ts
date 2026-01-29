import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const mockU = "0x180Bc1a9843A65D4116e44886FD3558515a56A49";
export const vU = "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90";

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
        target: bsctestnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL_SPECS.markets.length).fill(EMODE_POOL_SPECS.id), EMODE_POOL_SPECS.markets],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vU.address,
          EMODE_POOL_SPECS.marketsConfig.vU.liquidationIncentive,
        ],
      },
      {
        target: bsctestnet.UNITROLLER,
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
