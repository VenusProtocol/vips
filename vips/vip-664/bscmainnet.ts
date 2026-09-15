import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
  giveCallPermission,
} from "./permissions-bscmainnet";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK } =
  NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, GUARDIAN, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK };

// The routine operator, same account vip-650 granted the Hub operator surface to.
export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// PLACEHOLDER — Set to the Critical Guardian until the real keeper address exists;
export const KEEPER = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";

// ---------------------------------------------------------------------------------------------------
// Live Hub stack (deployed, verified on chain).
// ---------------------------------------------------------------------------------------------------
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";

// ---------------------------------------------------------------------------------------------------
// Centrifuge's live BNB Chain deployment.
// ---------------------------------------------------------------------------------------------------
export const CENTRIFUGE_BASE_MANAGER = "0xF48256AbDDf96EcDDc4B3DbD23E8C1921f9761Ae";

export const JTRSY_VAULT = "0x6e6B8498415083a4386BE83DD59Edd4366402FFa";
export const JTRSY_SHARE = "0xa5d465251fBCc907f5Dd6bB2145488DFC6a2627b";
export const JTRSY_POOL_ID = "281474976710662";
export const JTRSY_SHARE_CLASS_ID = "0x00010000000000060000000000000001";

export const JAAA_VAULT = "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99";
export const JAAA_SHARE = "0x58F93d6b1EF2F44eC379Cb975657C132CBeD3B6b";
export const JAAA_POOL_ID = "281474976710663";
export const JAAA_SHARE_CLASS_ID = "0x00010000000000070000000000000001";

// ---------------------------------------------------------------------------------------------------
// The Centrifuge YieldGroup family, deployed on BNB Chain.
// ---------------------------------------------------------------------------------------------------
export const ADAPTER_CENTRIFUGE = "0x680cE4422264ecDAd3590cB50FE254D4c153f427";
export const CENTRIFUGE_BEACON = "0xAe90Cfb3E2Bc97508F58E7e076Acf38f3bfC820f";
export const YIELD_GROUP_CENTRIFUGE_IMPL = "0x4996aa488f5269B5C544Dab1C2d1126F6bBdFF24";
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";

// ---------------------------------------------------------------------------------------------------
// Caps for Hub.addYieldGroup(source, absoluteCap, percentageCapBps).
// ---------------------------------------------------------------------------------------------------
export const PERCENTAGE_CAP_DISABLED = 10_000;
export const CENTRIFUGE_ABSOLUTE_CAP = parseUnits("5000000", 18).toString();
export const CENTRIFUGE_PERCENTAGE_CAP_BPS = 2_000; // 20% of TVL

export const CENTRIFUGE_RESOURCES = [JTRSY_VAULT, JAAA_VAULT];

export const OUTER_WITHDRAW_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT];

export const vip664Mainnet = () => {
  const meta = {
    version: "v2",
    // Placeholder number, set for real once the proposal is filed.
    title: "VIP-668 [BNB Chain] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup",
    description: `#### Summary

Onboards the **Centrifuge YieldGroup** to the Liquidity Hub (USDT) on BNB Chain: grants the ACM roles
on the newly deployed source, registers Centrifuge's two live BNB Chain funds — **JTRSY** and **JAAA** —
behind **AdapterCentrifuge**, and adds the group to the Hub.

Centrifuge is the first **asynchronous** yield source on the Hub. Deposits and redemptions are escrowed
and settled later by the fund manager at a published NAV, so the group adds request, cancel and claim
operations that the synchronous \`IYieldGroupBase\` surface has no way to express.

#### The two funds

Both are live ERC-7540 vaults on BNB Chain denominated in USDT, sharing one Centrifuge
AsyncRequestManager. Both share tokens are 6-decimal while USDT is 18-decimal, which the adapter
handles by reading decimals off the vault rather than assuming them.

| Fund | Vault | Share |
| --- | --- | --- |
| JTRSY | \`${JTRSY_VAULT}\` | \`${JTRSY_SHARE}\` |
| JAAA | \`${JAAA_VAULT}\` | \`${JAAA_SHARE}\` |

#### Value defence

The group ships one opt-in defence: a **NAV guard**, a band around the value each fund reports, held
to an anchor that drifts at a rate governance publishes. A value outside the band is reported at the
edge of the band; it never reverts and never pauses the Hub. **It is not armed by this proposal** —
each fund needs a sizing decision against observed NAV behaviour, and an over-tight band misreports
the position on every Hub read. The roles are granted here so arming them later needs no further VIP.

Centrifuge publishes no rate on chain, so the reported APY comes from \`setSpotAPYBps\`, which
governance sets per fund. It is left at zero here.

#### Actions (one atomic transaction, in order)

1. Grant the gated surface of **CentrifugeSource_USDT**: the full set to the **Normal Timelock**, the
   routine surface to the **Operator**, the four claim functions to the **Keeper** that sweeps settled
   redemptions daily, and containment only to the **Guardian**. The Guardian gets no unpause, so it can
   contain but never undo a governance-ordered pause.
2. Register both funds on the source behind **AdapterCentrifuge** (\`addResource\`), then set the
   source's inner deposit and withdraw queues.
3. Register the group on the Hub with an absolute cap of 5,000,000 USDT and a 20% cap on TVL.
4. Append Centrifuge to the **end** of the Hub's withdraw cascade, leaving the existing order and the
   deposit queue untouched. Routine flow is Operator \`reallocate\` in, and back to Core once a redemption
   has been claimed, so a multi-day settlement never sits in the path of a user withdrawal; the queue
   entry is a backstop that can only ever pull an already-settled redemption.

#### References

- The BNB Chain Testnet proposal that onboarded the Centrifuge YieldGroup
- HashDit audit of the Centrifuge YieldGroup`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...CENTRIFUGE_GOVERNANCE.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, NORMAL_TIMELOCK)),
      ...CENTRIFUGE_OPERATOR.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, OPERATOR)),
      ...CENTRIFUGE_CLAIMS.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, KEEPER)),
      ...CENTRIFUGE_GUARDIAN.map(sig => giveCallPermission(ACM, CENTRIFUGE_SOURCE_USDT, sig, GUARDIAN)),
      ...CENTRIFUGE_RESOURCES.map(resource => ({
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "addResource(address,address)",
        params: [resource, ADAPTER_CENTRIFUGE],
      })),
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerDepositQueue(address[])",
        params: [CENTRIFUGE_RESOURCES],
      },
      {
        target: CENTRIFUGE_SOURCE_USDT,
        signature: "setInnerWithdrawQueue(address[])",
        params: [CENTRIFUGE_RESOURCES],
      },
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_ABSOLUTE_CAP, CENTRIFUGE_PERCENTAGE_CAP_BPS],
      },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_WITHDRAW_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664Mainnet;
