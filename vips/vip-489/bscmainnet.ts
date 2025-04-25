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
export const BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.00078125", 18).div(2);

export const BSCMAINNET_DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const BSCMAINNET_PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const BSCMAINNET_PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BSCMAINNET_VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const BSCMAINNET_NEW_VAI_IMPLEMENTATION = "0xB2bF2332dbbD15c9F9A6415D9D84C317eA6B774C";
export const BSCMAINNET_NEW_PLP_IMPLEMENTATION = "0x24b4A647B005291e97AdFf7078b912A39C905091";
export const BSCMAINNET_NEW_PRIME_IMPLEMENTATION = "0x41F3a1a8000eAc9AD778dEf160C41d8B061965E0";
export const BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x74c8a97BE672db3e9a224648bE566AdA5F43B378";
export const BSCMAINNET_VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0x2c36397dF3BC5Ea9CD710eEe273006Ab9D1ECAd4";
export const BSCMAINNET_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const BSCMAINNET_GOVERNANCE_BRAVO = "0x2d56dC077072B53571b8252008C60e945108c75a";
export const BSCMAINNET_BRAVO_NEW_IMPLEMENTATION = "0x9aa19E4585aC12F0087aa6468DF5587C88B4495b";
const BSCMAINNET_NEW_BLOCK_RATE = 21024000;

// Doubling the previous value, to be reviewed
export const MIN_VOTING_PERIOD = 3600 * 2;
export const MAX_VOTING_PERIOD = 403200 * 2;
export const MIN_VOTING_DELAY = 1;
export const MAX_VOTING_DELAY = 201600 * 2;

export const NT_VOTING_PERIOD = 28800 * 2;
export const NT_VOTING_DELAY = 1;
export const NT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const FT_VOTING_PERIOD = 28800 * 2;
export const FT_VOTING_DELAY = 1;
export const FT_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

export const CT_VOTING_PERIOD = 7200 * 2;
export const CT_VOTING_DELAY = 1;
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

export const vip489 = () => {
  const meta = {
    version: "v2",
    title: "VIP-489 [BNB Chain] Block Rate Upgrade (2/2)",
    description: `#### Summary

If passed, following the community proposal "[Venus Upgrades for BNB Chain Lorentz Hardfork](https://community.venus.io/t/venus-upgrades-for-bnb-chain-lorentz-hardfork/5060)" ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3629a746aafc7b683242db64e24388728140fd3beefb3642e8d34c837486c1c2)), this VIP will perform the following changes, taking into account the increase in the block rate on BNB Chain, from one block every 3 seconds to one block every 1.5 seconds:

- Upgrade implementation of VAIController, Prime, PrimeLiquidityProvider and every VToken contract, with the new blocks per year (21,024,000)
- Upgrade the implementation of the XVSVaultProxy, and set the blocks per year to the new value
- Upgrade the implementation of the GovernorBravoDelegator, with a new GovernorBravoDelegate, and update the voting periods for each VIP type (these periods are defined in block numbers)
- Update of the rewards per block on the XVS Vault, VAI Vault and Prime Liquidity Provider, halving the rewards per block. Halve the XVS emissions per block in the XVS market
- Transfer GovernorBravoDelegator to Governance

#### Description

These changes are mandatory to accommodate the Venus Protocol to the Lorentz hardfork on BNB Chain: [BEP-520: Short Block Interval Phase One: 1.5 seconds](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-520.md), which will happen on [April 29th, at 5:05AM UTC](https://x.com/BNBCHAIN/status/1910384574938423424).

VAIController, Prime, PrimeLiquidityProvider, XVSVault and every VToken contract had a constant value with the number of blocks per year. Most of the implementations have been simply redeployed using the new value. The XVSVault implementation has been redeployed adding a new function to support future changes in the blocks per year.

The different types of "rewards" are defined per block on Venus (XVS Vault, VAI Vault, Prime and emissions). They must be halved to maintain the same daily amounts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations and configurations are properly set on BNB Chain, with the right parameters
- **Deployment on testnet**: the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/ee06e15429036841e9bf43c0f0b29c2b1a3d6efc/audits/132_block_rate_fairyproof_20250414.pdf) (2025/04/14)
- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/0246a8913216a56bab0f9a9ea3e772a5cbd69f99/audits/133_block_rate_certik_20250417.pdf) (2025/04/17)

#### Deployed contracts

BNB Chain mainnet

- [New implementation of VToken for Isolated pools](https://bscscan.com/address/0x2c36397dF3BC5Ea9CD710eEe273006Ab9D1ECAd4)
- [New XVSVault implementation](https://bscscan.com/address/0x74c8a97BE672db3e9a224648bE566AdA5F43B378)
- [New VAIController implementation](https://bscscan.com/address/0xB2bF2332dbbD15c9F9A6415D9D84C317eA6B774C)
- [New Prime implementation](https://bscscan.com/address/0x41F3a1a8000eAc9AD778dEf160C41d8B061965E0)
- [New PrimeLiquidityProvider implementation](https://bscscan.com/address/0x24b4A647B005291e97AdFf7078b912A39C905091)
- [New PoolLens](https://bscscan.com/address/0xA179d2f1Fd53D15Bc790bE91d5fF4a0108E29621)
- [New GovernanceBravoDelegate (Governance Bravo implementation)](https://bscscan.com/address/0x9aa19E4585aC12F0087aa6468DF5587C88B4495b)

BNB Chain testnet

- [New implementation of VToken for Isolated pools](https://testnet.bscscan.com/address/0x78Da3E30a896Afd5E04cBC98fE37b8f027098638)
- [New XVSVault implementation](https://testnet.bscscan.com/address/0x471A33538D8A73fc7148F8B72A2A8BE6Ab9E3723)
- [New VAIController implementation](https://testnet.bscscan.com/address/0x52558EED5d8f4c86cC2d5EC5DF155521db8d0D48)
- [New Prime implementation](https://testnet.bscscan.com/address/0x73Ac7280b8f3EAF7F621c48ae2398733eD9fBC81)
- [New PrimeLiquidityProvider implementation](https://testnet.bscscan.com/address/0xD2eBa310E843fC6dc242187501bDf7c0F6b46681)
- [New PoolLens](https://testnet.bscscan.com/address/0x166C45bCCE54166Ecf9bCDF8d2EC562014A06048)
- [New GovernanceBravoDelegate (Governance Bravo implementation)](https://testnet.bscscan.com/address/0xB30b0b051132930e8E4A77f990CFdf78895f9E1A)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/531)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0x721e21f3b9b24e3214c4820ac6e3185c08eb8105ab1273ffc958f29a166a19c8)
- Community post "[Venus Upgrades for BNB Chain Lorentz Hardfork](https://community.venus.io/t/venus-upgrades-for-bnb-chain-lorentz-hardfork/5060)"
- Snapshot "[Venus Upgrades for BNB Chain Lorentz Hardfork](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3629a746aafc7b683242db64e24388728140fd3beefb3642e8d34c837486c1c2)"`,
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
        target: BSCMAINNET_COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [
          [BSCMAINNET_XVS_MARKET],
          [BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK],
          [BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK],
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

export default vip489;
