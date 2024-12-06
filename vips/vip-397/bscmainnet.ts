import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SLISBNB_VTOKEN = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const WBNB_VTOKEN = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";
export const BNBX_VTOKEN = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
export const ANKRBNB_VTOKEN = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
export const LST_BNB_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";

export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const BNBX = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
export const BNBX_ORACLE = "0x94f30dC18D12C210E5ae32752B1033afdd89D5DB";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

const vip397 = () => {
  const meta = {
    version: "v2",
    title: "VIP-397 BNBx Oracle implementation upgrade",
    description: `#### Summary

This proposal, if approved, will upgrade the implementation of the BNBx Oracle contract on Venus from version 1 (V1) to version 2 (V2), aligning with the latest BNBx stake manager contract recently deployed by Stader Labs.

#### Description

Stader Labs has updated their ecosystem by migrating several of their key contracts, including the stake manager contract associated with BNBx. As part of this migration, a new price oracle contract has been introduced for BNBx, designed to improve reliability and compatibility with the updated infrastructure.

The proposed upgrade involves replacing the existing BNBx Oracle contract on Venus with the new V2 contract to ensure continued accuracy in pricing and compatibility with the underlying infrastructure.

This upgrade does not modify the protocol’s functionality beyond the scope of the oracle and its interaction with the broader ecosystem. Key features of the V2 contract include:

- Improved price accuracy mechanisms.
- Compatibility with Stader Labs’ latest deployment architecture.

#### Security and additional considerations

To ensure the safety and reliability of this upgrade, the following measures were taken:

* **Behavior Validation in Simulation Environment**
    
    The upgraded oracle contract was extensively tested in a simulation environment. Tests confirmed that the price feed accuracy and update frequency function as intended, with no discrepancies observed post-upgrade.
    
* **Independent Audits by Stader Labs**
    
    Stader Labs conducted security audits of the V2 oracle contract as part of their migration process, ensuring that all vulnerabilities identified in prior versions were addressed.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNBX,
            [BNBX_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[SLISBNB_VTOKEN, ANKRBNB_VTOKEN, WBNB_VTOKEN], [Actions.BORROW], false],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[BNBX_VTOKEN], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], false],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip397;
