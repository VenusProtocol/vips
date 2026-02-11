import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const WBNB_BURN_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";
export const CHAINLINK_OEV_SEARCHER = "0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298";
export const GUARDIAN_2 = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

export const vip591 = () => {
  const meta = {
    version: "v2",
    title: "VIP-591 Add Chainlink OEV Searcher to Flashloan Whitelist and Transfer WBNBBurnConverter Ownership",
    description: `#### Summary

This VIP performs two actions:

1. **Add Chainlink OEV Searcher to Flashloan Whitelist**: As part of our ongoing cooperation with Chainlink to enable OEV (Oracle Extractable Value), Chainlink has requested to whitelist their OEV Searcher address (0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298) to use flashloans for performing liquidations.

2. **Transfer WBNBBurnConverter Ownership to Guardian 2**: Following the cessation of the BNB burn program (VIP-585), we need to transfer ownership of the WBNBBurnConverter contract back to Guardian 2 to withdraw the remaining funds from the converter.

#### Actions

- Whitelist Chainlink OEV Searcher (0x82aC8c837E31D47c6508CBfD4c1627F04dDe5298) for flashloans on the Core Pool
- Transfer ownership of WBNBBurnConverter to Guardian 2 (0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B)`,
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
