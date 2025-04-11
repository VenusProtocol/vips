import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bscmainnet"];
const basemainnet = NETWORK_ADDRESSES["basemainnet"];

// Constructing valid 52-byte affiliateFee
const affiliateBeneficiary = ethers.utils.arrayify(ethers.constants.AddressZero);
const affiliateAmount = ethers.utils.hexZeroPad(ethers.utils.parseEther("0").toHexString(), 32);
export const affiliateFee = ethers.utils.concat([affiliateBeneficiary, affiliateAmount]);

export const BRIDGE_FEES = parseUnits("0.005", 18);
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const BASE_ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const BSCMAINNET_ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const DLNSOURCE_CONTRACT = "0xeF4fB24aD0916217251F553c0596F8Edc630EB66";
export const ETH_AMOUNT_SEND = parseUnits("101", 18);
export const ETH_AMOUNT_RECEIVED = parseUnits("100.99586785", 18);
export const WITHDRAW_ETH_AMOUNT_BASE = parseUnits("100", 18);
export const BASE_CHAIN_ID = 8453; // Base Chain ID
export const BASE_VWETH = "0xEB8A79bD44cF4500943bf94a2b4434c95C008599";
export const BASE_WETH = "0x4200000000000000000000000000000000000006";
export const VTREASURY_BASE = "0xbefD8d06f403222dd5E8e37D2ba93320A97939D1";

export const vip479 = () => {
  const meta = {
    version: "v2",
    title: "VIP-479",
    description:
      "Bootstrapping WETH market on Base with Protocol-OwnedLiquidity(POL), Deposit 100 WETH into the WETH market on Base, using Venus Treasury funds",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BSCMAINNET_ETH, ETH_AMOUNT_SEND, NORMAL_TIMELOCK],
      },
      {
        target: BSCMAINNET_ETH,
        signature: "approve(address,uint256)",
        params: [DLNSOURCE_CONTRACT, ETH_AMOUNT_SEND],
      },
      {
        target: DLNSOURCE_CONTRACT,
        signature:
          "createOrder((address,uint256,bytes,uint256,uint256,bytes,address,bytes,bytes,bytes,bytes),bytes,uint32,bytes)",
        params: [
          [
            BSCMAINNET_ETH,
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
      {
        target: BSCMAINNET_ETH,
        signature: "approve(address,uint256)",
        params: [DLNSOURCE_CONTRACT, 0],
      },
      {
        target: VTREASURY_BASE,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [BASE_WETH, WITHDRAW_ETH_AMOUNT_BASE, basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: BASE_WETH,
        signature: "approve(address,uint256)",
        params: [BASE_VWETH, WITHDRAW_ETH_AMOUNT_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: BASE_VWETH,
        signature: "mintBehalf(address,uint256)",
        params: [VTREASURY_BASE, WITHDRAW_ETH_AMOUNT_BASE],
        dstChainId: LzChainId.basemainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip479;
