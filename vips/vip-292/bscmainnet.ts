import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const NEW_XVS_IMPLEMENTATION = "0xaBADb59b8BB3fC9D59A7c6696D3DE77344Cba782";
const BNB_BLOCKS_PER_YEAR = 10_512_000; // assuming a block is mined every 3 seconds

const vip292 = () => {
  const meta = {
    version: "v2",
    title: "VIP-292 Update XVSVault Implementation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_XVS_IMPLEMENTATION],
      },
      {
        target: NEW_XVS_IMPLEMENTATION,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },
      {
        target: XVS_VAULT_PROXY,
        signature: "initializeTimeManager(bool,uint256)",
        params: [false, BNB_BLOCKS_PER_YEAR],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip292;
