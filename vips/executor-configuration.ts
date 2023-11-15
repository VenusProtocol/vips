import { ProposalType } from "../src/types";
import { makeProposalV2 } from "../src/utils";

const SEPOLIA_NORMAL_TIMELOCK = "0x3961EDAfe1d1d3AB446f1b2fc10bde476058448B";
const SEPOLIA_ACCESS_CONTROL_MANAGER = "0x982e066294532CDC1631Bf7c587f41976dEA9B62";
const SEPOLIA_FASTTRACK_TIMELOCK = "0x02A66bfB5De5c6b969cB81F00AC433bC8EeeDd4c";
const SEPOLIA_CRITICAL_TIMELOCK = "0xa82173F08CDFCD6fDB5505dcd37E5c6403a26DE6";
const OMNICHAIN_PROPOSAL_SENDER = "0x0852b6D4C4745A8bFEB54476A2A167DF68866c00";
const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x21Faad4b28256E5C56f54fbAaceda919E707549f";
const SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = "0x9B0786cD8F841D1C7B8A08a5aE6a246aEd556a42";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ARBITRUM_NORMAL_TIMELOCK = "0x54E8C036A5f63Ad5e3B28Fa610cdBdbC00613446";
const ARBITRUM_ACCESS_CONTROL_MANAGER = "0x3d6807f76ebb8A458c4EA6Bc0B8cEb29c633316b";
const ARBITRUM_OMNICHAIN_EXECUTOR_OWNER = "0xEf2C81843B322A0DbeaB9490c7dD576eE23732A3";

const sepoliaChainId = 10161;
const arbitrumChainId = 10143;

export const executor_configuration = async () => {
  const meta = {
    version: "v2",
    title:
      "executor_configuration give access permission and configuration of cross chain governance executor on remote chain",
    description: `#### Description

    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalExecutor on remote chain`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return await makeProposalV2(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "updateValidChainId(uint16,bool)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [OMNICHAIN_PROPOSAL_SENDER, "execute(uint16,bytes,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [sepoliaChainId, 100],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "updateValidChainId(uint16,bool)",
        params: [sepoliaChainId, "true"],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [sepoliaChainId, SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMaxDailyReceiveLimit(uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "pause()", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "unpause()", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "addTimelocks(address[])",
        params: [[SEPOLIA_NORMAL_TIMELOCK, SEPOLIA_FASTTRACK_TIMELOCK, SEPOLIA_CRITICAL_TIMELOCK]],
        dstChainId: sepoliaChainId,
      },
      {
        target: SEPOLIA_OMNICHAIN_EXECUTOR_OWNER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [10102, OMNICHAIN_PROPOSAL_SENDER],
        dstChainId: sepoliaChainId,
      },

      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setReceiveVersion(uint16)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setOracle(address)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          ARBITRUM_NORMAL_TIMELOCK,
        ],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "pause()", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "unpause()", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setTrustedRemoteAddress(uint16,bytes)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPrecrime(address)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setMinDstGas(uint16,uint16,uint256)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setPayloadSizeLimit(uint16,uint256)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "setConfig(uint16,uint16,uint256,bytes)", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
      {
        target: ARBITRUM_ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "addTimelocks(address[])", ARBITRUM_NORMAL_TIMELOCK],
        dstChainId: arbitrumChainId,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
