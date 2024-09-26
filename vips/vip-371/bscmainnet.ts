import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const LST_BNB_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vstkBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};
export const RESERVE_FACTOR = parseUnits("1", 18);
export const COLLATERAL_FACTOR = 0;
export const LIQUIDATION_THRESHOLD = parseUnits("0.93", 18);
export const vstkBNB_SUPPLY_CAP = 0;
export const vstkBNB_BORROW_CAP = 0;
export const vMATIC_SUPPLY_CAP = parseUnits("5500000", 18);
export const vMATIC_BORROW_CAP = parseUnits("250000", 18);

export const vip371 = () => {
  const meta = {
    version: "v2",
    title: "VIP-371",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vstkBNB], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: vstkBNB,
        signature: "setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vstkBNB, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vstkBNB], [vstkBNB_BORROW_CAP]],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vstkBNB], [vstkBNB_SUPPLY_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vMATIC], [vMATIC_BORROW_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vMATIC], [vMATIC_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip371;
