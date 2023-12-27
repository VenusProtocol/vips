import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

export const vip224 = () => {
  const meta = {
    version: "v2",
    title: "VIP-224 Enable forced liquidations of BNB bridge account",
    description: `#### Summary

If passed, this VIP will enable the forced liquidations of the [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) and [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) borrows of the [BNB bridge account](https://bscscan.com/address/0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec), as it was [proposed in the Community forum](https://community.venus.io/t/proposal-bnb-bridge-exploiter-account-remediation/3974). No Market liquidations will happen.

#### Details

After executing the VIP, only the authorized address (see [VIP-99](https://app.venus.io/#/governance/proposal/99)) will be able to (forcibly) liquidate the mentioned positions.

Forced liquidations for individual accounts are available since [VIP-209](https://app.venus.io/#/governance/proposal/209).

VIP simulation: [https://github.com/VenusProtocol/vips/pull/135](https://github.com/VenusProtocol/vips/pull/135)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidationForUser(address,address,bool)",
        params: [EXPLOITER_WALLET, VUSDC, true],
      },
      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidationForUser(address,address,bool)",
        params: [EXPLOITER_WALLET, VUSDT, true],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
