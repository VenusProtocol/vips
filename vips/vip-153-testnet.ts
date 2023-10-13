import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ACCOUNT = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const PRIME = "0x4e446d6Fe16c4e95eEAd7f963C9312Cf4c280270"
const PLP = "0x2B8e226a462138250df2551bb499ad71218c4353";

export const vip153Testnet = () => {
  const meta = {
    version: "v2",
    title: "Allow Shared Account access to Prime and PLP",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed",
    againstDescription:
      "I do not think that Venus Protocol should proceed ",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds ",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateAlpha(uint128,uint128)", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateMultipliers(address,uint256,uint256)", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "addMarket(address,uint256,uint256)", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setLimit(uint256,uint256)", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "issue(bool,address[])", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "burn(address)", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "togglePause()", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PLP, "pauseFundsTransfer()", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PLP, "resumeFundsTransfer()", ACCOUNT],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PLP, "setTokensDistributionSpeed(address[],uint256[])", ACCOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
