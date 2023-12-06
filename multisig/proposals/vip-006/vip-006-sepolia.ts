import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

export const REWARD_DISTRIBUTOR_CORE_0 = "0xEA3bb4A1C6218E31e435F3c23E0E9a05A40B7F40";
export const REWARD_DISTRIBUTOR_CORE_1 = "0xAbBAe88E3E62D6Ffb23D084bDFD2A1Dc45e15879";
export const REWARD_DISTRIBUTOR_CORE_2 = "0x6B3f9BBbBC8595f9c3C8e0082E95C45F98239E1b";
export const REWARD_DISTRIBUTOR_CORE_3 = "0x5e128F6B554589D3B1E91D53Aee161A70F439062";
const XVS_REWARD_AMOUNT = parseUnits("1000", 18);

const { sepolia } = NETWORK_ADDRESSES;
export const vip006 = () => {
  return makeProposal([
    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_1,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_2,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_3,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: sepolia.VTREASURY,
      signature: "WithdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: sepolia.VTREASURY,
      signature: "WithdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_1],
    },
    {
      target: sepolia.VTREASURY,
      signature: "WithdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_2],
    },
    {
      target: sepolia.VTREASURY,
      signature: "WithdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.XVS, XVS_REWARD_AMOUNT, REWARD_DISTRIBUTOR_CORE_3],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepolia.VWBTC_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_1,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepolia.VWETH_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_2,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepolia.VUSDC_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_3,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[sepolia.VUSDT_CORE], ["190258751902587"], ["190258751902587"]],
    },
    {
      target: sepolia.VTREASURY,
      signature: "WithdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.XVS, XVS_REWARD_AMOUNT, sepolia.XVS_STORE],
    },
    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlock(address,uint256)",
      params: [sepolia.XVS, "380517503805175"],
    },
  ]);
};
