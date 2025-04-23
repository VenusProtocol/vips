import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const PESSIMISTIC_AMOUNT = parseUnits("14750", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("15000", 18);
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_AMOUNT_SEND = parseUnits("1", 18);
export const DLNSOURCE_CONTRACT = "0xeF4fB24aD0916217251F553c0596F8Edc630EB66";
export const BASE_WETH = "0x4200000000000000000000000000000000000006";
export const ETH_AMOUNT_RECEIVED = parseUnits("0.9992", 18);
export const BASE_CHAIN_ID = 8453;
export const VTREASURY_BASE = "0xbefD8d06f403222dd5E8e37D2ba93320A97939D1";
export const BRIDGE_FEES = parseUnits("0.005", 18);

// Constructing valid 52-byte affiliateFee
const affiliateBeneficiary = ethers.utils.arrayify(ethers.constants.AddressZero);
const affiliateAmount = ethers.utils.hexZeroPad(ethers.utils.parseEther("0").toHexString(), 32);
export const affiliateFee = ethers.utils.concat([affiliateBeneficiary, affiliateAmount]);

const vip486 = () => {
  const meta = {
    version: "v2",
    title: "VIP-486",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PESSIMISTIC_AMOUNT, PESSIMISTIC_RECEIVER],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF_RECEIVER],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_SEND, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ETH,
        signature: "approve(address,uint256)",
        params: [DLNSOURCE_CONTRACT, ETH_AMOUNT_SEND],
      },
      {
        target: DLNSOURCE_CONTRACT,
        signature:
          "createOrder((address,uint256,bytes,uint256,uint256,bytes,address,bytes,bytes,bytes,bytes),bytes,uint32,bytes)",
        params: [
          [
            ETH,
            ETH_AMOUNT_SEND,
            BASE_WETH,
            ETH_AMOUNT_RECEIVED,
            BASE_CHAIN_ID,
            VTREASURY_BASE,
            VTREASURY_BASE,
            VTREASURY_BASE,
            "0x",
            "0x",
            "0x",
          ],
          affiliateFee,
          0,
          "0x",
        ],
        value: BRIDGE_FEES.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip486;
