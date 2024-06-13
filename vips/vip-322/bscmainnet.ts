import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ARBITRUM_ONE_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const BRIDGE_FEES = parseUnits("0.05", 18); // value bigger than real estimated fees(0.0005)
export const XVS_AMOUNT = parseUnits("30000", 18);
const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_ONE_VTREASURY]);
const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const DEST_CHAIN_ID = 110;

export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const ETH_AMOUNT_WALLET = parseUnits("5", 18);
export const XVS_AMOUNT_WALLET = parseUnits("1500", 18);
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

const vip322 = () => {
  const meta = {
    version: "v2",
    title: "VIP-322 Bootstrap XVS liquidity for the Arbitrum one rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [COMMUNITY_WALLET, XVS_AMOUNT_WALLET],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BRIDGE_FEES, NORMAL_TIMELOCK],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_WALLET, COMMUNITY_WALLET],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip322;
