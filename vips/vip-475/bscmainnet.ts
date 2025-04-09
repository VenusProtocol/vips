import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEV_WALLET = "0x48e9d2128321cbf75cd108321459865357c00f15";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

/**
 * Prices (2025/04/08):
 * BTC: $77,630
 * BNB: $554
 * ETH: $1,493
 *
 * Total funding: $1,700,000
 *
 * BTC: 5% -> $85,000 -> 1.095 BTC
 * BNB: 31% -> $527,000 -> 951.26 BNB
 * ETH: 11% -> $187,000 -> 125.25 ETH
 * USDC: 53% -> $901,000 -> 901,000 USDC
 */
export const BTC_AMOUNT_DEV_FUND = parseUnits("1.095", 18); // $85,000, assuming 1 BTC = $77,630
export const WBNB_AMOUNT_DEV_FUND = parseUnits("951.26", 18); // $527,000, assuming 1 BNB = $554
export const ETH_AMOUNT_DEV_FUND = parseUnits("125.25", 18); // $187,000, assuming 1 ETH = $1,493
export const USDC_AMOUNT_DEV_FUND = parseUnits("901000", 18); // $901,000, assuming 1 USDC = $1

export const REQUIRED_VUSDC_FOR_USDC_DEV_FUND = parseUnits("35293580", 8); // assuming 1 USDC=39.171564 vUSDC

export const vip475 = () => {
  const meta = {
    version: "v2",
    title: "VIP-475 H2-2024 Development Funding",
    description: `#### Summary

Following the community post [Team Development Funding 2024 H2](https://community.venus.io/t/team-development-funding-2024-h2/5023), and the associated [snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x86dd9f3b7044767fb1831b9282917c721a7cc8abf19cff17245b90d410b4beff), if passed, this VIP will transfer the following tokens to the [Development Team](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec):

- 1.095 BTC
- 951.26 BNB
- 125.25 ETH
- 901,000 USDC

#### Details

Following the successful execution of multiple deployments, feature integrations, and protocol enhancements throughout 2024 contributing to a more than doubling of protocol revenue, a new funding proposal is required to reimburse development and maintenance of Venus from the second half of 2024 (H2 2024).

This proposal aims to reimburse efforts completed during H2 2024, totaling $1,700,000 This allocation will ensure the Venus Protocol continues to thrive, adapt, and lead in the evolving DeFi landscape.

**Key Accomplishments for H2-2024**

- VIP Execution: Executed 92 VIPs to enhance protocol parameters, markets, and features.
- Protocol Shortfall Repayment: Fully repaid all protocol shortfall, restoring financial integrity.
- Arbitrum Deployment: Deployed the Arbitrum XVS Bridge and established chain deployment.
- ZKSync Deployment: Deployed the ZKSync XVS Bridge and established chain deployment.
- Optimism Deployment: Deployed the Optimism XVS Bridge and established chain deployment.
- Base Deployment: Deployed the Base XVS Bridge and established chain deployment.
- Venus Prime Expansion: Deployed Venus Prime on Ethereum and Arbitrum.
- Token Converter Integration: Integrated token converters with DEX aggregators for automatic conversions.
- 2-Kink Interest Rate Model: Implemented a 2-Kink interest rate model on the BNB Market.
- Oracle Improvements: Improved oracles for LSTs and Restake Tokens with a two-step accuracy method.
- Omnichain Governance: Enabled governance on the BNB Chain for all multichain deployments.
- New Market Growth: Added more than 20 new markets across all chains.
- Liquid Staking Pools: Added liquid staking pools for Arbitrum and BNB Chain deployments.

**Planned Developments for H1-2025**

- Maintenance and Support: Upgrading Venus for impending BNB hard fork to increase block rate
- Performance & Gas Optimizations: Use Solidity Transient Storage and other optimizations.
- Capped Oracles: Introduce capped oracles for stable, secure pricing of LSTs and stablecoins.
- Enhanced Risk Management: “Risk Stewards” for automated, real-time parameter adjustments.
- ERC 4626 wrapper for vTokens: enhance vToken interoperability for capital efficiency and more
- Omnichain Governance Enhancements: Synchronize voting power across all chains and more
- Venus V5: Define and announce the Venus V5 proposal
- Multichain Deployments: Deploy to more EVM-compatible chains.

Continual maintenance and support remain essential to the protocol’s sustained success. Our team will commit resources to:

- Security Audits and Risk Management:
- Partner with leading security firms for continuous audits, ensuring Venus remains among the most secure and trusted DeFi protocols.
- Technical Support and Community Engagement:
- Provide round-the-clock technical support, host AMAs, surveys, and forums to engage with the community and integrate their feedback into future developments.
- Protocol Documentation and Education: Update and maintain comprehensive documentation for new releases, features, and markets, enabling users and integrators to easily navigate the protocol’s evolving landscape.

#### Funding Request

To cover the reimbursement of efforts during H2 2024 a total of $1,700,000 is requested. This budget will ensure ongoing innovation, responsive support, and rigorous security measures and scale resource capacity as the protocol also scaled from 1 to 8 chains.

- USDC: 53% ($901,000)
- BNB: 31% ($527,000). 951.26 BNB will be transferred, assuming 1 BNB = $554
- ETH: 11% ($187,000). 125.25 ETH will be transferred, assuming 1 ETH = $1,493
- BTC: 5% ($85,000). 1.095 BTC will be transferred, assuming 1 BTC = $77,630

This budget will ensure continuous support, progress and the delivery of planned developments to the Venus ecosystem.

USD prices have been considered on April 9th, 2025.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT_DEV_FUND, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT_DEV_FUND],
      },
      {
        target: DEV_WALLET,
        signature: "",
        params: [],
        value: WBNB_AMOUNT_DEV_FUND.toString(),
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, REQUIRED_VUSDC_FOR_USDC_DEV_FUND, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, DEV_WALLET, USDC_AMOUNT_DEV_FUND, bscmainnet.VTREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_DEV_FUND, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT_DEV_FUND, DEV_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip475;
