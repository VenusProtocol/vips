import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";
const LIQUIDATE_AND_REDEEM_HELPER = "0xa569524A42E28580d5A5B1BdB847517BA0000ffE";
const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const VUSDC_AMOUNT = parseUnits("326081635.9401868", 8);

export const vip269 = () => {
  const meta = {
    version: "v1",
    title: "VIP-269 Partial liquidation of the BNB bridge exploiter account",
    description: `#### Summary

Following the [proposal published in the community forum](https://community.venus.io/t/move-bad-debt-from-the-current-debtors-to-the-bnb-bridge-exploiter-account-to-eliminate-remaining-shortfall/4071/5), if passed, this VIP will perform the following actions:

- Redeem 326,081,635.9401868 [vUSDC](https://bscscan.com/address/0xeca88125a5adbe82614ffc12d0db554e2e2867c8) held by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9), getting around 7.6M USDC
- Liquidate the [BNB bridge exploiter account](https://bscscan.com/address/0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec) repaying part of its [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) debt, using 100% of the USDC tokens obtained in the previous step. The seized tokens will be [vBNB](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36)
- Redeem 100% of the seized vBNB tokens and transfer them to an [OTC provider](https://bscscan.com/address/0x6657911f7411765979da0794840d671be55ba273), to be converted into USDC that will be sent to the Venus Treasury in the following days

#### Description

After executing the VIP:

- The balance of vUSDC in the Treasury will be zero
- The USDC debt of the BNB bridge exploiter will be reduced by (around) 7.6M USDC
- Around $8.36M in BNB will have been transferred to the OTC provider, that will convert them to USDC and send them to the Venus Treasury in the following days

Review the full plan regarding the liquidation of the BNB exploiter account in the above publication.

This VIP uses two contracts to complete the commands:

- [TokenRedeemer](https://bscscan.com/address/0x67B10f3BC6B141D67c598C73CEe45E6635292Acd). It is used to redeem the vUSDC and transfer 100% of the withdrawn underlying tokens to another contract (in this case the Temporary Liquidator contract)
- [Temporary Liquidator contract for the Core pool](https://bscscan.com/address/0xa569524A42E28580d5A5B1BdB847517BA0000ffE). It doesn’t split the fees between the liquidator agent and the protocol, it redeems the seized vTokens, and it transfers 100% of the withdrawn underlying tokens to an address (in this case the OTC provider)

The owner of both contracts is the [Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396). They won’t hold any tokens after the VIP execution. The last command of the VIP restores the [original Liquidator contract](https://bscscan.com/address/0x0870793286aaDA55D39CE7f82fb2766e8004cF43) in the Core pool.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/202)
- [TokenRedeemer contract](https://bscscan.com/address/0x67B10f3BC6B141D67c598C73CEe45E6635292Acd)
- [Temporary Liquidator contract](https://bscscan.com/address/0xa569524A42E28580d5A5B1BdB847517BA0000ffE)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VUSDC, LIQUIDATE_AND_REDEEM_HELPER],
      },
      {
        target: COMPTROLLER,
        signature: "_setLiquidatorContract(address)",
        params: [LIQUIDATE_AND_REDEEM_HELPER],
      },
      {
        target: LIQUIDATE_AND_REDEEM_HELPER,
        signature: "liquidateAndRedeemNative(address,address,address)",
        params: [EXPLOITER_WALLET, VUSDC, BINANCE_WALLET],
      },
      {
        target: COMPTROLLER,
        signature: "_setLiquidatorContract(address)",
        params: [LIQUIDATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip269;
