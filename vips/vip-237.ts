import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

const DAI = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";

export const vip237 = () => {
  const meta = {
    version: "v2",
    title: "VIP-237 Treasury management",
    description: `If passed, this VIP will transfer from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) 296,719 DAI to [Binance](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273) ($296,719 approximately)

These tokens will be converted to USDC and sent back to the Venus Treasury. The received USDC tokens will be partially used to fund the Prime program with a different VIP in the future.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [DAI, parseUnits("296719.647459765628937553", 18), BINANCE_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
