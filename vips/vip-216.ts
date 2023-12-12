import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DESTINATION_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";
const BUSD_AMOUNT = "125281198522370512074148";

export const vip216 = () => {
  const meta = {
    version: "v2",
    title: "VIP-216: Conversion of BUSD to USDT to Mitigate BUSD Depreciation Risks",
    description: `
    #### Summary

    If passed, this VIP will transfer 125,281.2 BUSD from the [Community Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
    to [Binance](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273), 
    where it will be exchanged for USDT. The converted USDT will then be sent back to the Community Treasury.

    #### Details
    The Community Treasury currently holds [125,281.2 BUSD](https://bscscan.com/token/0xe9e7cea3dedca5984780bafc599bd69add087d56?a=0xf322942f644a996a617bd29c16bd7d231d9f35e9) (block 34286811).
    This VIP will withdraw all available balances to Binance for the conversion to USDT. The converted USDT will then be redeposited into our Treasury.

    It's important to note that this VIP does not include the [147,085.4 BUSD](https://bscscan.com/token/0x95c78222b3d6e262426483d42cfa53685a67ab9d?a=0xf322942f644a996a617bd29c16bd7d231d9f35e9) currently held in vBUSD.
    These funds will be claimed after [VIP-215](https://app.venus.io/#/governance/proposal/215) is executed and will be later sent to Binance for the conversion to USDT in another VIP.

    **The proposed process is as follows:**

    1. Withdraw 125,281.2 BUSD from the Community Treasury ([0xf322942f644a996a617bd29c16bd7d231d9f35e9](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)) to Binance ([0x6657911F7411765979Da0794840D671Be55bA273](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273))
    2. Convert the withdrawn BUSD into USDT through Binance.
    3. Redeposit the converted USDT back into the Community Treasury.

    #### References

    - [VIP-215 BUSD debt mitigation](https://app.venus.io/#/governance/proposal/215)
    - [Binance will cease support for BUSD products on 2023-12-15](https://www.binance.com/en/support/announcement/notice-regarding-the-removal-of-busd-and-conversion-of-busd-to-fdusd-1c98ce7bb464422dbbaeda7066ae445b)`,

    forDescription: "Authorize the withdrawal and conversion of BUSD to USDT",
    againstDescription: "Do not authorize this action",
    abstainDescription: "Neutral stance on the decision",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BUSD, BUSD_AMOUNT, DESTINATION_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
