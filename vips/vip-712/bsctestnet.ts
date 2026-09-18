import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-712/utils/cut-params-bsctestnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;

export const cutParams = params;

// Access Control Manager on BNB Chain Testnet.
export const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;

// Core pool Comptroller (Diamond proxy).
export const UNITROLLER = bsctestnet.UNITROLLER;

// PrimeV2 proxy. Its admin slot holds PRIME_PROXY_ADMIN, whose owner is the Normal Timelock.
export const PRIME = "0xeC22366d2572e52BCB29B50C905b945BA421B9b2";
export const PRIME_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

// TODO: replace with the deployed PrimeV2 implementation address
export const PRIME_NEW_IMPLEMENTATION = "0x0000000000000000000000000000000000000000";

// TODO: replace with the deployed MarketFacet address, here and in
// simulations/vip-712/utils/cut-params-bsctestnet.json
export const NEW_MARKET_FACET = "0x0000000000000000000000000000000000000000";

// TODO: replace with the deployed CollateralGateway address
export const COLLATERAL_GATEWAY = "0x0000000000000000000000000000000000000000";

export const ENTER_MARKET_FOR_ACCOUNT_SIGNATURE = "enterMarketForAccount(address,address)";

export const vip712 = () => {
  const meta = {
    version: "v2",
    title: "VIP-712 [BNB Chain Testnet] Prime upgrade and leveraged position migration support",
    description: `#### Summary

If passed, this VIP will upgrade the PrimeV2 implementation on BNB Chain Testnet, upgrade the MarketFacet of the core pool Comptroller to add \`enterMarketForAccount\`, and authorize the CollateralGateway to enter markets for users and to initiate flash loans.

#### Description

1. **Upgrade the PrimeV2 implementation** — Calls \`upgrade(${PRIME}, ${PRIME_NEW_IMPLEMENTATION})\` on the PrimeV2 ProxyAdmin ([${PRIME_PROXY_ADMIN}](https://testnet.bscscan.com/address/${PRIME_PROXY_ADMIN})).

2. **Upgrade the Comptroller MarketFacet** — Calls \`diamondCut\` on the core pool Comptroller ([${UNITROLLER}](https://testnet.bscscan.com/address/${UNITROLLER})), replacing the 31 selectors currently routed to the MarketFacet and adding \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` (\`0x2e30a93c\`).

3. **Grant the CollateralGateway permission to enter markets for a user** — Calls \`giveCallPermission\` on the AccessControlManager ([${ACM}](https://testnet.bscscan.com/address/${ACM})) for \`${ENTER_MARKET_FOR_ACCOUNT_SIGNATURE}\` on the Comptroller.

4. **Whitelist the CollateralGateway as a flash loan account** — Calls \`setWhiteListFlashLoanAccount(gateway, true)\` on the Comptroller.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [Prime and Comptroller changes](https://github.com/VenusProtocol/venus-protocol/pull/710)
- [CollateralGateway](https://github.com/VenusProtocol/venus-periphery/pull/74)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Point the PrimeV2 proxy at the new implementation.
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
