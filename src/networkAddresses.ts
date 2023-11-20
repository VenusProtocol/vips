import { ethers } from "ethers";

export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const NETWORK_ADDRESSES = {
  bscmainnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    GOVERNOR_PROXY: "0x2d56dC077072B53571b8252008C60e945108c75a",
    NORMAL_TIMELOCK: "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396",
    ACCESS_CONTROL_MANAGER: "0x4788629abc6cfca10f9f969efdeaa1cf70c23555",
  },
  bsctestnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GOVERNOR_PROXY: "0x5573422a1a59385c247ec3a66b93b7c08ec2f8f2",
    NORMAL_TIMELOCK: "0xce10739590001705F7FF231611ba4A48B2820327",
    ACCESS_CONTROL_MANAGER: "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA",
  },
  ethereum: {
    NORMAL_TIMELOCK: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    GUARDIAN: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    VTREASURY: "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa",
  },
  sepolia: {
    NORMAL_TIMELOCK: "0x3961EDAfe1d1d3AB446f1b2fc10bde476058448B",
    GUARDIAN: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB", // Sepolia Multisig
    ACCESS_CONTROL_MANAGER: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
    FASTTRACK_TIMELOCK: "0x02A66bfB5De5c6b969cB81F00AC433bC8EeeDd4c",
    CRITICAL_TIMELOCK: "0xa82173F08CDFCD6fDB5505dcd37E5c6403a26DE6",
    CHAINLINK_ORACLE: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
    RESILIENT_ORACLE: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07",
    BOUND_VALIDATOR: "0x8305fF2eEAE00bc0C19746851c1c8643Ebd68193",
    ACM: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
    MOCK_USDC: "0x772d68929655ce7234C8C94256526ddA66Ef641E",
    MOCK_USDT: "0x8d412FD0bc5d826615065B931171Eed10F5AF266",
    MOCK_WETH: "0x700868CAbb60e90d77B6588ce072d9859ec8E281",
    MOCK_WBTC: "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b",
    POOL_REGISTRY: "0x22067CF4a23955Ab7b834D4a9336ca624D93485e",
    COMPTROLLER: "0x4e4048b5eb13DD377872A418268b788f672653aa",
    VWBTC: "0x13c15cA5A074E7E1450492D474087b99c7253001",
    VWETH: "0x195D27b4cAfcb543C9104583FA37743ad5E4cEe5",
    VUSDT: "0x2c3Cc8EED38b4d323ce97DB11f98737F3F7421A1",
    VUSDC: "0x6f1089e90C6a14397C20348eE704d596819DFEd4",
    VTREASURY: "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8",
    ENDPOINT: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    OMNICHAIN_PROPOSAL_SENDER: "0x0852b6d4c4745a8bfeb54476a2a167df68866c00",
    OMNICHAIN_EXECUTOR_OWNER: "0xCF62a3A139D63f8E4Ae4c850FCC54DC625dfD50A",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0x9b0786cd8f841d1c7b8a08a5ae6a246aed556a42",
    LZ_LIBRARY: "0x3acaaf60502791d199a5a5f0b173d78229ebfe32",
  },
  arbitrum_goerli: {
    NORMAL_TIMELOCK: "0x54E8C036A5f63Ad5e3B28Fa610cdBdbC00613446",
    ACCESS_CONTROL_MANAGER: "0x3d6807f76ebb8A458c4EA6Bc0B8cEb29c633316b",
    ENDPOINT: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    OMNICHAIN_PROPOSAL_SENDER: "0x0852b6D4C4745A8bFEB54476A2A167DF68866c00",
    OMNICHAIN_EXECUTOR_OWNER: "0xEf2C81843B322A0DbeaB9490c7dD576eE23732A3",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0xDC267eac30C9f73E6779554F89119e975a5D4F18",
    LZ_LIBRARY: "0x3acaaf60502791d199a5a5f0b173d78229ebfe32",
  },
};
