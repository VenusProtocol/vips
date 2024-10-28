import { ethers } from "hardhat";
import { makeProposal } from "src/utils";

export const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const COMPTROLLER_LST = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";
export const PRIME = "0xAdB04AC4942683bc41E27d18234C8DC884786E89";
export const PLP = "0xE82c2c10F55D3268126C29ec813dC6F086904694";

export const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
export const WBTC = "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D";
export const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

export const VUSDT_CORE = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
export const VUSDC_CORE = "0xd9d1e754464eFc7493B177d2c7be04816E089b4C";
export const VWBTC_CORE = "0x49FB90A5815904649C44B87001a160C1301D6a2C";
export const VWETH_LST = "0xd7057250b439c0849377bB6C3263eb8f9cf49d98";

const vip015 = () => {
  return makeProposal([
    {
      target: PLP,
      signature: "initializeTokens(address[])",
      params: [[WETH, WBTC, USDC, USDT]],
    },
    {
      target: PLP,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [WETH, WBTC, USDC, USDT],
        [0, 0, 0, 0],
      ],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VWBTC_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VUSDC_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VUSDT_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_LST, VWETH_LST, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "setLimit(uint256,uint256)",
      params: [
        0, // irrevocable
        500, // revocable
      ],
    },
  ]);
};

export default vip015;
