import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// New EBrake implementation — TODO: set after PR #62 deployment
export const NEW_EBRAKE_IMPL = "0x0000000000000000000000000000000000000000";
// New DeviationSentinel implementation (calls decreaseCF instead of setCFZero) — TODO: set after deployment
export const NEW_DEVIATION_SENTINEL_IMPL = "0x0000000000000000000000000000000000000000";

export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const DEVIATION_SENTINEL = "0x9245d72712548707809D66848e63B8E2B169F3c1";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
// Keeper/Guardian address granted extra testnet convenience permissions in Addendum 1
export const KEEPER_ADDRESS = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
// All accounts that received resetMarketState permission (bsctestnet.ts + Addendum 1)
const RESET_ACCOUNTS = [...TIMELOCKS, KEEPER_ADDRESS];

// Testnet uses address(0) so grants apply across all comptrollers
const ADDR_ZERO = ethers.constants.AddressZero;

// Granular snapshot-reset functions (replace resetMarketState)
const RESET_PERMS = ["resetCFSnapshot(address)", "resetBorrowCapSnapshot(address)", "resetSupplyCapSnapshot(address)"];

// New Comptroller permissions EBrake needs for the new surgical controls
const NEW_EBRAKE_COMPTROLLER_PERMS = [
  "setIsBorrowAllowed(uint96,address,bool)",
  "setWhiteListFlashLoanAccount(address,bool)",
];

// All EBrake action functions timelocks and keeper can call directly.
// Lets a Critical VIP (~1h delay) route through EBrake and get snapshot coverage,
// making recovery via resetXxxSnapshot trivial. Without this, governance would call
// the comptroller directly (no snapshot stored).
const GOVERNANCE_EBRAKE_PERMS = [
  "pauseBorrow(address)",
  "pauseSupply(address)",
  "pauseRedeem(address)",
  "pauseTransfer(address)",
  "pauseFlashLoan()",
  "pauseActions(address[],uint8[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
  "disablePoolBorrow(uint96,address)",
  "revokeFlashLoanAccess(address)",
  "decreaseCF(address,uint256)",
  "decreaseCF(address,uint96,uint256)",
];

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

const revokeCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip661TestnetAddendum3 = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 Addendum 3: Update EBrake permissions on BSC Testnet",
    description: `#### Summary

This VIP updates the EBrake system on BSC Testnet with changes from
[venus-periphery#62](https://github.com/VenusProtocol/venus-periphery/pull/62).

If approved, this VIP will:

1. Upgrade EBrake proxy to the new implementation
2. Upgrade DeviationSentinel proxy to the new implementation (calls \`decreaseCF\` instead of \`setCFZero\`)
3. Revoke the old \`setCFZero(address)\` grant from DeviationSentinel on EBrake; grant \`decreaseCF(address,uint256)\` instead
4. Revoke the old \`resetMarketState(address)\` grants from all accounts (timelocks + keeper); replace with three
   granular snapshot-reset functions: \`resetCFSnapshot\`, \`resetBorrowCapSnapshot\`, \`resetSupplyCapSnapshot\`
5. Grant EBrake two new Comptroller permissions needed by the new surgical controls:
   \`setIsBorrowAllowed(uint96,address,bool)\` and \`setWhiteListFlashLoanAccount(address,bool)\`
6. Grant timelocks and keeper permission to call all EBrake action functions directly, so a Critical VIP
   can route through EBrake and benefit from its snapshot mechanism

#### References

- [EBrake Contract](https://testnet.bscscan.com/address/${EBRAKE})
- [DeviationSentinel Proxy](https://testnet.bscscan.com/address/${DEVIATION_SENTINEL})
- [New EBrake Implementation](https://testnet.bscscan.com/address/${NEW_EBRAKE_IMPL})
- [New DeviationSentinel Implementation](https://testnet.bscscan.com/address/${NEW_DEVIATION_SENTINEL_IMPL})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Upgrade EBrake proxy to new implementation
      { target: PROXY_ADMIN, signature: "upgrade(address,address)", params: [EBRAKE, NEW_EBRAKE_IMPL] },

      // 2. Upgrade DeviationSentinel proxy to new implementation
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [DEVIATION_SENTINEL, NEW_DEVIATION_SENTINEL_IMPL],
      },

      // 3. Swap setCFZero → decreaseCF for DeviationSentinel on EBrake
      revokeCallPermission(EBRAKE, "setCFZero(address)", DEVIATION_SENTINEL),
      giveCallPermission(EBRAKE, "decreaseCF(address,uint256)", DEVIATION_SENTINEL),

      // 4. Revoke resetMarketState; grant three granular reset functions in its place
      //    Timelocks were granted at address(0) in bsctestnet.ts.
      //    NormalTimelock + Keeper were additionally granted at EBRAKE specifically in Addendum 1.
      ...TIMELOCKS.map(account => revokeCallPermission(ADDR_ZERO, "resetMarketState(address)", account)),
      revokeCallPermission(EBRAKE, "resetMarketState(address)", NORMAL_TIMELOCK),
      revokeCallPermission(EBRAKE, "resetMarketState(address)", KEEPER_ADDRESS),
      ...RESET_ACCOUNTS.flatMap(account => RESET_PERMS.map(sig => giveCallPermission(ADDR_ZERO, sig, account))),

      // 5. Grant EBrake new Comptroller permissions for the new surgical controls
      ...NEW_EBRAKE_COMPTROLLER_PERMS.map(sig => giveCallPermission(ADDR_ZERO, sig, EBRAKE)),

      // 6. Grant timelocks and keeper permission on all EBrake action functions
      ...RESET_ACCOUNTS.flatMap(account =>
        GOVERNANCE_EBRAKE_PERMS.map(sig => giveCallPermission(ADDR_ZERO, sig, account)),
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661TestnetAddendum3;
