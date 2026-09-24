import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VETH_CORE = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";

export const CF = "800000000000000000";
export const LT = "800000000000000000";

const Action = {
  MINT: 0,
};

export const vip661TestnetAddendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 Addendum 2: Minimal Recovery of vETH_Core after EBrake Incident on BSC Testnet",
    description: `#### Summary

Recover the vETH_Core market on BSC Testnet after EBrake tightened it a second time during DeviationSentinel testing.
VIP-661 Addendum 1 already established all required permissions (Normal Timelock → \`resetMarketState\`, Guardian
convenience grants), so this VIP contains only the three actions that are strictly necessary to restore the market.
This serves as a reference for the minimal governance footprint needed to recover from any future EBrake incident.

#### Actions

1. Restore vETH_Core collateral factor to 0.8e18 / 0.8e18 (values stored in EBrake snapshot)
2. Unpause MINT (supply) on vETH_Core
3. Clear EBrake's stored snapshot for vETH_Core via \`resetMarketState\``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Restore vETH_Core collateral factor on the comptroller
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VETH_CORE, CF, LT],
      },

      // 2. Unpause MINT (supply) on vETH_Core
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VETH_CORE], [Action.MINT], false],
      },

      // 3. Clear EBrake's stored snapshot for vETH_Core
      {
        target: EBRAKE,
        signature: "resetMarketState(address)",
        params: [VETH_CORE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661TestnetAddendum2;
