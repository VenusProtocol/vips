import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-712/utils/cut-params-bscmainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const cutParams = params;

// Access Control Manager on BNB Chain.
export const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;

// Core pool Comptroller (Diamond proxy).
export const UNITROLLER = bscmainnet.UNITROLLER;

// Prime proxy. Its admin slot holds PRIME_PROXY_ADMIN, whose owner is the Normal Timelock.
export const PRIME = "0x059EabA8676b03e4e8f009eFb7F587C28450F50f";
export const PRIME_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";

export const PRIME_NEW_IMPLEMENTATION = "0xb61137934C9D52cF3ebe9BCe92586DcA048b5F88";

export const NEW_MARKET_FACET = "0x935905A58E91a406eead60cd9AAbC7a64EDAe264";
export const OLD_MARKET_FACET = "0x21f8E1471b153f49BE1d645A008E4a57434eEd23";

export const COLLATERAL_GATEWAY = "0xd0F7B94BF06675D13e8bA9a2546835a1c32a80b8";

export const NEW_COMPTROLLER_LENS = "0x989DaAa33b9557EacB2AF9885d7f3cd28eD52749";
export const OLD_COMPTROLLER_LENS = "0xd5DEb631cB6c6a667e926a482aadc95a471b120c";
export const PRIME_LENS = "0x645B99bDBD9e9125740907B17F19a3ca8544Bc83";

export const ENTER_MARKET_FOR_ACCOUNT_SIGNATURE = "enterMarketForAccount(address,address)";

export const vip712 = () => {
  const meta = {
    version: "v2",
    title: "VIP-712 [BNB Chain] Prime upgrade and leveraged position migration support",
    description: `#### Summary

If passed, this VIP will upgrade the Prime implementation on BNB Chain, upgrade the MarketFacet of the core pool Comptroller to add \`enterMarketForAccount\`, authorize the CollateralGateway to enter markets for users and to initiate flash loans, and point the core pool Comptroller at a new ComptrollerLens that computes liquidation seize amounts with a single division.

#### Description

1. **Upgrade the Prime implementation** — Calls \`upgrade(${PRIME}, ${PRIME_NEW_IMPLEMENTATION})\` on the Prime ProxyAdmin ([${PRIME_PROXY_ADMIN}](https://bscscan.com/address/${PRIME_PROXY_ADMIN})). The ProxyAdmin is owned by the Normal Timelock, so no ownership handoff is needed.

2. **Upgrade the Comptroller MarketFacet** — Calls \`diamondCut\` on the core pool Comptroller ([${UNITROLLER}](https://bscscan.com/address/${UNITROLLER})), replacing the 31 selectors currently routed to the MarketFacet and adding one new selector, \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` (\`0x2e30a93c\`).

3. **Grant the CollateralGateway permission to enter markets for a user** — Calls \`giveCallPermission\` on the AccessControlManager ([${ACM}](https://bscscan.com/address/${ACM})), allowing the CollateralGateway to call \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` on the Comptroller. This follows the diamond cut, because the selector is not routed before it.

4. **Whitelist the CollateralGateway as a flash loan account** — Calls \`setWhiteListFlashLoanAccount(gateway, true)\` on the Comptroller. The core pool flash loan feature is live and the Comptroller only allows whitelisted accounts to initiate flash loans, so without this the leveraged position migration reverts. The Normal Timelock already holds this permission, so no ACM grant is required for it.

5. **Set the new ComptrollerLens** — Calls \`_setComptrollerLens(${NEW_COMPTROLLER_LENS})\` on the Comptroller. The current lens rounds the seize ratio to 18 decimals before applying the repay amount, which drops part or all of the seized collateral when the borrowed asset has a small price mantissa, such as a 24-decimal token. The new lens multiplies first and divides once. The Comptroller admin is the Normal Timelock, so no ACM grant is required for it.

#### Deployed contracts

- **Prime implementation**: [${PRIME_NEW_IMPLEMENTATION}](https://bscscan.com/address/${PRIME_NEW_IMPLEMENTATION})
- **MarketFacet** (replaces [${OLD_MARKET_FACET}](https://bscscan.com/address/${OLD_MARKET_FACET})): [${NEW_MARKET_FACET}](https://bscscan.com/address/${NEW_MARKET_FACET})
- **CollateralGateway**: [${COLLATERAL_GATEWAY}](https://bscscan.com/address/${COLLATERAL_GATEWAY})
- **ComptrollerLens** (replaces [${OLD_COMPTROLLER_LENS}](https://bscscan.com/address/${OLD_COMPTROLLER_LENS})): [${NEW_COMPTROLLER_LENS}](https://bscscan.com/address/${NEW_COMPTROLLER_LENS})
- **PrimeLens** (no governance action, reads the upgraded Prime): [${PRIME_LENS}](https://bscscan.com/address/${PRIME_LENS})

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/764)
- [Prime and Comptroller changes](https://github.com/VenusProtocol/venus-protocol/pull/710)
- [ComptrollerLens fix](https://github.com/VenusProtocol/venus-protocol/commit/2d23a1df3d05b098d4e746d876fd16eb7828a79a)
- [Prime implementation, MarketFacet, ComptrollerLens and PrimeLens deployments](https://github.com/VenusProtocol/venus-protocol/pull/720)
- [CollateralGateway](https://github.com/VenusProtocol/venus-periphery/pull/74)

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Point the Prime proxy at the new implementation.
      {
        target: PRIME_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME, PRIME_NEW_IMPLEMENTATION],
      },
      // 2. Replace the 31 MarketFacet selectors and add enterMarketForAccount.
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      // 3. Let the gateway enter markets on a user's behalf. Must follow the cut above.
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE, COLLATERAL_GATEWAY],
      },
      // 4. Let the gateway initiate core pool flash loans.
      {
        target: UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [COLLATERAL_GATEWAY, true],
      },
      // 5. Replace the ComptrollerLens used for liquidity and seize calculations.
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip712;
