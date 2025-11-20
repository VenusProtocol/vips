import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-569/utils/cut-params-bsctestnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;

export const cutParams = params;

export const vip569 = () => {
  const meta = {
    version: "v2",
    title: "VIP-569 [BNB Chain Testnet] Add enterMarketBehalf support to Comptroller",
    description: `#### Summary

If passed, this VIP will upgrade the MarketFacet of the Core pool Comptroller on BNB Chain Testnet to add support for the \`enterMarketBehalf\` function, allowing approved delegates to enter markets on behalf of users.

#### Description`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip569;
