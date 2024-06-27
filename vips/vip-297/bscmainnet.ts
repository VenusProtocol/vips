import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const REDEEMER = "0xd039B647603219D6D39C051c25f945c0E53d75F3";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const PESSIMISTIC = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CHAOS_LABS = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const SKYNET = "0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c";

// USDC
export const CHAOS_LABS_AMOUNT = parseUnits("79000", 18);
export const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);
export const COMMUNITY_WALLET_AMOUNT = parseUnits("15000", 18);

// USDT
export const CERTIK_AMOUNT = parseUnits("17500", 18);
export const PESSIMISTIC_AMOUNT = parseUnits("5000", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("2500", 18);
export const SKYNET_USDT_AMOUNT_DIRECT = parseUnits("275000", 18);

export const SKYNET_XVS_AMOUNT = parseUnits("52884", 18);

/**
 * 1 USDT = 42.193217 vUSDT
 * so, 338,000 USDT = 14,261,307.346 vUSDT
 */
export const vUSDT_REDEEM_AMOUNT = parseUnits("14261307.346", 8);
export const REDEEM_USDT_AMOUNT = parseUnits("338000", 18);

/**
 * 1 USDC = 42.124123 vUSDC
 * so 71,000 USDC = 2,990,812.733 vUSDC
 */
export const vUSDC_REDEEM_AMOUNT = parseUnits("2990812.733", 8);
export const REDEEM_USDC_AMOUNT = parseUnits("71000", 18);

export const vip297 = () => {
  const meta = {
    version: "v2",
    title: "VIP-297 Liquidity Management and pending payments",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 17,500 USDT to Certik for the retainer program
- Transfer 32,500 USDC to Quantstamp for the retainer program
- Transfer 5,000 USDT to Pessimistic for the audit of the VAIController upgrade
- Transfer 2,500 USDT to Fairyproof for the audit of the VAIController upgrade
- Transfer 150,000 USDC to ChaosLabs for the retainer program
- Transfer 10,000 USDC to the Community Wallet for the Venus Ethereum launch contest rewards on Galxe
- Transfer 5,000 USDC to the Community Wallet to refund the PT-weETH bootstrap liquidity on Ethereum mainnet
- Transfer 52,884 XVS and 613,000 USDT to Skynet for the liquidity management of XVS

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of May 2024
- Cost: 17,500 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**Quantstamp - retainer program**

- Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
- Concept: Retainer program - 4/4 monthly payment
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-proposal-for-ongoing-audits/4083)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xdc7b9c9893f6766a15cdda3dc4d819e840f59d651aca3c83b0b04d76aaa8b349)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

**Pessimistic - VAI Controller upgrade**

- Auditor: Pessimistic ([https://pessimistic.io](https://pessimistic.io/))
- Payload: https://github.com/VenusProtocol/venus-protocol/pull/467
- Status: audit started on April 25th, 2024. Completed on April 26th, 2024
- Cost: 5,000 USDT, to be sent to the BEP20 address 0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f

**Fairyproof - VAI Controller upgrade**

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload: https://github.com/VenusProtocol/venus-protocol/pull/467
- Status: audit started on April 15th, 2024. Completed on April 18th, 2024
- Cost: 2,500 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

**Chaos Labs - retainer program**

- Provider: [ChaosLabs.xyz](http://chaoslabs.xys/)
- Concept: Retainer program - Q1 2024. As per agreement: $100K/Quarter + $10K opBNB March 2024 + $30K for opBNB (APR-JUL) + $30K for ETH (APR-JUL). TTL: $170K minus a $20K discount provided by ChaosLabs due to low activity on opBNB
- Cost: 150,000 USDC to be sent to the BEP20 address 0xfb1912af5b9d3fb678f801bf764e98f1c217ef35

**Galxe - Venus Ethereum launch contest**

- Provider: [Galxe](https://www.galxe.com/). Receiver: [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) (who funded the contest)
- Concept: rewards for the campaign [Venus Deployment to Ethereum Mainnet](https://app.galxe.com/quest/Venus/GCBD1tTKJz)
- Cost: 10,000 USDC to be sent to the BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391

**Community Wallet - Refund the bootstrap liquidity of the PT-weETH market on Ethereum**

- Provider: Venus Community wallet. Received by: Venus Treasury
- Concept: refund the PT-weETH bootstrap liquidity (5,000 USDC) on Ethereum mainnet, sent to [Ethereum Venus Treasury.](https://etherscan.io/tx/0xf004c6ed7db3a2ab1703959e3c466db7b3b3b23707b781c029eb425e0f4a08da)
- Cost: 5,000 USDC to be sent to the BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391

**Skynet Trading - Liquidity Management of native Venus tokens**

- Provider: Skynet Trading ([https://skynettrading.com](https://skynettrading.com/))
- Concept: Liquidity Management and fees for native Venus tokens
- References:
    - [Community proposal](https://community.venus.io/t/appoint-skynet-trading-as-liquidity-manager-for-native-venus-tokens/4271)
    - [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x6725e4f724d3e58e8918f43654fe3adb1ad05449cc637814b883bfa78c29149c)
- Cost: 52,884 XVS ($550K, assuming 1 XVS = $10.40) and 613,000 USDT
    - liquidity management: 550,000 USDT
    - SkyNet Annual fee: 60,000 USDT
    - Yearly maintenance costs of the legal entity: 3,000 USDT
    - Funds to be transferred to the DeFiTech/SkyNet Multisig 0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/273)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PESSIMISTIC_AMOUNT, PESSIMISTIC],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT, CHAOS_LABS],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, COMMUNITY_WALLET_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [SKYNET, SKYNET_XVS_AMOUNT],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDT, vUSDT_REDEEM_AMOUNT, REDEEMER],
      },
      {
        target: REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [vUSDT, SKYNET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, SKYNET_USDT_AMOUNT_DIRECT, SKYNET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, vUSDC_REDEEM_AMOUNT, REDEEMER],
      },
      {
        target: REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [vUSDC, CHAOS_LABS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip297;
