import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
export const NEW_XVS_IMPLEMENTATION = "0x6F869480eEEbB66b58a930892AddC0067Fb43B20";

export const BNB_BLOCKS_PER_YEAR = 10_512_000; // assuming a block is mined every 3 seconds

const vip308 = () => {
  const meta = {
    version: "v2",
    title: "VIP-308 Update XVSVault Implementation",
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
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip308;
