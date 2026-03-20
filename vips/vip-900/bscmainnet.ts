import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { Command, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;
export const FAST_TRACK_TIMELOCK = bscmainnet.FAST_TRACK_TIMELOCK;
export const CRITICAL_TIMELOCK = bscmainnet.CRITICAL_TIMELOCK;
export const PENDLE_PT_VAULT_ADAPTER = "0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a";

// Pendle market (PT-clisBNBx-25JUN2026)
export const PENDLE_MARKET_SLISBNB = "0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5";

// Venus vToken for PT-clisBNBx-25JUN2026
export const VTOKEN_PT_CLISBNBX = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";

export const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

const giveCallPermission = (target: string, signature: string, caller: string): Command => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
});

const vip900 = () => {
  const meta = {
    version: "v2",
    title: "VIP-900 PendlePTVaultAdapter: Accept Ownership and Add slisBNB Market",
    description: `If this VIP passes, it will perform the following actions:

- Grant ACM permissions for the Normal, Fast-track, and Critical Timelocks to call pause and unpause, and for the Normal Timelock to call addMarket on the PendlePTVaultAdapter
- Accept ownership of the PendlePTVaultAdapter contract
- Register the Pendle PT-clisBNBx-25JUN2026 market (slisBNB) on the PendlePTVaultAdapter`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },
      ...ALL_TIMELOCKS.flatMap(timelock => [
        giveCallPermission(PENDLE_PT_VAULT_ADAPTER, "pause()", timelock),
        giveCallPermission(PENDLE_PT_VAULT_ADAPTER, "unpause()", timelock),
      ]),
      giveCallPermission(PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)", NORMAL_TIMELOCK),
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "addMarket(address,address)",
        params: [PENDLE_MARKET_SLISBNB, VTOKEN_PT_CLISBNBX],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip900;
