import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;

export const MESSARI = "0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a";
export const CHAOS_LABS = "0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038";

export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT_ETH = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const MESSARI_USDC_AMOUNT_1 = parseUnits("20836", 6);
export const CHAOS_LABS_USDC_AMOUNT = parseUnits("100000", 18);
export const MESSARI_USDC_AMOUNT_2 = parseUnits("2914", 6);
export const USDT_TO_SWAP = parseUnits("2916", 6);

export const UNISWAP_SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const vip561 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-561 Payments issuance to Providers",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer 23,750 USDC from the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) to Messari for Commissioned Research reports
- Transfer 100,000 USDC from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Chaos Labs for risk management services

**Details**

**Messari Protocol Services**

- Service provider: Messari ([https://messari.io](https://messari.io/))
- Concept: Venus Commissioned Research reports for Q3 2025.
- Cost: 23,750 USDC, to be sent to the Ethereum address 0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a
- Last VIP with a payment to Messari: [VIP-474](https://app.venus.io/#/governance/proposal/474?chainId=56)

**Chaos Labs**

- Risk Manager: Chaos Labs ([https://chaoslabs.xyz](https://chaoslabs.xyz/))
- Risk Management services from October 1st, 2025 to December 31st, 2025
- References:
    - [Proposal in the community forum](https://community.venus.io/t/chaos-labs-venus-renewal/5160/3)
    - [Snapshot vote](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xa8ea32ac0a6d36d037c31bfafc658c5e8e0fb4b93ec76aa5d574ef6489b83eac)
- Cost: 100,000 USDC, to be sent to the BNB Chain address 0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/630)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDT_ETH, USDT_TO_SWAP, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDT_ETH,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, USDT_TO_SWAP],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: UNISWAP_SWAP_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [
            USDT_ETH,
            USDC_ETH,
            100,
            ethereum.NORMAL_TIMELOCK,
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
            USDT_TO_SWAP,
            MESSARI_USDC_AMOUNT_2,
            0n,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC_ETH, MESSARI_USDC_AMOUNT_1, MESSARI],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_ETH,
        signature: "transfer(address,uint256)",
        params: [MESSARI, MESSARI_USDC_AMOUNT_2],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC_BSC, CHAOS_LABS_USDC_AMOUNT, CHAOS_LABS],
      },
      {
        target: USDT_ETH,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, 0],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip561;
