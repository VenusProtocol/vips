import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_BASE = "0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD";
export const CHAINLINK_ORACLE_ORACLE_BASE = "0x6F2eA73597955DB37d7C06e1319F0dC7C7455dEb";
export const REDSTONE_ORACLE_ORACLE_BASE = "0xd101Bf51937A6718F402dA944CbfdcD12bB6a6eb";
export const BOUND_VALIDATOR_BASE = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";
export const DEFAULT_PROXY_ADMIN_BASE = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const RESILIENT_ORACLE_IMPLEMENTATION_BASE = "0x2632b7b2b34C80B7F854722CEB6b54714476C0A6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_BASE = "0xdA079597acD9eda0c7638534fDB43F06393Fe507";
export const REDSTONE_ORACLE_IMPLEMENTATION_BASE = "0x08482c78427c2E83aA2EeedF06338E05a71bf925";
export const BOUND_VALIDATOR_IMPLEMENTATION_BASE = "0xc92eefCE80e7Ca529a060C485F462C90416cA38A";
export const wSuperOETHb_ORACLE = "0xcd1d2C99642165440c2CC023AFa2092b487f033e";
export const wSuperOETHb = "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6";
export const wstETHOracle = "0xDDD4F0836c8016E11fC6741A4886E97B3c3d20C1";
export const wstETH = "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452";

export const RESILIENT_ORACLE_OP = "0x21FC48569bd3a6623281f55FC1F8B48B9386907b";
export const CHAINLINK_ORACLE_OP = "0x1076e5A60F1aC98e6f361813138275F1179BEb52";
export const REDSTONE_ORACLE_OP = "0x7478e4656F6CCDCa147B6A7314fF68d0C144751a";
export const BOUND_VALIDATOR_OP = "0x37A04a1eF784448377a19F2b1b67cD40c09eA505";
export const DEFAULT_PROXY_ADMIN_OP = "0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2";
export const RESILIENT_ORACLE_IMPLEMENTATION_OP = "0xB4E073C5abB056D94f14f0F8748B6BFcb418fFe6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_OP = "0x1Abf4919dE8ae2B917d553475e9B1D9CdE6E36D3";
export const BOUND_VALIDATOR_IMPLEMENTATION_OP = "0xc04C8dFF5a91f82f5617Ee9Bd83f6d96de0eb39C";
export const REDSTONE_ORACLE_IMPLEMENTATION_OP = "0x5e448421aB3c505AdF0E5Ee2D2fCCD80FDe08a43";

export const RESILIENT_ORACLE_UNICHAIN = "0x86D04d6FE928D888076851122dc6739551818f7E";
export const REDSTONE_ORACLE_UNICHAIN = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const BOUND_VALIDATOR_UNICHAIN = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";
export const RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN = "0x314197e6f1664C141F90403c990b668e50460315";
export const REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN = "0x477FB8C53b0c9A2B18295BBA7B1dF41356fC09D0";
export const BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN = "0x287F0f107ab4a5066bd257d684AFCc09c8d31Bde";
export const DEFAULT_PROXY_ADMIN_UNICHAIN = "0x78e9fff2ab8daAB8559070d897C399E5e1C5074c";

export const vip492 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_BASE, RESILIENT_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ORACLE_BASE, CHAINLINK_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ORACLE_BASE, REDSTONE_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_BASE, BOUND_VALIDATOR_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: RESILIENT_ORACLE_BASE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wSuperOETHb,
            [wSuperOETHb_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: RESILIENT_ORACLE_BASE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH,
            [wstETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_OP, RESILIENT_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_OP, CHAINLINK_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_OP, BOUND_VALIDATOR_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_OP, REDSTONE_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_UNICHAIN, RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_UNICHAIN, REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_UNICHAIN, BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip492;
