import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ZKSYNCMAINNET_TREASURY = "0xB2e9174e23382f7744CebF7e0Be54cA001D95599";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ZKSYNCMAINNET_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("31500", 18);
export const DEST_CHAIN_ID = LzChainId.zksyncmainnet;

export const vip368 = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to destination chain(ZKsync mainnet)",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this transfer for XVS",
    againstDescription: "I do not think that Venus Protocol should proceed with this transfer for XVS",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this transfer for XVS",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
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
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "70000000000000000",
      },
      // Transfer 5 ETH to the Community wallet
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, parseUnits("5", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip368;
