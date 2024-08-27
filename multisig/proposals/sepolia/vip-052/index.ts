import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";

export const COMPTROLLERS = ["0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70"];

export const VTOKENS = [
  "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082",
  "0x121E3be152F283319310D807ed847E8b98319C1e",
  "0xfe050f628bF5278aCfA1e7B13b59fF207e769235",
  "0xE23A1fC1545F1b072308c846a38447b23d322Ee2",
  "0xF87bceab8DD37489015B426bA931e08A4D787616",
  "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
  "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383",
  "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9",
  "0x33942B932159A67E3274f54bC4082cbA4A704340",
  "0x18995825f033F33fa30CF59c117aD21ff6BdB48c",
  "0xc7be132027e191636172798B933202E0f9CAD548",
  "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78",
  "0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A",
  "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1",
  "0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf",
  "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70",
  "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4",
  "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D",
  "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b",
  "0x9C5e7a3B4db931F07A6534f9e44100DDDc78c408",
  "0xD5f83FCbb4a62779D0B37b9E603CD19Ad84884F0",
  "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4",
];

const vip052 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip052;
