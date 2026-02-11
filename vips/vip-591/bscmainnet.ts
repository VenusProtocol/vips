import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const WBNB_BURN_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";
export const CHAINLINK_OEV_SEARCHER = "0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298";
export const GUARDIAN_2 = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

export const vip591 = () => {
  const meta = {
    version: "v2",
    title: "VIP-591 [BNB Mainnet] Flashloan Whitelist Update and WBNB Burn Converter Ownership Transfer",
    description: `#### Summary

This proposal is informed by the Venus community forum publication [Flashloan Whitelist Update and WBNB Burn Converter Ownership Transfer](https://community.venus.io/t/venus-community-proposal-two-vendor-oev-integration-framework/5657) and covers two operational updates.

1. **Flashloan Whitelist Update**: Following the [Venus Community Proposal: Two-Vendor OEV Integration Framework](https://community.venus.io/t/venus-community-proposal-two-vendor-oev-integration-framework/5657), an additional Chainlink-operated address is proposed to be added to the Venus flashloan whitelist. This address will be used for OEV-enabled liquidations and follows prior coordination on OEV integration within Venus.

2. **WBNBBurnConverter Ownership Transfer**: With the decision to [discontinue the Venus BNB Burn](https://community.venus.io/t/week-4-vip-2026-cessation-of-bnb-burn-and-reward-distribution-eligibility/5654/2), the WBNBBurnConverter contract is no longer required for active operations. To complete this transition, ownership of the contract will be transferred back to the Venus Guardian multisig. Any remaining funds held by the contract may be withdrawn at a later date after the ownership transfer is complete.

#### Actions

1. **Flashloan Whitelist Update**
  - Add the following address to the Venus flashloan whitelist: Chainlink OEV Searcher: [0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298](https://bscscan.com/address/0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298)
  - Enable the use of Venus flashloans by Chainlink for OEV-enabled liquidation activities

2. **WBNBBurnConverter Ownership Transfer**
  - Transfer ownership of the WBNBBurnConverter contract to the Venus Guardian multisig. New Owner (Guardian 2): [0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B](https://bscscan.com/address/0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B)
  - Allow for the future withdrawal of any remaining funds from the WBNBBurnConverter after ownership transfer

If approved, this VIP authorizes the flashloan whitelist update to support Chainlink OEV liquidations and completes the operational transition associated with the discontinuation of the Venus BNB burn mechanism.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [CHAINLINK_OEV_SEARCHER, true],
      },
      {
        target: WBNB_BURN_CONVERTER,
        signature: "transferOwnership(address)",
        params: [GUARDIAN_2],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip591;
