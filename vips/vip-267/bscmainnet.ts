import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const XVS_AMOUNT_TO_VESTING = parseUnits("12270.35", 18);
export const XVS_VESTING_PROXY = "0xb28Dec7C7Ac80f4D0B6a1B711c39e444cDE8B2cE";
export const XVS_AMOUNT_TO_COMPTROLLER = parseUnits("277729.65", 18);

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("1000", 18);
export const DEST_CHAIN_ID = 101;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vip267 = () => {
  const meta = {
    version: "v2",
    title: "VIP-267 Fund the XVSVestingProxy contract and bridge XVS to Ethereum",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 12,270.35 XVS to the [XVSVestingProxy](https://bscscan.com/address/0xb28Dec7C7Ac80f4D0B6a1B711c39e444cDE8B2cE) contract
- Transfer 277,729.65 XVS back to the [XVS Distribution contract](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
- Bridge 1,000 XVS to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA)

#### Details

The [XVSVestingProxy](https://bscscan.com/address/0xb28Dec7C7Ac80f4D0B6a1B711c39e444cDE8B2cE) contract is where the XVS tokens are waiting to be withdrawn by the users who sent VRT tokens to the [VRTConverter contract](https://bscscan.com/address/0x92572fB60f4874d37917C53599cAe5b085B9Facd).

Users sent 5,667,244,158.75 VRT to the VRTConverter contract. Considering the [conversion ratio](https://bscscan.com/address/0x92572fB60f4874d37917C53599cAe5b085B9Facd#readProxyContract#F6), these users are allowed to get from the XVSVestingProxy contract 472,270.35 XVS.

In the [VIP-55](https://app.venus.io/#/governance/proposal/55), 750,000 XVS were sent to the multisig wallet [0xbc6343132981df72b4dfefab8f3847a40f5ce6b5](https://bscscan.com/address/0xbc6343132981df72b4dfefab8f3847a40f5ce6b5), to fund the XVSVestingProxy contract. Only 460,000 XVS were transferred from the multisig wallet to the XVSVestingProxy contract, for that purpose.

After sending back the rest 290,000 XVS from the multisig wallet to the Venus Treasury ([TX](https://bscscan.com/tx/0x402bf96e4f8ec6bbd7d5e51fa77bbefebd74db45dd22c41ecff51003354ea0bc)), this VIP will fund the XVSVestingProxy contract with 12,270.35 XVS, and it will send the rest 277,729.65 XVS to the XVS Distribution contract.

Moreover, 1,000 XVS from the Distribution contract would be sent to the Venus Treasury on Ethereum using the XVS bridge enabled at [VIP-232](https://app.venus.io/#/governance/proposal/232). This is the second and last test for bridging XVS via VIP. The first one was in [VIP-263](https://app.venus.io/#/governance/proposal/263), where 10 XVS were bridged successfully. These XVS will be used for the rewards on Ethereum.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/225)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [XVS, XVS_AMOUNT_TO_VESTING, XVS_VESTING_PROXY],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [XVS, XVS_AMOUNT_TO_COMPTROLLER, COMPTROLLER],
      },

      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          ETHEREUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: parseUnits("0.5", 18).toString(),
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip267;
