import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vPT_USDe_30OCT2025 = "0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E";

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

export const vip564 = () => {
  const meta = {
    version: "v2",
    title: "VIP-563",
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
        params: [
          [vPT_USDe_30OCT2025],
          [
            Actions.MINT,
            Actions.REDEEM,
            Actions.REPAY,
            Actions.SEIZE,
            Actions.LIQUIDATE,
            Actions.TRANSFER,
            Actions.ENTER_MARKET,
            Actions.EXIT_MARKET,
          ],
          true,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPT_USDe_30OCT2025], [0]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vPT_USDe_30OCT2025],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip564;
