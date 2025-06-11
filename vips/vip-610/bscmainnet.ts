import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_MARKET = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const XVS_PER_BLOCK_REWARD = parseUnits("0.028628472222222222", 18).div(2);
export const BTCB_PER_BLOCK_REWARD = parseUnits("0.000000076103500761", 18).div(2);
export const ETH_PER_BLOCK_REWARD = parseUnits("0.000006679984779299", 18).div(2);
export const USDC_PER_BLOCK_REWARD = parseUnits("0.037671232876712328", 18).div(2);
export const USDT_PER_BLOCK_REWARD = parseUnits("0.069063926940639269", 18).div(2);
export const VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.001139467592592592", 18).div(2);
export const XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.000390625", 18).div(2);

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const NEW_VAI_IMPLEMENTATION = "0xF1A8B40CA68d08EFfa31a16a83f4fd9b5c174872";
export const NEW_PLP_IMPLEMENTATION = "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF";
export const NEW_PRIME_IMPLEMENTATION = "0x211b1c2C778daeeD39cE0E6a91Edb1d82a20BB2B";
export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const NEW_VTOKEN_IMPLEMENTATION = "0x228Ea224d62D14a2e2cb9B43083aE43954C39B67";
export const GOVERNANCE_BRAVO = "0x2d56dC077072B53571b8252008C60e945108c75a";
export const SHORTFALL_PROXY = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
export const NEW_SHORTFALL_IMPLEMENTATION = "0x4F41EcAce160f6ef893102D64f84E8040c06d8B0";

export const NEW_BSC_BLOCK_RATE = 42048000;

// Doubling the previous value, to be reviewed
export const MIN_VOTING_PERIOD = 7200 * 2;
export const MAX_VOTING_PERIOD = 806400 * 2;
export const MIN_VOTING_DELAY = 1;
export const MAX_VOTING_DELAY = 403200 * 2;

export const NT_VOTING_PERIOD = 57600 * 2;
export const NT_VOTING_DELAY = 1;
export const NT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const FT_VOTING_PERIOD = 57600 * 2;
export const FT_VOTING_DELAY = 1;
export const FT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const CT_VOTING_PERIOD = 14400 * 2;
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

export const vip610 = () => {
  const meta = {
    version: "v2",
    title: "VIP-610 [BNB Chain] Block Rate Upgrade",
    description: `[BNB Chain] Block Rate Upgrade `,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
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
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
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
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [SHORTFALL_PROXY, NEW_SHORTFALL_IMPLEMENTATION],
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

export default vip610;
