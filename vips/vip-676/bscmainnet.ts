import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CORE_PERMISSIONS_TO_REVOKE, REMOTE_CHAINS, WILDCARD_PERMISSIONS } from "./config";

const { ACCESS_CONTROL_MANAGER, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK, UNITROLLER } =
  NETWORK_ADDRESSES.bscmainnet;

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const NEW_EBRAKE_IMPLEMENTATION = "0x918794Bb15BAc47C8Bbba553e7EE8BB1bD4A0959";
export const BSTOCK_PAUSE_SENTINEL = "0x0beAb536E620D094E1DddFe7f01D310F38390082";
export const KEEPER = "0x57FA23F591203F61cef84A7BC892Df69Ca95C86e";

// Core pool
export const vTSLAB = "0x97421799419Eb782628e73e7220d8E0A207469a3";
export const vNVDAB = "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371";
export const vSPCXB = "0xC36dFaCc7a125859C106F29b9F2d874CCF29A55A";
export const vSKHYB = "0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9";
// bStock index Spoke pool
export const vQQQB = "0xeA32B70f4106d9ef6f0fF95f7422Fa679494c362";
export const vSPYB = "0x259311A868B49CdA457C1843F89D4dDA33be0390";

export const BSTOCK_MARKETS = [vTSLAB, vNVDAB, vSPCXB, vSKHYB, vQQQB, vSPYB];
export const SENTINEL_ADMINS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];

export const vip676 = () => {
  const meta = {
    version: "v2",
    title: "VIP-676 [BNB Chain, Ethereum, Arbitrum One, Base] EBrake upgrade and bStock pause sentinel",
    description: `#### Summary

If this VIP passes, EBrake will be able to act on Spoke pool markets, and a new BStockPauseSentinel will watch every bStock market on BNB Chain. When a bStock's issuer pauses the token, or its compliance module blocks a market, a keeper calls the sentinel, which sets that market's collateral factor to 0 through EBrake. EBrake is also upgraded to the same build on Ethereum, Arbitrum One and Base.

#### Actions

1. Upgrade the **EBrake** proxy to [${NEW_EBRAKE_IMPLEMENTATION}](https://bscscan.com/address/${NEW_EBRAKE_IMPLEMENTATION}). EBrake now acts on each market through that market's own comptroller, so it also covers Spoke pool markets. Core pool behaviour, the Hub pause actions and the storage layout are unchanged.
2. Accept ownership of the **BStockPauseSentinel** at [${BSTOCK_PAUSE_SENTINEL}](https://bscscan.com/address/${BSTOCK_PAUSE_SENTINEL}).
3. Give EBrake the comptroller permissions for the actions both the Core pool and Spoke pools have (pausing actions, the collateral factor and the borrow and supply caps) as wildcards (contract address zero), so they cover every Spoke pool, including ones added later. This replaces the ${
      CORE_PERMISSIONS_TO_REVOKE.length
    } matching per-contract grants on the Core pool comptroller, which are revoked. EBrake's Core-only grants (flash loan pause, pool borrow and flash loan access) stay on the Core pool comptroller.
4. Grant the sentinel \`decreaseCF(address,uint256)\` on EBrake, and the Guardian and the Normal and Fast-track Timelocks the sentinel's \`setTrustedKeeper\` and \`setMarketMonitored\`.
5. Set [${KEEPER}](https://bscscan.com/address/${KEEPER}) as the sentinel's keeper. It is the keeper that already drives DeviationSentinel.
6. Monitor the six bStock markets: vTSLAB, vNVDAB, vSPCXB and vSKHYB in the Core pool, and vQQQB and vSPYB in the bStock index Spoke pool.
7. On Ethereum, Arbitrum One and Base, upgrade **EBrake** to the same build. EBrake's existing grants on each Core pool comptroller already cover it, so no permissions change there:
${REMOTE_CHAINS.map(c => `   - ${c.name}: ${c.newImplementation}`).join("\n")}

#### Notes

- The sentinel only lowers the collateral factor to 0 and keeps the liquidation threshold, so no position becomes liquidatable. Restoring the collateral factor stays with governance.
- DeviationSentinel on the remote chains already runs the current build, so it is not upgraded.
- EBrake and the sentinel were audited by HashDit, and these deployments include the fixes from that audit.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. EBrake upgrade and sentinel ownership
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },
      { target: BSTOCK_PAUSE_SENTINEL, signature: "acceptOwnership()", params: [] },

      // 2. ACM permissions

      // EBrake's comptroller permissions become wildcards
      ...WILDCARD_PERMISSIONS.map(signature => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, signature, EBRAKE],
      })),
      ...CORE_PERMISSIONS_TO_REVOKE.map(signature => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, signature, EBRAKE],
      })),

      // Sentinel permissions
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "decreaseCF(address,uint256)", BSTOCK_PAUSE_SENTINEL],
      },
      ...SENTINEL_ADMINS.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [BSTOCK_PAUSE_SENTINEL, "setTrustedKeeper(address,bool)", account],
      })),
      ...SENTINEL_ADMINS.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [BSTOCK_PAUSE_SENTINEL, "setMarketMonitored(address,bool)", account],
      })),

      // 3. Sentinel keeper and monitored markets
      { target: BSTOCK_PAUSE_SENTINEL, signature: "setTrustedKeeper(address,bool)", params: [KEEPER, true] },
      ...BSTOCK_MARKETS.map(market => ({
        target: BSTOCK_PAUSE_SENTINEL,
        signature: "setMarketMonitored(address,bool)",
        params: [market, true],
      })),

      // 4. Remote chains: EBrake upgrade
      ...REMOTE_CHAINS.map(chain => ({
        target: chain.proxyAdmin,
        signature: "upgrade(address,address)",
        params: [chain.eBrake, chain.newImplementation],
        dstChainId: chain.dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip676;
