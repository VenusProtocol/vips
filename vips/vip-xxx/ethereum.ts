import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const RISK_STEWARD_RECEIVER = "0x5086Dc718D1288E4cc4F6a75991E4a0bD0611bF1";
export const MARKET_CAP_RISK_STEWARD = "0x7191b4602Fe9d36E1A4b2cb84D0c80C543F13f9A";
export const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

export const MORE_THAN_1_DAY = 86401; // 24 hours + 1 second

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
      // Permissions
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", ethereum.CRITICAL_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", ethereum.FAST_TRACK_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", ethereum.CRITICAL_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", ethereum.FAST_TRACK_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", ethereum.CRITICAL_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", ethereum.FAST_TRACK_TIMELOCK],
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD, "processUpdate(RiskParameterUpdate)", RISK_STEWARD_RECEIVER],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD, "setMaxIncreaseBps(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD, "setMaxIncreaseBps(uint256)", ethereum.CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAP_RISK_STEWARD, "setMaxIncreaseBps(uint256)", ethereum.FAST_TRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      // Set risk parameter configurations
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD, MORE_THAN_1_DAY],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD, MORE_THAN_1_DAY],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip599;
