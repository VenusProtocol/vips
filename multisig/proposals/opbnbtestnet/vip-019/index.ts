import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
export const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";

export const COMPTROLLERS = ["0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388"];

export const VTOKENS = [
  "0x86F82bca79774fc04859966917D2291A68b870A9",
  "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480",
  "0xe3923805f6E117E51f5387421240a86EF1570abC",
  "0xD36a31AcD3d901AeD998da6E24e848798378474e",
];

const vip019 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [opbnbtestnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbtestnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbtestnet.NORMAL_TIMELOCK],
      };
    }),

    // Revoke permissions
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setInterestRateModel(address)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addMarket(AddMarketInput)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "setPoolName(address,string)", opbnbtestnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", opbnbtestnet.GUARDIAN],
    },
  ]);
};

export default vip019;
