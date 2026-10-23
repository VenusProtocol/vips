import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// Addendum to VIP-712 (./bsctestnet.ts), which was executed as testnet proposal 718. It sets the
// ComptrollerLens that the mainnet VIP-712 sets in the same proposal as the Prime upgrade.

export const UNITROLLER = NETWORK_ADDRESSES.bsctestnet.UNITROLLER;

export const NEW_COMPTROLLER_LENS = "0x671c262a4FA3A408C303279600D664f91bf57Fd2";
export const OLD_COMPTROLLER_LENS = "0x0Dab769617B2d690DDbe8A6D730D9C9b85F26ca0";

export const vip712Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-712 Addendum [BNB Chain Testnet] ComptrollerLens upgrade",
    description: `#### Summary

If passed, this VIP will point the core pool Comptroller on BNB Chain Testnet at a new ComptrollerLens that computes liquidation seize amounts with a single division.

#### Description

Calls \`_setComptrollerLens(${NEW_COMPTROLLER_LENS})\` on the core pool Comptroller ([${UNITROLLER}](https://testnet.bscscan.com/address/${UNITROLLER})). The current lens rounds the seize ratio to 18 decimals before applying the repay amount, which drops part or all of the seized collateral when the borrowed asset has a small price mantissa, such as a 24-decimal token. The new lens multiplies first and divides once. The Comptroller admin is the Normal Timelock, so no ACM grant is required.

#### Deployed contracts

- **ComptrollerLens** (replaces [${OLD_COMPTROLLER_LENS}](https://testnet.bscscan.com/address/${OLD_COMPTROLLER_LENS})): [${NEW_COMPTROLLER_LENS}](https://testnet.bscscan.com/address/${NEW_COMPTROLLER_LENS})

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/764)
- [ComptrollerLens fix](https://github.com/VenusProtocol/venus-protocol/commit/2d23a1df3d05b098d4e746d876fd16eb7828a79a)
- [ComptrollerLens deployment](https://github.com/VenusProtocol/venus-protocol/pull/720)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
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

export default vip712Addendum;
