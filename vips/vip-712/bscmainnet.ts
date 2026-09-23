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

// TODO: replace with the deployed PrimeV2 implementation address
export const PRIME_NEW_IMPLEMENTATION = "0x0000000000000000000000000000000000000000";

// TODO: replace with the deployed MarketFacet address, here and in
// simulations/vip-712/utils/cut-params-bscmainnet.json
export const NEW_MARKET_FACET = "0x0000000000000000000000000000000000000000";

// TODO: replace with the deployed CollateralGateway address
export const COLLATERAL_GATEWAY = "0x0000000000000000000000000000000000000000";

export const ENTER_MARKET_FOR_ACCOUNT_SIGNATURE = "enterMarketForAccount(address,address)";

export const vip712 = () => {
  const meta = {
    version: "v2",
    title: "VIP-712 [BNB Chain] Prime upgrade and leveraged position migration support",
    description: `#### Summary

If passed, this VIP will upgrade the Prime implementation on BNB Chain, upgrade the MarketFacet of the core pool Comptroller to add \`enterMarketForAccount\`, and authorize the CollateralGateway to enter markets for users and to initiate flash loans.

#### Description

1. **Upgrade the Prime implementation** — Calls \`upgrade(${PRIME}, ${PRIME_NEW_IMPLEMENTATION})\` on the Prime ProxyAdmin ([${PRIME_PROXY_ADMIN}](https://bscscan.com/address/${PRIME_PROXY_ADMIN})). The ProxyAdmin is owned by the Normal Timelock, so no ownership handoff is needed.

2. **Upgrade the Comptroller MarketFacet** — Calls \`diamondCut\` on the core pool Comptroller ([${UNITROLLER}](https://bscscan.com/address/${UNITROLLER})), replacing the 31 selectors currently routed to the MarketFacet and adding one new selector, \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` (\`0x2e30a93c\`).

3. **Grant the CollateralGateway permission to enter markets for a user** — Calls \`giveCallPermission\` on the AccessControlManager ([${ACM}](https://bscscan.com/address/${ACM})), allowing the CollateralGateway to call \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` on the Comptroller. This follows the diamond cut, because the selector is not routed before it.

4. **Whitelist the CollateralGateway as a flash loan account** — Calls \`setWhiteListFlashLoanAccount(gateway, true)\` on the Comptroller. The core pool flash loan feature is live and the Comptroller only allows whitelisted accounts to initiate flash loans, so without this the leveraged position migration reverts. The Normal Timelock already holds this permission, so no ACM grant is required for it.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [Prime and Comptroller changes](https://github.com/VenusProtocol/venus-protocol/pull/710)
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip712;
