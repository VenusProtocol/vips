import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const CORE_POOL_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const vUSDCe = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const vZK = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
export const vWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";

export const vUSDCe_SUPPLY_CAP = parseUnits("6000000", 6);
export const vZK_SUPPLY_CAP = parseUnits("35000000", 18);
export const vWETH_SUPPLY_CAP = parseUnits("3000", 18);

export const vUSDCe_BORROW_CAP = parseUnits("5400000", 6);

export const vip009 = () => {
  return makeProposal([
    {
      target: CORE_POOL_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vUSDCe, vZK, vWETH], [vUSDCe_SUPPLY_CAP, vZK_SUPPLY_CAP, vWETH_SUPPLY_CAP]]
    },
    {
      target: CORE_POOL_COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[vUSDCe], [vUSDCe_BORROW_CAP]]
    }
  ]);
};

export default vip009;
