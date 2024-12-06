import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const VENUS_STARS_TREASURY = "0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D";
export const CHAOS_LABS = "0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038";
export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";

const VUSDC_AMOUNT = parseUnits("6512000", 8); // assuming 1 USDC=40.65040650 ~ 40.7 vUSDC
export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("17895", 18);
export const VENUS_STARS_BEINCRYPTO_AMOUNT_USDT = parseUnits("93800", 18);
export const CHAOS_LABS_AMOUNT_USDC = parseUnits("160000", 18);
export const VANGUARD_VANTAGE_SOURCECONTROL_AMOUNT_USDT = parseUnits("24000", 18);
export const CERTIK_AMOUNT_USDT = parseUnits("52500", 18);

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500 Payments to providers and Refunds",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 17,895 USDT to Vanguard Vantage Treasury for a refund of various Venus marketing, sponsorships, Venues and Conferences in Q3 2024.
- Transfer 93,800 USDT to the Venus Stars Treasury for a refund and payment of the balance for the annual payment of VenusLabs contracted PR Agency BeInCrypto.
- Transfer 160,000 USDC to ChaosLabs for the Quarterly payment
- Transfer 24,000 USDT to the Vanguard Vantage Treasury for a refund of SourceControl Web3
- Transfer 52,500 USDT to Certik, for the retainer program (October, November and December 2024)

#### Details

**Vanguard Vantage - Refunds of Q3 2024 Venus.io WEB3 Conferences, hosting, co-hosting & sponsorships expenses refund**

- Crypto Valley Summit Event
- Token2049 Founders and Investor Brunch
- KelpDAO Token2049 Restaking Conclave
- Cost: 17,895 USDT, to be sent to the Vanguard Vantage Treasury ([0xf645a387180F5F74b968305dF81d54EB328d21ca](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca))

**BeInCrypto - Annual PR Agency**

- Provider: BeInCrypto (https://beincrypto.com)
- Concept: 12-month Performance Marketing Contract (August 2024 to September 2025)
- Cost: 93,800 USDT, to be sent to the Venus Stars Treasury ([0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D](https://bscscan.com/address/0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D)), that already paid 50% to BeInCrypto (Payment: [Ethereum Transaction Hash (Txhash) Details | Etherscan](https://etherscan.io/tx/0x7043c7e01f3a79843066da6539f6480106434dbf24b03b9290da5efc65ffeaa1))

**Chaos Labs**

- [https://chaoslabs.xyz](https://chaoslabs.xyz/)
- Risk Management Quarterly Payment: October 1, 2024 - December 31, 2024: $100,000.00
- Additional Deployments (Arbitrum): October 1, 2024 - December 31, 2024: $30,000.00
- Additional Deployments (ZKsync): October 1, 2024 - December 31, 2024: $30,000.00
- Cost: 160,000 USDC, to be sent to the BEP20 address [0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038](https://bscscan.com/address/0xb98D807cDD58a35d2Fca300bEBC06ac39A7CE038)

**SourceControl Web3 ltd**

- Provider: SourceControl ([https://www.source-control.io](https://www.source-control.io/))
- Concept: WEB3 Staff recruiting campaign
- Cost: 24,000 USDT, to be refunded to the Vanguard Vantage Treasury ([0xf645a387180F5F74b968305dF81d54EB328d21ca](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca)) ([Payment TX](https://etherscan.io/tx/0x895d90d04b551cf089c2ca46b1138322781cc7f39dae540e0ea282811bf84c8d))

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of October, November and December 2024.
- Cost: 52,500 USDT, to be sent to the BEP20 address [0x4cf605b238e9c3c72d0faed64d12426e4a54ee12](https://bscscan.com/address/0x4cf605b238e9c3c72d0faed64d12426e4a54ee12)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/414)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VENUS_STARS_BEINCRYPTO_AMOUNT_USDT, VENUS_STARS_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, CHAOS_LABS, CHAOS_LABS_AMOUNT_USDC, VTREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_SOURCECONTROL_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT_USDT, CERTIK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
