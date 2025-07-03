import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;

export const CERTIK = "0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const sUSDe_REFUND_ADDRESS = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";
export const MESSARI = "0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a";
export const NODEREAL = "0x435012d5ffebe02d3d8ceff769b379cf2b1c32ee";

export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const sUSDe_ETH = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const CERTIK_USDT_AMOUNT_1 = parseUnits("17500", 18);
export const CERTIK_USDT_AMOUNT_2 = parseUnits("35000", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const sUSDe_REFUND_AMOUNT = parseUnits("10000", 18);
export const MESSARI_USDC_AMOUNT = parseUnits("23750", 6);
export const NODEREAL_USDT_AMOUNT = parseUnits("14580", 18);

export const vip528 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-528 Payments to providers & refunds",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer 32,500 USDC from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Quantstamp, for the retainer program (payment 2/4)
- Transfer 17,500 USDT from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Certik, for the retainer program (July 2025)
- Transfer 14,580 from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) USDT to NodeReal for the Meganode Enterprise service (Web3 RPC endpoint)
- Transfer 23,750 USDC from the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) to Messari for Commissioned Research reports
- Refund 35,000 USDT from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Certik, for the retainer program (May, June 2025)
- Refund 10,000 sUSDe from the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) to the Community supporter 0x3e..0c

**Quantstamp - retainer program**

- Auditor: Quantstamp (https://quantstamp.com/)
- Concept: Retainer program renewal - 2/4 monthly payment. Quantstamp will charge $130,000 in total for the security services provided in [their proposal](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101). This will be paid in four monthly installments of $32,500 in USDC from the Venus Treasury, with the first to be paid on or around June 1st, 2025, and the fourth and final payment to be made on or around September 1st, 2025.
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101)
    - [Snapshot vote](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcc3b67bf1dd6c1bacdba42d42862713468872af39f73efe9c9c5243eb2285b46)
    - Payment 1/4: [VIP-505 Payments to providers & refunds](https://app.venus.io/#/governance/proposal/505?chainId=56)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of July 2025.
- Cost: 17,500 USDT, to be sent to the BEP20 address 0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39

**NodeReal - Meganode Enterprise**

- Provider: NodeReal ([https://nodereal.io](https://nodereal.io/))
- Service: Meganode Enterprise (https://nodereal.io/meganode) for 6 months (January 2025 - July 2025). The Web3 RPC endpoints provided by NodeReal are used by the [official Venus UI](https://app.venus.io/) and several backend services to collect data from the different blockchains (BNB Chain, Ethereum, Arbitrum one, opBNB, ZKSync Era, Optimism, Unichain and Base).
- Cost: 14,580 USDT (2,430 USDT per month), to be sent to the BEP20 address 0x435012d5ffebe02d3d8ceff769b379cf2b1c32ee
- Last VIP with a payment to NodeReal: [VIP-421](https://app.venus.io/#/governance/proposal/421?chainId=56)

**Messari Protocol Services**

- Service provider: Messari ([https://messari.io](https://messari.io/))
- Concept: Venus Commissioned Research reports for Q1 2025.
- Cost: 23,750 USDC, to be sent to the Ethereum address 0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a
- Last VIP with a payment to Messari: [VIP-474](https://app.venus.io/#/governance/proposal/474?chainId=56)

**Certik - refund retainer program May and June 2025**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Refund the payment of the retainer program for May and June 2025. In the [VIP-505](https://app.venus.io/#/governance/proposal/505?chainId=56) ([TX](https://bscscan.com/tx/0x7cb4a79df6321ac63a66c48bb41b1226efdfccf6f5c0172cf5d6c4fea486f251)), 35,000 USDT were transferred to the wrong Certik wallet. Those funds were refunded to the Venus Treasury on June 18th ([TX](https://bscscan.com/tx/0xe465ea8dd9883bb6a80222b603752c9d381bebdfa85ab0e50ab5904ef38bbd9e)). This VIP will re-transfer those funds (associated with the Certik retainer program for May and June 2025) to the right Certik wallet.
- Amount: 35,000 USDT, to be sent to the BEP20 address 0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39

**sUSDe - refund**

- Destination: [Community supporter 0x3e..0c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)
- Concept: Refund of the liquidity provided by the Community supporter [here](https://etherscan.io/tx/0x78fa0572ad7b63a43b8aa1434338138068211777bc9610a29b9d7c43aac634a0), refunded by the Ethena team [here](https://etherscan.io/tx/0xf7c20524b5af9147b10da774f5fa387e7cae6df55189ea11a651e50044648b8a) to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA)
- Amount: 10,000 [sUSDe](https://etherscan.io/token/0x9d39a5de30e57443bff2a8307a4256c8797a3497), to be sent to the ERC20 address [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, CERTIK_USDT_AMOUNT_1, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, CERTIK_USDT_AMOUNT_2, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC_BSC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, NODEREAL_USDT_AMOUNT, NODEREAL],
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDe_ETH, sUSDe_REFUND_AMOUNT, sUSDe_REFUND_ADDRESS],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC_ETH, MESSARI_USDC_AMOUNT, MESSARI],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip528;
