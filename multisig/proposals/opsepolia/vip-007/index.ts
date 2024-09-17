import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const REWARD_DISTRIBUTOR_CORE_0 = "0x24139Dad3fe87Ee718ff9c2A8E0C4188578ba9aF";
export const COMPTROLLER_CORE = "0x59d10988974223B042767aaBFb6D926863069535";
export const XVS_VAULT_REWARDS_SPEED = "31709791983764"; // (1,000 XVS per year)
export const XVS_STORE = "0xE888FA54b32BfaD3cE0e3C7D566EFe809a6A0143";

export const VWBTC_CORE = "0x6149eFAd7671f496C900B3BeC16Ba31Aed60BE4b";
export const VWETH_CORE = "0x4E610626BeF901EEE22D558b2ed19e6f7B87cf51";
export const VUSDC_CORE = "0x2419606690B08060ebFd7581e0a6Ae45f1915ee9";
export const VUSDT_CORE = "0xC23D18536E7069f924B3717B2710CA6A09e53ea9";
export const VOP_CORE = "0x49cceCdd0b399C1b13260452893A3A835bDad5DC";
export const XVS_STORE_AMOUNT = parseUnits("5000", 18);

const vip007 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])", opsepolia.GUARDIAN],
    },
    // CORE POOL REWARDS
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [opsepolia.XVS, parseUnits("3600", 18), REWARD_DISTRIBUTOR_CORE_0],
    },
    { target: REWARD_DISTRIBUTOR_CORE_0, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_CORE_0],
    },
    {
      target: REWARD_DISTRIBUTOR_CORE_0,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VWETH_CORE, VUSDT_CORE, VUSDC_CORE, VWBTC_CORE, VOP_CORE],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407", "1157407407407"],
        ["1157407407407", "1157407407407", "1157407407407", "1157407407407", "1157407407407"],
      ],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [opsepolia.XVS, XVS_STORE_AMOUNT, XVS_STORE],
    },
    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [opsepolia.XVS, XVS_VAULT_REWARDS_SPEED],
    },
  ]);
};

export default vip007;
