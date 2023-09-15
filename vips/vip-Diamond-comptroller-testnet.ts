import { cutParams as params } from "../simulations/vip-diamond-comptroller-testnet/utils/cut-params-testnet.json";
import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const DIAMOND = "0xB2243Da976F2cbAAa4dd1a76BF7F6EFbe22c4CFc";
const ACM = "0x69a9e5dee4007fb1311c4d086fed4803e09a30b5";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const PAUSE_GUARDIAN_MULTISIG = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const cutParams = params;

interface GrantAccess {
  target: string;
  signature: string;
  params: Array<string>;
}

const grantAccessControl = () => {
  const accessProposals: Array<GrantAccess> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, PAUSE_GUARDIAN_MULTISIG].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [UNITROLLER, "_setActionsPaused(address[],uint256[],bool)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "_setActionsPaused(address[],uint8[],bool)", target],
    });
  });

  return accessProposals;
};

export const vipDiamondTestnet = () => {
  const meta = {
    version: "v1",
    title: "VIP Comptroller Diamond proxy",
    description: `This vip implement diamond proxy for the comptroller to divide the comptroller logic into facets. The current implementation of the comptroller is exceeding the max limit of the contract size. To resolve this diamond proxy is implemented.`,
    forDescription:
      "I agree that Venus Protocol should proceed with the upgrading the Comptroller contract with diamond proxy",
    againstDescription: "I do not think that Venus Protocol should proceed with the Comptroller contract upgradation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Comptroller upgradation or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      ...grantAccessControl(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
