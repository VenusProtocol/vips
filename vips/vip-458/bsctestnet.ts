import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbepolia } = NETWORK_ADDRESSES;

export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
export const MAX_DAILY_LIMIT = 100;
export const OMNICHAIN_EXECUTOR_OWNER = "0x61ed025c4EB50604F367316B8E18dB7eb7283D49";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1EAA596ad8101bb321a5999e509A61747893078B";
export const ACM = "0x243313C1cC198FF80756ed2ef14D9dcd94Ee762b";
export const TREASURY = "0xd0D3FBBE22d9a43d3Aa605590976ac5843597228";
export const BOUND_VALIDATOR = "0xd3A635930300ea87548A1C3428Ac5DDfE3FFE66E";
export const MOCK_USDCe = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const WETH = "0x434BB500fA491Daa03375D2B9762dD6080064e2D";
export const WBERA = "0x6969696969696969696969696969696969696969";
export const XVS = "0x8699D418D8bae5CFdc566E4fce897B08bd9B03B0";

const vip458 = () => {
  const meta = {
    version: "v2",
    title: "VIP-458",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.berachainbepolia, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.berachainbepolia, berachainbepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: TREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },

      {
        target: berachainbepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [berachainbepolia.XVS, parseUnits("7", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WETH, parseUnits("3000", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WBERA, parseUnits("6", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [MOCK_USDCe, parseUnits("1", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3])[])",
        params: [
          [
            [
              berachainbepolia.XVS,
              [berachainbepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              WETH,
              [berachainbepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              WBERA,
              [berachainbepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              MOCK_USDCe,
              [berachainbepolia.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
          ],
        ],
        dstChainId: LzChainId.berachainbepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip458;
