import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const XVS_VAULT_REWARDS_SPEED = "52083333333333334"; // 1,500 XVS/day
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ARBITRUM_ONE_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";

export const XVS_AMOUNT_TO_BRIDGE = parseUnits("4500", 18);
export const XVS_VAULT_TREASURY_RELEASE_AMOUNT = parseUnits("79822", 18);
const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_ONE_VTREASURY]);
const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.05", 18);

export const vip379 = () => {
  const meta = {
    version: "v2",
    title: "VIP 379 Quarterly XVS Buyback, Funds Allocation",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_VAULT_TREASURY_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, XVS_VAULT_REWARDS_SPEED],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          RECEIVER_ADDRESS,
          XVS_AMOUNT_TO_BRIDGE,
          [bscmainnet.VTREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip379;
