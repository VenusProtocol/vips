import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEV_WALLET = "0x48e9d2128321cbf75cd108321459865357c00f15";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0x2367bff367Bc4a83A65EEEe3b9E4D834Ff4f637e";

export const WBNB_AMOUNT_DEV_FUND = parseUnits("1472.197705207413945", 18);
export const ETH_AMOUNT_DEV_FUND = parseUnits("62.069755574301455", 18);
export const BTC_AMOUNT_DEV_FUND = parseUnits("1.702705080868696", 18);
export const USDT_AMOUNT_DEV_FUND = parseUnits("21100", 18);

export const REQUIRED_VUSDC_AMOUNT_FOR_REMAINING_USDC = parseUnits("14046500", 8);
export const USDC_AMOUNT_ON_TREASURY = parseUnits("16777", 18);
export const REMAINING_USDC_AMOUNT = parseUnits("334623", 18);

export const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";

export const ETH_AMOUNT_COMMUNITY_WALLET = parseUnits("1.188225443", 18);
export const USDT_AMOUNT_COMMUNITY_WALLET = parseUnits("10518.73", 18);
export const BNB_AMOUNT_COMMUNITY_WALLET = parseUnits("3", 18);

export const vip304 = () => {
  const meta = {
    version: "v2",
    title: "VIP-304 to transfer the following amounts from the Venus Treasury to the wallet",
    description: `This vip will transfer : 
      - 1,472.197705207413945 BNB
      - 351,400 USDC
      - 62.069755574301455 ETH
      - 21,100 USDT
      - 1.702705080868696 BTC
      to Wallet (0x48e9d2128321cbf75cd108321459865357c00f15)
    `,
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
        params: [USDC, USDC_AMOUNT_ON_TREASURY, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, REQUIRED_VUSDC_AMOUNT_FOR_REMAINING_USDC, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, DEV_WALLET, REMAINING_USDC_AMOUNT, bscmainnet.VTREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_DEV_FUND, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT_DEV_FUND, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT_DEV_FUND, DEV_WALLET],
      },

      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
