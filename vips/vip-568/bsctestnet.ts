import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vPT_USDe_30OCT2025 = "0x86a94290f2B8295daA3e53bA1286f2Ff21199143";

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

export const vip568 = () => {
  const meta = {
    version: "v2",
    title: "VIP-568",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
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
        target: bsctestnet.UNITROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPT_USDe_30OCT2025], [0]],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vPT_USDe_30OCT2025],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip568;
