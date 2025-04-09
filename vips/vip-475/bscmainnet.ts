import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const ETH_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ARB_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";

export const BSC_RELEASE_AMOUNT = parseUnits("111845", 18);
export const ETH_RELEASE_AMOUNT = parseUnits("5932", 18);
export const ARB_RELEASE_AMOUNT = parseUnits("470", 18);

export const BSC_DISTRIBUTION_SPEED = "57256944444444445";
export const ETH_DISTRIBUTION_SPEED = "2902777777777777";
export const ARB_DISTRIBUTION_SPEED = "240355555555556";
export const ZKSYNC_DISTRIBUTION_SPEED = "393518518518519";

const { zksyncmainnet, ethereum, arbitrumone, bscmainnet } = NETWORK_ADDRESSES;

export const vip475 = () => {
  const meta = {
    version: "v2",
    title: "VIP-475",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_DISTRIBUTION_SPEED],
      },
      {
        target: ETH_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETH_RELEASE_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETH_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARB_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARB_RELEASE_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARB_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNC_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip475;
