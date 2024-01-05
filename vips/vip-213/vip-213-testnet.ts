import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";
export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const SEPOLIA_TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const BNB_TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [SEPOLIA_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("435000", 18);
export const DEST_CHAIN_ID = 10161;

export const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

export const BTC_AMOUNT = parseUnits("0.3", 18);
export const ETH_AMOUNT = parseUnits("5", 18);
export const USDC_AMOUNT = parseUnits("20000", 6);
export const USDT_AMOUNT = parseUnits("20000", 6);

export const vip213Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to destination chain",
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
        value: "300000000000000000",
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
