import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const PENDLE_PT_VAULT_ADAPTER = "0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a";
export const PENDLE_MARKET_SLISBNB = "0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5";
export const vPT_clisBNB_25JUN2026 = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";

const vip700 = () => {
  const meta = {
    version: "v2",
    title: "VIP-700 PendlePTVaultAdapter: Accept Ownership and Add slisBNB Market",
    description: `If this VIP passes, it will perform the following actions:

        - Accept ownership of the PendlePTVaultAdapter contract (${PENDLE_PT_VAULT_ADAPTER})
        - Grant access control permissions for the PendlePTVaultAdapter:
        - addMarket: Normal Timelock
        - pause/unpause: Normal Timelock, Fast Track Timelock, Critical Timelock, and Guardian
        - Register the Pendle PT-clisBNBx-25JUN2026 market (${PENDLE_MARKET_SLISBNB}) with vToken ${vPT_clisBNB_25JUN2026} on the PendlePTVaultAdapter`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Accept ownership
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },
      // Grant permissions on PendlePTVaultAdapter
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)", bscmainnet.NORMAL_TIMELOCK],
      },
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].flatMap(timelock => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "pause()", timelock],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "unpause()", timelock],
        },
      ]),
      // Add slisBNB Pendle market
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "addMarket(address,address)",
        params: [PENDLE_MARKET_SLISBNB, vPT_clisBNB_25JUN2026],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip700;
