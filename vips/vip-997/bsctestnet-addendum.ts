import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ACM, SPOKE_COMPTROLLER } from "./bsctestnet";
import { giveCallPermission } from "./permissions-bsctestnet";

export const CORE_COMPTROLLER = NETWORK_ADDRESSES.bsctestnet.UNITROLLER;

// venus-protocol PR #718 (deploy/019, from PR #707). Owned by the deployer, which has already set the
// pool registry and the Core flash source, so only the flash loan whitelist is left to governance.
export const BSTOCK_LIQUIDATOR = "0x62B5EE2074dF7F5B027d829adF5EC7B69eead569";

// venus-periphery PR #80 redeploys the gateway from PR #78, which carries the HashDit L02 fix. The
// gateway has no proxy, so the fix lands as a new address and the old one's grants move across.
export const NEW_COLLATERAL_GATEWAY = "0x26837e144898D2C5c673FE880e21f83469Ad1Bf4";
export const OLD_COLLATERAL_GATEWAY = "0xbB3304B6a1eB1d48E1d2EE78eadDadD4024DF358";

// The string both Comptrollers pass to their access check, so the same role string serves Core and Spoke.
export const ENTER_MARKET_FOR_ACCOUNT = "enterMarketForAccount(address,address)";

const revokeCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

const setFlashLoanWhitelist = (account: string, allowed: boolean) => ({
  target: CORE_COMPTROLLER,
  signature: "setWhiteListFlashLoanAccount(address,bool)",
  params: [account, allowed],
});

export const vip997Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-997 Addendum [BNB Chain Testnet] Spoke pool: bStock liquidator and CollateralGateway grants",
    description: `#### Summary

Follow-up to VIP-997, which connected the Spoke yield family to the Liquidity Hub (USDT) on BNB Chain
Testnet. This proposal grants what the two Spoke-pool periphery contracts need from governance:

- **BStockLiquidator**, now deployed on testnet with support for the Hub-Funded Spoke pool.
- **CollateralGateway**, redeployed with the fix from its HashDit review. The previous gateway's grants
  are revoked.

#### Actions

1. Whitelist **BStockLiquidator** for Core pool flash loans. On the Spoke pool it borrows the debt asset
   from a Core market, since the Spoke pool has no flash lender of its own.
2. Grant the new **CollateralGateway** \`enterMarketForAccount(address,address)\` on the Core Comptroller.
3. Grant it the same role on the Spoke Comptroller.
4. Whitelist it for Core pool flash loans.
5. Revoke both \`enterMarketForAccount\` roles and the flash loan whitelist from the previous gateway.

#### Notes

- Testnet only.
- BStockLiquidator is owner-operated. Its pool registry and flash source are already set by its owner.
  The swap routers and operators are set later, and liquidations revert until a router is allowlisted.

#### References

- [VIP-997](https://github.com/VenusProtocol/vips/pull/774)
- [BStockLiquidator Spoke support](https://github.com/VenusProtocol/venus-protocol/pull/707) and [its testnet deployment](https://github.com/VenusProtocol/venus-protocol/pull/718)
- [CollateralGateway HashDit fixes](https://github.com/VenusProtocol/venus-periphery/pull/78) and [the testnet redeployment](https://github.com/VenusProtocol/venus-periphery/pull/80)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. The liquidator's Spoke path flash-borrows from Core.
      setFlashLoanWhitelist(BSTOCK_LIQUIDATOR, true),

      // 2-4. The new gateway gets the three grants the old one holds.
      giveCallPermission(ACM, CORE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT, NEW_COLLATERAL_GATEWAY),
      giveCallPermission(ACM, SPOKE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT, NEW_COLLATERAL_GATEWAY),
      setFlashLoanWhitelist(NEW_COLLATERAL_GATEWAY, true),

      // 5. The old gateway lacks the L02 fix, so it loses all three.
      revokeCallPermission(CORE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT, OLD_COLLATERAL_GATEWAY),
      revokeCallPermission(SPOKE_COMPTROLLER, ENTER_MARKET_FOR_ACCOUNT, OLD_COLLATERAL_GATEWAY),
      setFlashLoanWhitelist(OLD_COLLATERAL_GATEWAY, false),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip997Addendum;
