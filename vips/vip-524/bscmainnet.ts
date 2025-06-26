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

export const vip524 = () => {
  const meta = {
    version: "v2",
    title: "VIP-524 [BNB Chain] Block Rate Upgrade (2/2)",
    description: `#### Summary

If passed, following the community proposal “[Maxwell Hardfork Upgrade Pt 2](https://community.venus.io/t/maxwell-hardfork-upgrade-pt-2/5154)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xfc592b816f1a327bf432d20877c706d807f4d2f3dbb934958a2a074f7a033f6d)), this VIP will perform the following changes, taking into account the increase in the block rate on BNB Chain, from one block every 1.5 seconds to one block every 0.75 seconds:

- Upgrade implementation of VAIController, Prime, PrimeLiquidityProvider and every VToken contract, with the new blocks per year (42,048,000)
- Set the new blocks per year in the XVSVaultProxy contract
- Update the voting periods for each VIP type (these periods are defined in block numbers)
- Update of the rewards per block on the XVS Vault, VAI Vault and Prime Liquidity Provider, halving the rewards per block. Halve the XVS emissions per block in the XVS market

#### Description

These changes are mandatory to accommodate the Venus Protocol to the Maxwell hardfork on BNB Chain: [BEP-524: Short Block Interval Phase Two: 0.75 seconds](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-524.md), which will happen on [June 30th, at 2:30AM UTC](https://github.com/bnb-chain/bsc/releases/tag/v1.5.16).

VAIController, Prime, PrimeLiquidityProvider and every VToken contract had a constant value with the number of blocks per year. Most of the implementations have been simply redeployed using the new value.

The different types of “rewards” are defined per block on Venus (XVS Vault, VAI Vault, Prime and emissions). They must be halved to maintain the same daily amounts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations and configurations are properly set on BNB Chain, with the right parameters
- **Deployment on testnet**: the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/ee06e15429036841e9bf43c0f0b29c2b1a3d6efc/audits/132_block_rate_fairyproof_20250414.pdf) (2025/04/14)
- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/0246a8913216a56bab0f9a9ea3e772a5cbd69f99/audits/133_block_rate_certik_20250417.pdf) (2025/04/17)

#### Deployed contracts

BNB Chain mainnet

- [New implementation of VToken for Isolated pools](https://bscscan.com/address/0x228Ea224d62D14a2e2cb9B43083aE43954C39B67)
- [New implementation of Shortfall](https://bscscan.com/address/0x4F41EcAce160f6ef893102D64f84E8040c06d8B0)
- [New PoolLens](https://bscscan.com/address/0x59a96A6f463d57dA20bcc15359e55310D1CAD8B0)
- [New VAIController implementation](https://bscscan.com/address/0xF1A8B40CA68d08EFfa31a16a83f4fd9b5c174872)
- [New Prime implementation](https://bscscan.com/address/0x211b1c2C778daeeD39cE0E6a91Edb1d82a20BB2B)
- [New PrimeLiquidityProvider implementation](https://bscscan.com/address/0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF)

BNB Chain testnet

- [New implementation of VToken for Isolated pools](https://testnet.bscscan.com/address/0xaaCe28600A02E42198AfEe60A2cCDADC9FFe513B)
- [New implementation of Shortfall](https://testnet.bscscan.com/address/0xdD939b73C40cE3fe540bE46cA378f74196Dc86b7)
- [New PoolLens](https://testnet.bscscan.com/address/0xa6cDad72854d338d75C40f1a863A0f9c488f4D7F)
- [New VAIController implementation](https://testnet.bscscan.com/address/0xDFcbfb82a416B5CEbB80FECFbBF4E055299931FF)
- [New Prime implementation](https://testnet.bscscan.com/address/0x0323505ACde55903D0AC8da7c4d146A7F4b25f77)
- [New PrimeLiquidityProvider implementation](https://testnet.bscscan.com/address/0xFB136764E8F3ffA2Ed57F150853dbf08B8a09988)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/573)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0x91961771aef4e92ca0563a3b35262b04a10795a40ad8fe699bd0292d430ddfb1)
- [Commit with the confirmed timestamp for the Maxwell hardfork](https://github.com/bnb-chain/bsc/pull/3130)
- [VIP-520 [BNB Chain] Block Rate Upgrade (1/2)](https://app.venus.io/#/governance/proposal/520?chainId=56)`,
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

export default vip524;
