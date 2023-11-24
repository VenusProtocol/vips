import { ethers } from "ethers";

export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const NETWORK_ADDRESSES = {
  bscmainnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    GOVERNOR_PROXY: "0x2d56dC077072B53571b8252008C60e945108c75a",
    NORMAL_TIMELOCK: "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396",
  },
  bsctestnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GOVERNOR_PROXY: "0x5573422a1a59385c247ec3a66b93b7c08ec2f8f2",
    NORMAL_TIMELOCK: "0xce10739590001705F7FF231611ba4A48B2820327",
  },
  ethereum: {
    NORMAL_TIMELOCK: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    GUARDIAN: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    VTREASURY: "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa",
  },
  sepolia: {
    NORMAL_TIMELOCK: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB", // Sepolia Multisig
    GUARDIAN: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB",
    CHAINLINK_ORACLE: "0x102F0b714E5d321187A4b6E5993358448f7261cE",
    RESILIENT_ORACLE: "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264",
    BOUND_VALIDATOR: "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B",
    ACM: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
    MOCK_USDC: "0x772d68929655ce7234C8C94256526ddA66Ef641E",
    MOCK_USDT: "0x8d412FD0bc5d826615065B931171Eed10F5AF266",
    MOCK_WETH: "0x700868CAbb60e90d77B6588ce072d9859ec8E281",
    MOCK_WBTC: "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b",
    XVS: "0xdb633c11d3f9e6b8d17ac2c972c9e3b05da59bf9",
    POOL_REGISTRY: "0x22067CF4a23955Ab7b834D4a9336ca624D93485e",
    COMPTROLLER: "0x4e4048b5eb13DD377872A418268b788f672653aa",
    VWBTC: "0x13c15cA5A074E7E1450492D474087b99c7253001",
    VWETH: "0x195D27b4cAfcb543C9104583FA37743ad5E4cEe5",
    VUSDT: "0x2c3Cc8EED38b4d323ce97DB11f98737F3F7421A1",
    VUSDC: "0x6f1089e90C6a14397C20348eE704d596819DFEd4",
    VTREASURY: "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8",
    REDSTONE_ORACLE: "0x4e6269Ef406B4CEE6e67BA5B5197c2FfD15099AE",
    MOCK_CRV: "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3",
    MOCK_crvUSD: "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6",
  },
};
