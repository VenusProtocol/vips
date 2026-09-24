import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-573/utils/cut-params-bscmainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const cutParams = params;

export const vip573 = () => {
  const meta = {
    version: "v2",
    title: "VIP-573 [BNB Chain] Add enterMarketBehalf support to Comptroller",
    description: `#### Summary

If passed, this VIP will upgrade the MarketFacet of the core pool Comptroller on BNB Chain Mainnet to add support for the \`enterMarketBehalf\` function, allowing approved delegates to enter markets on behalf of users.

#### Description`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip573;
