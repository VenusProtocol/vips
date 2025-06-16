import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, unichainmainnet, arbitrumone, opmainnet, basemainnet, opbnbmainnet, zksyncmainnet } =
  NETWORK_ADDRESSES;

export const ERC4626_FACTORY_BNB = "0xC2f7924809830886EB04c6b40725Fd68F1891fA2";
export const ERC4626_FACTORY_ARBITRUM = "0xC1422B928cb6FC9BA52880892078578a93aa5Cc7";
export const ERC4626_FACTORY_OPTIMISM = "0xc801B471F00Dc22B9a7d7b839CBE87E46d70946F";
export const ERC4626_FACTORY_BASE = "0x1A430825B31DdA074751D6731Ce7Dca38D012D13";
export const ERC4626_FACTORY_ETHEREUM = "0x39cb747453Be3416E659dAeA169540b6F000c885";
export const ERC4626_FACTORY_UNICHAIN = "0x102fEb723C25c67dbdfDccCa3B1c1a6e1a662D2f";
export const ERC4626_FACTORY_ZKSYNC = "0xDC59Dd76Dd7A64d743C764a9aa8C96Ff2Ea8BAc3";
export const ERC4626_FACTORY_OPBNB = "0x89A5Ce0A6db7e66E53F148B50D879b700dEB81C8";

export const PSR_BNB = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PSR_ETHEREUM = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const PSR_OPBNB = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";
export const PSR_BASE = "0x3565001d57c91062367C3792B74458e3c6eD910a";
export const PSR_ARBITRUM = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const PSR_OPTIMISM = "0x735ed037cB0dAcf90B133370C33C08764f88140a";
export const PSR_UNICHAIN = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";
export const PSR_ZKSYNC = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";

export const PSR_BNB_NEW_IMPLEMENTATION = "0xDF41C4201b06EE344C5A3F6E20E41b4b900C90BD";
export const PSR_ETHEREUM_NEW_IMPLEMENTATION = "0xfD6Ef8B67f82a0ddA8E078954E04B749a75cE326";
export const PSR_OPBNB_NEW_IMPLEMENTATION = "0x85B0711FB5Bef4CfeDb90BD2F392b943fd9f556D";
export const PSR_BASE_NEW_IMPLEMENTATION = "0x74487c1cBDa7f1Abc0d4d8652941e41CCc0F6c0E";
export const PSR_ARBITRUM_NEW_IMPLEMENTATION = "0xFde46857B36881d69F742D44Aa5bF81e8f8dcF94";
export const PSR_OPTIMISM_NEW_IMPLEMENTATION = "0x72672A4f9d2EF78eC98cF8Fd4b3544beBC3fea9E";
export const PSR_UNICHAIN_NEW_IMPLEMENTATION = "0x2167f65B4012300673A19AB669A8278D6A5fbDf3";
export const PSR_ZKSYNC_NEW_IMPLEMENTATION = "0xf60d4c96E1bF0FC865753aB7BF438C88444Fa971";

export const ACM_BNB = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const ACM_ETHEREUM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ACM_OPBNB = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ACM_BASE = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const ACM_ARBITRUM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ACM_OPTIMISM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ACM_UNICHAIN = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const ACM_ZKSYNC = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

export const PROXY_ADMIN_BNB = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PROXY_ADMIN_BASE = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const PROXY_ADMIN_ARBITRUM = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const PROXY_ADMIN_ETHEREUM = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
export const PROXY_ADMIN_OPBNB = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";
export const PROXY_ADMIN_OPTIMISM = "0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2";
export const PROXY_ADMIN_UNICHAIN = "0x78e9fff2ab8daAB8559070d897C399E5e1C5074c";
export const PROXY_ADMIN_ZKSYNC = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";

export const vip515 = () => {
  const meta = {
    version: "v2",
    title: "VIP-515",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      // bscmainnet
      {
        target: ERC4626_FACTORY_BNB,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setRewardRecipient(address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setMaxLoopsLimit(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: ERC4626_FACTORY_BNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_BNB],
      },
      {
        target: PROXY_ADMIN_BNB,
        signature: "upgrade(address,address)",
        params: [PSR_BNB, PSR_BNB_NEW_IMPLEMENTATION],
      },
      // arbitrumone
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setRewardRecipient(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setMaxLoopsLimit(uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "setRewardRecipient(address)",
        params: [PSR_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [PSR_ARBITRUM, PSR_ARBITRUM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.arbitrumone,
      },
      // opmainnet
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setRewardRecipient(address)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setMaxLoopsLimit(uint256)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPTIMISM],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: PROXY_ADMIN_OPTIMISM,
        signature: "upgrade(address,address)",
        params: [PSR_OPTIMISM, PSR_OPTIMISM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opmainnet,
      },
      // basemainnet
      {
        target: ERC4626_FACTORY_BASE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setRewardRecipient(address)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setMaxLoopsLimit(uint256)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", basemainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ERC4626_FACTORY_BASE,
        signature: "setRewardRecipient(address)",
        params: [PSR_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [PSR_BASE, PSR_BASE_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.basemainnet,
      },
      // ethereum
      {
        target: ERC4626_FACTORY_ETHEREUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ETHEREUM, "setRewardRecipient(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ETHEREUM, "setMaxLoopsLimit(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM_ETHEREUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ERC4626_FACTORY_ETHEREUM,
        signature: "setRewardRecipient(address)",
        params: [PSR_ETHEREUM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PROXY_ADMIN_ETHEREUM,
        signature: "upgrade(address,address)",
        params: [PSR_ETHEREUM, PSR_ETHEREUM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      // unichainmainnet
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setRewardRecipient(address)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setMaxLoopsLimit(uint256)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", unichainmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "setRewardRecipient(address)",
        params: [PSR_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [PSR_UNICHAIN, PSR_UNICHAIN_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.unichainmainnet,
      },
      // zksyncmainnet
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setRewardRecipient(address)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setMaxLoopsLimit(uint256)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "setRewardRecipient(address)",
        params: [PSR_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [PSR_ZKSYNC, PSR_ZKSYNC_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.zksyncmainnet,
      },
      // opbnbmainnet
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setRewardRecipient(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setMaxLoopsLimit(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: PROXY_ADMIN_OPBNB,
        signature: "upgrade(address,address)",
        params: [PSR_OPBNB, PSR_OPBNB_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip515;
