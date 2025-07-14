import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-xxx/utils/cur-params-bscmainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const RISK_STEWARD_RECEIVER_BSCMAINNET = "0xBa2a43279a228cf9cD94d072777d8d98e7e0a229";
export const MARKET_CAP_RISK_STEWARD_BSCMAINNET = "0xE7252dccd79F2A555E314B9cdd440745b697D562";
export const ANY_TARGET_CONTRACT = ethers.constants.AddressZero;

export const MORE_THAN_1_DAY = 86401; // 24 hours + 1 second
export const cutParams = params;

export const vip599 = () => {
  const meta = {
    version: "v2",
    title: "VIP-599: Configure Remote Risk Stewards",
    description: `#### Summary
Configure Remote Risk Stewards
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Update diamond cut
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      // Permissions
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_BSCMAINNET,
          "setRiskParameterConfig(string,address,uint256)",
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSCMAINNET],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSCMAINNET],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "toggleConfigActive(string)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD_BSCMAINNET, "setMaxDeltaBps(uint256)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      // Set risk parameter configurations
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BSCMAINNET, MORE_THAN_1_DAY],
      },
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BSCMAINNET, MORE_THAN_1_DAY],
      },
      // Accept ownership of Risk Steward Receiver
      {
        target: RISK_STEWARD_RECEIVER_BSCMAINNET,
        signature: "acceptOwnership()",
        params: [],
      },
      // Accept ownership of Market Cap Risk Steward
      {
        target: MARKET_CAP_RISK_STEWARD_BSCMAINNET,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip599;
