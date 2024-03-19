import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";


const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
const TEMPORARY_COMPTROLLER_IMPL = "0x3100551C8cfE8000F07C807C0B49a74D6306219d"
const COMPTROLLER_IMPL = "0x0bA3dBDb53a367e9132587c7Fc985153A2E25f08";
const COMPTROLLER_LST = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const { sepolia } = NETWORK_ADDRESSES;

// Deletes rewards Distributors list from comptrollers
export const vip0021 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [TEMPORARY_COMPTROLLER_IMPL],
    },

    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "removeAllRewardsDistributors()",
      params: [],
    },
    {
      target: sepolia.COMPTROLLER_STABLECOINS,
      signature: "removeAllRewardsDistributors()",
      params: [],
    },
    {
      target: sepolia.COMPTROLLER_CURVE,
      signature: "removeAllRewardsDistributors()",
      params: [],
    },
    {
      target: sepolia.COMPTROLLER_CURVE,
      signature: "removeAllRewardsDistributors()",
      params: [],
    },
    {
      target: COMPTROLLER_LST,
      signature: "removeAllRewardsDistributors()",
      params: [],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [COMPTROLLER_IMPL],
    },
  ])
};
