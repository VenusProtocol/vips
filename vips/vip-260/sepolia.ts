import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;
export const vip260Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-260 XVS Vault Upgrade on sepolia and set up bridge",
    description: `Update XVS Vault implementation to XVSVaultDest to enable Syncing of Votes feature`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal or not",
  };

  return makeProposal(
    [
      {
        target: sepolia.XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [sepolia.XVS_Vault_Dest],
      },

      {
        target: sepolia.XVS_Vault_Dest,
        signature: "_become(address)",
        params: [sepolia.XVS_VAULT_PROXY],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "setTrustedRemoteAddress(bytes)", sepolia.NORMAL_TIMELOCK],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "setTrustedRemoteAddress(bytes)", sepolia.NORMAL_TIMELOCK],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "retrySyncVotes(uint256,bytes,bytes,uint256)", sepolia.NORMAL_TIMELOCK],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "syncVotes(bytes,bytes)", sepolia.XVS_VAULT_PROXY],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "pause()", sepolia.XVS_VAULT_PROXY],
      },
      {
        target: sepolia.ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.VOTE_SYNC_SENDER, "unpause()", sepolia.XVS_VAULT_PROXY],
      },
      {
        target: sepolia.VOTE_SYNC_SENDER,
        signature: "setTrustedRemoteAddress(bytes)",
        params: [sepolia.VOTE_SYNC_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
