import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const RELATIVE_POSITION_MANAGER = "0x1525D804DFff218DcC8B9359940F423209356C42";
export const POSITION_ACCOUNT = "0xa75C5b438226bc73BDCc83408E7Aa41771b33E2C";

export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const TIMELOCKS_AND_GUARDIAN = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
  bscmainnet.GUARDIAN,
];

const giveAcmPermissions = (fnSignature: string, timelocks = TIMELOCKS_AND_GUARDIAN) =>
  timelocks.map(timelock => ({
    target: bscmainnet.ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [RELATIVE_POSITION_MANAGER, fnSignature, timelock],
  }));

export const vip608 = () => {
  const meta = {
    version: "v2",
    title: "VIP-608 [BNB Chain] Configure Relative Position Manager",
    description: `This VIP activates the RelativePositionManager contract on BNB Chain mainnet, enabling the **Venus Yield+** product — a relative performance trading feature built on top of Venus Protocol's existing lending and borrowing infrastructure. Yield+ allows users to express a view that one asset will outperform another, packaged into a single, easy-to-manage leveraged position, without manually managing separate supply and borrow operations.

The RelativePositionManager is the core orchestration contract for Yield+. It coordinates position account deployment, collateral management, and integration with Venus Core markets. This VIP performs four categories of on-chain configuration: transferring ownership of the contract to the Normal Timelock (consistent with Venus governance standards), granting Access Control Manager (ACM) permissions required for protocol operations across all relevant timelocks and the guardian, setting the PositionAccount implementation template, and registering the initial DSA (Default Settlement Asset) vTokens.

This is the initial activation VIP for the Yield+ product. Subsequent VIPs may expand supported trading pairs and DSA options as the product matures.

---

#### Changes

#### 1. Accept Ownership of RelativePositionManager

- **Contract:** RelativePositionManager (0x1525D804DFff218DcC8B9359940F423209356C42)
- **Function:** acceptOwnership()
- **Parameters:** none
- **Effect:** Transfers ownership of the RelativePositionManager contract from its pending owner to the Normal Timelock, completing the two-step ownership handoff and placing the contract under Venus governance control.

#### 2. Grant ACM Permissions to Timelocks and Guardian

- **Contract:** AccessControlManager (BSC Mainnet ACM)
- **Function:** giveCallPermission(address, string, address) — called multiple times
- **Permissions granted:**
  - partialPause() / partialUnpause() — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
  - completePause() / completeUnpause() — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
  - setPositionAccountImplementation(address) — Normal Timelock only
  - setProportionalCloseTolerance(uint256) — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
  - addDSAVToken(address) — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
  - setDSAVTokenActive(uint8, bool) — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
  - executePositionAccountCall(address, address[], bytes[]) — Normal Timelock, Fast Track Timelock, Critical Timelock, Guardian
- **Effect:** Authorizes all three timelocks and the Guardian to manage the Yield+ system — including circuit-breaker (pause/unpause), DSA configuration, and position account operations. The setPositionAccountImplementation permission is restricted to Normal Timelock only, as implementation upgrades require full governance deliberation.

#### 3. Set PositionAccount Implementation

- **Contract:** RelativePositionManager (0x1525D804DFff218DcC8B9359940F423209356C42)
- **Function:** setPositionAccountImplementation(address)
- **Parameters:**
  - implementation: 0xa75C5b438226bc73BDCc83408E7Aa41771b33E2C (PositionAccount)
- **Effect:** Registers the PositionAccount smart contract template. When a user opens their first Yield+ position on a trading pair, a minimal proxy clone of this implementation is automatically deployed as their dedicated position account.

#### 4. Register DSA vTokens (USDC and USDT)

- **Contract:** RelativePositionManager (0x1525D804DFff218DcC8B9359940F423209356C42)
- **Function:** addDSAVToken(address) — called twice
- **Parameters:**
  - vToken 1: 0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8 (vUSDC)
  - vToken 2: 0xfD5840Cd36d94D7229439859C0112a4185BC0255 (vUSDT)
- **Effect:** Registers USDC and USDT (via their Venus vToken wrappers) as supported Default Settlement Assets. Users can choose either stablecoin as their collateral currency and PnL settlement denomination when opening Yield+ positions.

---

#### Summary

If approved, this VIP will:

- Transfer ownership of the RelativePositionManager contract (0x1525D804DFff218DcC8B9359940F423209356C42) to Venus's Normal Timelock
- Grant operational permissions (pause/unpause, DSA management, position account operations) to all timelocks and Guardian via the ACM
- Set the PositionAccount implementation (0xa75C5b438226bc73BDCc83408E7Aa41771b33E2C) for automatic per-user position account deployment
- Register vUSDC and vUSDT as supported DSA collateral assets
- Enable the Venus Yield+ relative performance trading feature on BSC mainnet

---

#### References

- [GitHub PR: VenusProtocol/vips#671](https://github.com/VenusProtocol/vips/pull/671)
- Venus Yield+ Community Post
- [Venus Protocol Documentation](https://docs.venus.io)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      // ACM permissions
      ...giveAcmPermissions("partialPause()"),
      ...giveAcmPermissions("partialUnpause()"),
      ...giveAcmPermissions("completePause()"),
      ...giveAcmPermissions("completeUnpause()"),
      ...giveAcmPermissions("setPositionAccountImplementation(address)", [bscmainnet.NORMAL_TIMELOCK]),
      ...giveAcmPermissions("setProportionalCloseTolerance(uint256)"),
      ...giveAcmPermissions("addDSAVToken(address)"),
      ...giveAcmPermissions("setDSAVTokenActive(uint8,bool)"),
      ...giveAcmPermissions("executePositionAccountCall(address,address[],bytes[])"),
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "setPositionAccountImplementation(address)",
        params: [POSITION_ACCOUNT],
      },
      // Add DSA vTokens (USDC, USDT)
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDC],
      },
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip608;
