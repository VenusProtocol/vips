import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCMAINNET_XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
export const BSCMAINNET_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BSCMAINNET_XVS_MARKET = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const BSCMAINNET_XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const BSCMAINNET_BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BSCMAINNET_ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BSCMAINNET_USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BSCMAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BSCMAINNET_XVS_PER_BLOCK_REWARD = parseUnits("0.057256944444444445", 18).div(2);
export const BSCMAINNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000000152207001522", 18).div(2);
export const BSCMAINNET_ETH_PER_BLOCK_REWARD = parseUnits("0.000013359969558599", 18).div(2);
export const BSCMAINNET_USDC_PER_BLOCK_REWARD = parseUnits("0.075342465753424657", 18).div(2);
export const BSCMAINNET_USDT_PER_BLOCK_REWARD = parseUnits("0.138127853881278538", 18).div(2);
export const BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.002278935185185185", 18).div(2);

export const BSCMAINNET_DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const BSCMAINNET_PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const BSCMAINNET_PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BSCMAINNET_VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const BSCMAINNET_NEW_VAI_IMPLEMENTATION = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";
export const BSCMAINNET_NEW_PLP_IMPLEMENTATION = "0x0C52403E16BcB8007C1e54887E1dFC1eC9765D7C";
export const BSCMAINNET_NEW_PRIME_IMPLEMENTATION = "0xBAb8c229B6C19c443b942F228B076Ca0d4f2260E";
export const BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x30FA1436071fb25Ee5bf32f17DA23f02ee989d4E";
export const BSCMAINNET_VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0xE57824ffF03fB19D7f93139A017a7E70f6F25166";
export const BSCMAINNET_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const BSCMAINNET_GOVERNANCE_BRAVO = "0x2d56dC077072B53571b8252008C60e945108c75a";
export const BSCMAINNET_BRAVO_NEW_IMPLEMENTATION = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
const BSCMAINNET_NEW_BLOCK_RATE = 21024000;

// Doubling the previous value, to be reviewed
export const MIN_VOTING_PERIOD = 3600 * 2;
export const MAX_VOTING_PERIOD = 403200 * 2;
export const MIN_VOTING_DELAY = 1 * 2;
export const MAX_VOTING_DELAY = 201600 * 2;

export const NT_VOTING_PERIOD = 28800 * 2;
export const NT_VOTING_DELAY = 1 * 2;
export const NT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const FT_VOTING_PERIOD = 28800 * 2;
export const FT_VOTING_DELAY = 1 * 2;
export const FT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const CT_VOTING_PERIOD = 7200 * 2;
export const CT_VOTING_DELAY = 1 * 2;
export const CT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const PROPOSAL_TIMELOCKS = [
  "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396", // NT
  "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02", // FT
  "0x213c446ec11e45b15a6E29C1C1b402B8897f606d", // CT
];

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

export const vip482 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain",
    description: `Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BSCMAINNET_XVS_VAULT_PROXY, "setBlocksPerYear(uint256)", NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK],
      },

      {
        target: BSCMAINNET_XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [BSCMAINNET_XVS, BSCMAINNET_XVS_PER_BLOCK_REWARD],
      },
      {
        target: BSCMAINNET_COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK],
      },
      {
        target: BSCMAINNET_PLP_PROXY,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BSCMAINNET_BTCB, BSCMAINNET_ETH, BSCMAINNET_USDC, BSCMAINNET_USDT],
          [
            BSCMAINNET_BTCB_PER_BLOCK_REWARD,
            BSCMAINNET_ETH_PER_BLOCK_REWARD,
            BSCMAINNET_USDC_PER_BLOCK_REWARD,
            BSCMAINNET_USDT_PER_BLOCK_REWARD,
          ],
        ],
      },
      {
        target: BSCMAINNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCMAINNET_PRIME_PROXY, BSCMAINNET_NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: BSCMAINNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCMAINNET_PLP_PROXY, BSCMAINNET_NEW_PLP_IMPLEMENTATION],
      },
      {
        target: BSCMAINNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: BSCMAINNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION],
      },
      {
        target: BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCMAINNET_XVS_VAULT_PROXY],
      },
      {
        target: BSCMAINNET_VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [BSCMAINNET_NEW_VAI_IMPLEMENTATION],
      },
      {
        target: BSCMAINNET_NEW_VAI_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCMAINNET_VAI_UNITROLLER],
      },

      // set new block rate in xvs vault
      {
        target: BSCMAINNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [BSCMAINNET_NEW_BLOCK_RATE],
      },

      // Accept admin of Bravo
      {
        target: BSCMAINNET_GOVERNANCE_BRAVO,
        signature: "_acceptAdmin()",
        params: [],
      },

      // Update Bravo impl
      {
        target: BSCMAINNET_GOVERNANCE_BRAVO,
        signature: "_setImplementation(address)",
        params: [BSCMAINNET_BRAVO_NEW_IMPLEMENTATION],
      },

      // Update validation params in Bravo

      {
        target: BSCMAINNET_GOVERNANCE_BRAVO,
        signature: "setValidationParams((uint256,uint256,uint256,uint256))",
        params: [[MIN_VOTING_PERIOD, MAX_VOTING_PERIOD, MIN_VOTING_DELAY, MAX_VOTING_DELAY]],
      },

      {
        target: BSCMAINNET_GOVERNANCE_BRAVO,
        signature: "setProposalConfigs((uint256,uint256,uint256)[])",
        params: [PROPOSAL_CONFIGS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip482;
