import { cutParams as params } from "../../simulations/vip-174/vip-174/utils/cut-params.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const DIAMOND = "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PAUSE_GUARDIAN_MULTISIG = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
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

export const vip174 = () => {
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
