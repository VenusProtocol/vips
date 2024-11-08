import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";

export const ARBITRUM_SEPOLIA_COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const ARBITRUM_SEPOLIA_COMPTROLLER_LST = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";
export const ARBITRUM_SEPOLIA_PRIME = "0xAdB04AC4942683bc41E27d18234C8DC884786E89";
export const ARBITRUM_SEPOLIA_PLP = "0xE82c2c10F55D3268126C29ec813dC6F086904694";

export const ARBITRUM_SEPOLIA_USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const ARBITRUM_SEPOLIA_USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
export const ARBITRUM_SEPOLIA_WBTC = "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D";
export const ARBITRUM_SEPOLIA_WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";
export const ARBITRUM_SEPOLIA_PRIME_NEW_IMPLEMENTATION = "0x507866eCb585275E006D9098867a0e9B08C11CCe"; // contains the setter for the pool registry address
export const ARBITRUM_SEPOLIA_PRIME_OLD_IMPLEMENTATION = "0x255EFC81Ba715FA7C2C27bdd983A3CeF9BB07fEf";
export const ARBITRUM_SEPOLIA_PROXY_ADMIN = "0xA78A1Df376c3CEeBC5Fab574fe6EdDbbF76fd03e";

export const ARBITRUM_SEPOLIA_VUSDT_CORE = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
export const ARBITRUM_SEPOLIA_VUSDC_CORE = "0xd9d1e754464eFc7493B177d2c7be04816E089b4C";
export const ARBITRUM_SEPOLIA_VWBTC_CORE = "0x49FB90A5815904649C44B87001a160C1301D6a2C";
export const ARBITRUM_SEPOLIA_VWETH_LST = "0xd7057250b439c0849377bB6C3263eb8f9cf49d98";

export const MAX_DAILY_LIMIT = 100;

const vip395 = () => {
  const meta = {
    version: "v2",
    title: "vip395",
    description: `#### Description
    This VIP will grant permission to timelocks and performs the necessary configuration of OmnichainProposalSender on BNB chain and OmnichainProposalExecutor on SEPOLIA & OPBNBTESTNET chains`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_SEPOLIA_PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [ARBITRUM_SEPOLIA_WETH, ARBITRUM_SEPOLIA_WBTC, ARBITRUM_SEPOLIA_USDC, ARBITRUM_SEPOLIA_USDT],
          [0, 0, 0, 0],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VWBTC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VUSDC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
          ARBITRUM_SEPOLIA_VUSDT_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_SEPOLIA_COMPTROLLER_LST,
          ARBITRUM_SEPOLIA_VWETH_LST,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500, // revocable
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip395;
