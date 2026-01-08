import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, zksyncmainnet } = NETWORK_ADDRESSES;

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const NEW_PRIME_SPEED_FOR_USDC_USDT = parseUnits("0.005422374429223744", 18);

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const BRIDGE_FEES_BSC = parseUnits("0.5", 18);

export const ZKSYNC_XVS_BRIDGE_AMOUNT = parseUnits("473", 18);
export const ZKSYNC_XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const ZKSYNC_SPEED = parseUnits("0.000065740740740740", 18); // 5.68 XVS/day

export const BSC_XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const BSC_XVS_AMOUNT = parseUnits("183018", 18);
export const BSC_SPEED = parseUnits("0.020130208333333333", 18); // 2319 XVS/day

export const ETH_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ETH_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const ETH_XVS_AMOUNT = parseUnits("1191", 18);
export const ETH_SPEED = parseUnits("0.000805555555555555", 18); // 5.8 XVS/day

export const UNISWAP_SWAP_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";

export const vip790 = () => {
  const meta = {
    version: "v2",
    title: "VIP790 PRIME and XVS REWARDS ALLOCATION",
    description: `VIP790 PRIME and XVS REWARDS ALLOCATION`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Adjust Prime Rewards Distribution Speed
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDC, USDT],
          [NEW_PRIME_SPEED_FOR_USDC_USDT, NEW_PRIME_SPEED_FOR_USDC_USDT],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDT, NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK, parseUnits("15000", 18)],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, parseUnits("15000", 18)],
      },
      {
        target: UNISWAP_SWAP_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [
            USDT,
            USDC,
            100,
            bscmainnet.NORMAL_TIMELOCK,
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days from now
            parseUnits("15000", 18),
            parseUnits("14980", 18),
            0n,
          ],
        ],
      },
      {
        target: USDC,
        signature: "transfer(address,uint256)",
        params: [PRIME_LIQUIDITY_PROVIDER, parseUnits("14980", 18)],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, 0],
      },

      // XVS Buyback and Funds Allocation
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, ZKSYNC_XVS_BRIDGE_AMOUNT],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [BSC_XVS_BRIDGE, ZKSYNC_XVS_BRIDGE_AMOUNT],
      },
      {
        target: BSC_XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.zksyncmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [ZKSYNC_XVS_STORE]),
          ZKSYNC_XVS_BRIDGE_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_BSC.toString(),
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNC_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_XVS_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_SPEED],
      },
      {
        target: ETH_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETH_XVS_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETH_SPEED],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip790;
