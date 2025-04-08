import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEV_WALLET = "0x48e9d2128321cbf75cd108321459865357c00f15";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

/**
 * Prices (2025/04/08):
 * BTC: $77,630
 * BNB: $554
 * ETH: $1,493
 *
 * Total funding: $1,700,000
 *
 * BTC: 5% -> $85,000 -> 1.095 BTC
 * BNB: 31% -> $527,000 -> 951.26 BNB
 * ETH: 11% -> $187,000 -> 125.25 ETH
 * USDC: 53% -> $901,000 -> 901,000 USDC
 */
export const BTC_AMOUNT_DEV_FUND = parseUnits("1.095", 18); // $85,000, assuming 1 BTC = $77,630
export const WBNB_AMOUNT_DEV_FUND = parseUnits("951.26", 18); // $527,000, assuming 1 BNB = $554
export const ETH_AMOUNT_DEV_FUND = parseUnits("125.25", 18); // $187,000, assuming 1 ETH = $1,493
export const USDC_AMOUNT_DEV_FUND = parseUnits("901000", 18); // $901,000, assuming 1 USDC = $1

export const REQUIRED_VUSDC_FOR_USDC_DEV_FUND = parseUnits("35293580", 8); // assuming 1 USDC=39.171564 vUSDC

export const vip475 = () => {
  const meta = {
    version: "v2",
    title: "VIP-475 H2-2024 Development Funding",
    description: `#### Summary`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT_DEV_FUND, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT_DEV_FUND],
      },
      {
        target: DEV_WALLET,
        signature: "",
        params: [],
        value: WBNB_AMOUNT_DEV_FUND.toString(),
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, REQUIRED_VUSDC_FOR_USDC_DEV_FUND, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, DEV_WALLET, USDC_AMOUNT_DEV_FUND, bscmainnet.VTREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_DEV_FUND, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT_DEV_FUND, DEV_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip475;
