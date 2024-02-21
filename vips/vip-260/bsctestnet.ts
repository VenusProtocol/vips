import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal, networkChainIds } from "../../src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vip260Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-260 Binance bridge set up",
    description: `Set up bridge on Binance for vote syncing`,
    forDescription: "I agree that Venus Protocol should proceed with the this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with the this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the this proposal or not",
  };
  return makeProposal(
    [
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "setSendVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "setReceiveVersion(uint16)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "forceResumeReceive(uint16,bytes)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "setOracle(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
          "setMaxDailyReceiveLimit(uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "pause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "unpause()", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [bsctestnet.VOTE_SYNC_RECEIVER_ADMIN, "setPrecrime(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
          "setMinDstGas(uint16,uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
          "setPayloadSizeLimit(uint16,uint256)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
          "setConfig(uint16,uint16,uint256,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
          "setTrustedRemoteAddress(uint16,bytes)",
          bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: bsctestnet.VOTE_SYNC_RECEIVER_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [networkChainIds["sepolia"], bsctestnet.VOTE_SYNC_SENDER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
