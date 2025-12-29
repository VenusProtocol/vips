import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const CORE_POOL_RATE_MODEL_SETTER = "0x8504EF43463c1edC9897182c6e17C0ad47B9Ad31";
export const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_MARKET = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

// Block reward calculations adjusted for new block time (0.45s vs 0.75s)
// Formula: old_rate * 100 / 167 (equivalent to dividing by 1.67)
// Block time ratio: 0.75s / 0.45s = 1.67
export const XVS_PER_BLOCK_REWARD = parseUnits("0.012135420000000000", 18).mul(100).div(167);
export const BTCB_PER_BLOCK_REWARD = parseUnits("0.000000038051750381", 18).mul(100).div(167);
export const ETH_PER_BLOCK_REWARD = parseUnits("0.00000333999", 18).mul(100).div(167);
export const USDC_PER_BLOCK_REWARD = parseUnits("0.010360663100000000", 18).mul(100).div(167);
export const USDT_PER_BLOCK_REWARD = parseUnits("0.010360663100000000", 18).mul(100).div(167);
export const VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.00056973379", 18).mul(100).div(167);
export const XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.0001953125", 18).mul(100).div(167);

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const NEW_VAI_IMPLEMENTATION = "0xFD754b21F5dbbf6eb282911Cc0112cbF88190767";
export const NEW_PLP_IMPLEMENTATION = "0x46BED43b29D73835fF075bBa1A0002A1eD1E4de8";
export const NEW_PRIME_IMPLEMENTATION = "0x1a6660059E61e88402bD34FC96C2332c5EeAF195";
export const GOVERNANCE_BRAVO = "0x2d56dC077072B53571b8252008C60e945108c75a";

// Updated block rate for 0.45 second blocks
// Previous: 42,048,000 blocks/year (0.75s per block)
// New: 70,080,000 blocks/year (0.45s per block)
// Calculation: 365.25 days * 24 hours * 3600 seconds / 0.45s = 70,080,000
export const NEW_BSC_BLOCK_RATE = 70080000;

// Governance voting parameters adjusted for new block rate
// All periods/delays multiplied by 1.67 to maintain same time duration
// Formula: old_blocks * 167 / 100 (equivalent to multiplying by 1.67)
export const MIN_VOTING_PERIOD = 24048;
export const MAX_VOTING_PERIOD = 2693376;
export const MIN_VOTING_DELAY = 1;
export const MAX_VOTING_DELAY = 1346688;

export const NT_VOTING_PERIOD = 192384;
export const NT_VOTING_DELAY = 1;
export const NT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const FT_VOTING_PERIOD = 192384;
export const FT_VOTING_DELAY = 1;
export const FT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const CT_VOTING_PERIOD = 48096;
export const CT_VOTING_DELAY = 1;
export const CT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const PROPOSAL_CONFIGS = [
  [NT_VOTING_DELAY, NT_VOTING_PERIOD, NT_PROPOSAL_THRESHOLD],
  [FT_VOTING_DELAY, FT_VOTING_PERIOD, FT_PROPOSAL_THRESHOLD],
  [CT_VOTING_DELAY, CT_VOTING_PERIOD, CT_PROPOSAL_THRESHOLD],
];

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const vip780 = () => {
  const meta = {
    version: "v2",
    title: "VIP-780 [BNB Chain] Block Rate Upgrade (1/2)",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: CORE_POOL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [XVS, XVS_PER_BLOCK_REWARD],
      },
      {
        target: COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [VAI_VAULT_RATE_PER_BLOCK],
      },
      {
        target: PLP_PROXY,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BTCB, ETH, USDC, USDT],
          [BTCB_PER_BLOCK_REWARD, ETH_PER_BLOCK_REWARD, USDC_PER_BLOCK_REWARD, USDT_PER_BLOCK_REWARD],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[XVS_MARKET], [XVS_MARKET_SUPPLY_REWARD_PER_BLOCK], [0]],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME_PROXY, NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PLP_PROXY, NEW_PLP_IMPLEMENTATION],
      },
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_IMPLEMENTATION],
      },
      {
        target: NEW_VAI_IMPLEMENTATION,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },

      // set new block rate in xvs vault
      {
        target: XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [NEW_BSC_BLOCK_RATE],
      },

      // Update validation params in Bravo
      {
        target: GOVERNANCE_BRAVO,
        signature: "setValidationParams((uint256,uint256,uint256,uint256))",
        params: [[MIN_VOTING_PERIOD, MAX_VOTING_PERIOD, MIN_VOTING_DELAY, MAX_VOTING_DELAY]],
      },

      {
        target: GOVERNANCE_BRAVO,
        signature: "setProposalConfigs((uint256,uint256,uint256)[])",
        params: [PROPOSAL_CONFIGS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip780;
