import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCMAINNET_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const BSCMAINNET_XVS_AMOUNT = parseUnits("89392", 18);
export const BSCMAINNET_XVS_SPEED = "50000000000000000";

export const ETHEREUM_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ETHEREUM_XVS_AMOUNT = parseUnits("3207", 18);
export const ETHEREUM_XVS_SPEED = "27777777777777777";

export const ARBITRUMONE_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const ARBITRUMONE_XVS_AMOUNT = parseUnits("739.739", 18);
export const ARBITRUMONE_XVS_SPEED = "486111111111111";

export const ZKSYNCMAINNET_XVS_SPEED = "405092592592592";

const { bscmainnet, ethereum, arbitrumone, zksyncmainnet } = NETWORK_ADDRESSES;

export const vip421 = () => {
  const meta = {
    version: "v2",
    title: "VIP-421",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCMAINNET_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSCMAINNET_XVS_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSCMAINNET_XVS_SPEED],
      },
      {
        target: ETHEREUM_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETHEREUM_XVS_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETHEREUM_XVS_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARBITRUMONE_XVS_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARBITRUMONE_XVS_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNCMAINNET_XVS_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip421;
