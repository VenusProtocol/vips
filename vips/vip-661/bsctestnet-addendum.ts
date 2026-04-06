import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VETH_CORE = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
export const KEEPER_ADDRESS = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const CF = "800000000000000000";
export const LT = "800000000000000000";

const Action = {
  MINT: 0,
};

export const vip661TestnetAddendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 Addendum: Recover vETH_Core after EBrake Incident on BSC Testnet",
    description: `#### Summary

Recover the vETH_Core market on BSC Testnet after EBrake tightened it during DeviationSentinel testing. The price deviation has resolved (5% < 10% threshold), so this VIP restores the market to normal operating state and clears EBrake's stored snapshot.

This VIP also grants the keeper address permissions on the comptroller for direct pause/CF management on testnet, so future testing iterations don't require a governance VIP.

#### Actions

1. Grant Normal Timelock permission to call \`resetMarketState\` on EBrake (required for step 4)
2. Restore vETH_Core collateral factor to 0.8e18 / 0.8e18 (snapshot values from EBrake)
3. Unpause MINT (supply) on vETH_Core
4. Clear EBrake's stored snapshot for vETH_Core via \`resetMarketState\`
5. Grant keeper address permission to call \`_setActionsPaused\` on comptrollers (testnet convenience)
6. Grant keeper address permission to call \`setCollateralFactor\` on comptrollers (testnet convenience)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Grant Normal Timelock permission to call resetMarketState on EBrake
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "resetMarketState(address)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },

      // 2. Restore vETH_Core collateral factor on the comptroller
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VETH_CORE, CF, LT],
      },

      // 3. Unpause MINT (supply) on vETH_Core
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VETH_CORE], [Action.MINT], false],
      },

      // 4. Clear EBrake's stored snapshot for vETH_Core
      {
        target: EBRAKE,
        signature: "resetMarketState(address)",
        params: [VETH_CORE],
      },

      // 5. Grant keeper permission to pause/unpause actions on comptrollers (testnet only)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setActionsPaused(address[],uint8[],bool)", KEEPER_ADDRESS],
      },

      // 6. Grant keeper permission to set collateral factor on comptrollers (testnet only)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", KEEPER_ADDRESS],
      },

      // 7. Grant keeper permission to reset EBrake market state (testnet convenience — enables repeatable E2E testing)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "resetMarketState(address)", KEEPER_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661TestnetAddendum;
