import { BigNumber } from "ethers";

import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const COMPTROLLER = "";
const NEW_COMPTROLLER_IML = "";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VAI_CONTROLLER_PROXY = "";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const INITIAL_MINT_RATE = BigNumber.from(10000);

export const VAIControllerVIP = () => {
  const meta = {
    version: "v1",
    title: "VIP for adding VAI support in Isolated Pools",
    description: `#### Summary
            If passed this VIP will perform the following actions:
            - The implementation of comptroller will be upgraded
            - VAI Controller is integrated to comptroller`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IML],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setVAIMintRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: COMPTROLLER,
        signature: "setVAIController(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setComptroller(address)",
        params: [COMPTROLLER],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setVAIToken(address)",
        params: [VAI],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setVAIMintRate(uint256)",
        params: [INITIAL_MINT_RATE],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setReceiver(address)",
        params: [TREASURY],
      },
      {
        target: VAI,
        signature: "rely(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
