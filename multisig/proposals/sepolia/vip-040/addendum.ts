import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const sfrxETH = "0x14AECeEc177085fd09EA07348B4E1F7Fcc030fA1";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const vsfrxETH = "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70";
export const INITIAL_SUPPLY = parseUnits("1.2", 18);
export const REWARDS_DISTRIBUTOR_XVS = "0x4597B9287fE0DF3c5513D66886706E0719bD270f";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SUPPLY_CAP = parseUnits("10000", 18);
export const BORROW_CAP = parseUnits("1000", 18);
export const SPEED = parseUnits("0.003703703703703703", 18).div(100); // 24 XVS total rewards

export const SFrxETHOracle = "0x61EB836afA467677e6b403D504fe69D6940e7996";

const vip035Addendum = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [SFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", sepolia.NORMAL_TIMELOCK],
    },

    // Add Market
    {
      target: sfrxETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: sfrxETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
      value: "0",
    },
    {
      target: vsfrxETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: vsfrxETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [vsfrxETH, "900000000000000000", "930000000000000000", INITIAL_SUPPLY, VTREASURY, SUPPLY_CAP, BORROW_CAP],
      ],
    },

    // Add sfrxETH Market Rewards
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[vsfrxETH], [SPEED], ["0"]],
    },
  ]);
};

export default vip035Addendum;
