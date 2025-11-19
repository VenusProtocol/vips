import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";
export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
export const MATIC = "0xCC42724C6683B7E57334c4E856f4c9965ED682bD";
export const POL_CHAINLINK_FEED = "0x081195B56674bb87b2B92F6D58F7c5f449aCE19d";
export const MAX_STALE_PERIOD = 900; // 15 minutes in seconds

export const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

export const vip569 = (maxStalePeriod = MAX_STALE_PERIOD) => {
  const meta = {
    version: "v2",
    title: "VIP-569",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vBETH], [Actions.MINT], true],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBETH, 0, parseUnits("0.4", 18)],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vMATIC], [Actions.MINT, Actions.BORROW], true],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vMATIC, 0, parseUnits("0.65", 18)],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vMATIC], [0]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vMATIC], [0]],
      },
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[MATIC, POL_CHAINLINK_FEED, maxStalePeriod]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip569;
