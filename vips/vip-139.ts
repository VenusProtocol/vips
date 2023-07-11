import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VBIFI_DEFI = "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909";

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip139 = () => {
  const meta = {
    version: "v2",
    title: "VIP-139 Delist BIFI",
    description: `
        We will start delisting BIFI.
          `,
    forDescription: "I agree that Venus Protocol should proceed with delisting vBIFI_DeFi",
    againstDescription: "I do not think that Venus Protocol should proceed with the delisting vBIFI_DeFi",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the delisting vBIFI_DeFi",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VBIFI_DEFI], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: VBIFI_DEFI,
        signature: "setReserveFactor(uint256)",
        params: ["1000000000000000000"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};
