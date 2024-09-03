import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ETHEREUM_CONVERTERS } from "../../multisig/proposals/ethereum/vip-053";
import { CONVERTER_NETWORK as ETHEREUM_CONVERTER_NETWORK } from "../../multisig/proposals/ethereum/vip-053";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";

const { ethereum } = NETWORK_ADDRESSES;

const vip352 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ETHEREUM_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),

      // Grant permissions to Normal Timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "addTokenConverter(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "removeTokenConverter(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      // Grant permissions to fast track timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "addTokenConverter(address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "removeTokenConverter(address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      // Grant permissions to critical timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "addTokenConverter(address)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_CONVERTER_NETWORK, "removeTokenConverter(address)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      // Grant permissions to Normal Timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "pauseConversion()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "resumeConversion()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinAmountToConvert(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setConversionConfig(address,address,ConversionConfig)",
          ethereum.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Grant permissions to fast track timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "pauseConversion()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "resumeConversion()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinAmountToConvert(uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setConversionConfig(address,address,ConversionConfig)",
          ETHEREUM_FASTTRACK_TIMELOCK,
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Grant permissions to critical timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "pauseConversion()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "resumeConversion()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinAmountToConvert(uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setConversionConfig(address,address,ConversionConfig)",
          ETHEREUM_CRITICAL_TIMELOCK,
        ],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip352;
