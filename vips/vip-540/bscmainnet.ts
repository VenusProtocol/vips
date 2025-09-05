import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const CERTIK = "0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const PESSIMISTIC = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";

export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const CERTIK_USDT_AMOUNT = parseUnits("17500", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const PESSIMISTIC_USDT_AMOUNT = parseUnits("4375", 18);

export const vip540 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-540 Payments issuance for audits",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer 32,500 USDC from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Quantstamp, for the retainer program (payment 4/4)
- Transfer 17,500 USDT from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Certik, for the retainer program (September 2025)
- Transfer 4,375 USDT from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to Pessimistic, for the second payment of the audit of the Venus ERC4626 wrapper on the VTokens of Core pool on BNB Chain

#### Details

**Quantstamp - retainer program**

- Auditor: Quantstamp ([https://quantstamp.com](https://quantstamp.com))
- Concept: Retainer program renewal - 4/4 monthly payment. Quantstamp will charge $130,000 in total for the security services provided in [their proposal](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101). This will be paid in four monthly installments of $32,500 in USDC from the Venus Treasury, with the first paid on or around June 1st, 2025, and the fourth and final payment to be made on or around September 1st, 2025.
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-renewal-for-ongoing-security-audits/5101)
    - [Snapshot vote](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcc3b67bf1dd6c1bacdba42d42862713468872af39f73efe9c9c5243eb2285b46)
    - Payment 1/4: [VIP-505 Payments to providers & refunds](https://app.venus.io/#/governance/proposal/505?chainId=56)
    - Payment 2/4: [VIP-528 Payments to providers & refunds](https://app.venus.io/#/governance/proposal/528?chainId=56)
    - Payment 3/4: [VIP-536 Payments issuance for audits and other expenses](https://app.venus.io/#/governance/proposal/536?chainId=56)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com))
- Concept: Retainer program - monthly payment of September 2025.
- Cost: 17,500 USDT, to be sent to the BEP20 address 0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39

**Pessimistic**

- Auditor: Pessimistic ([https://pessimistic.io](https://pessimistic.io))
- Concept: payment 2/2 for auditing [Venus ERC4626 wrapper on the VTokens of Core pool on BNB Chain](https://github.com/VenusProtocol/ERC4626/pull/2)
- Status: audit started on July 28th, 2025. Final report on July 31st, 2025
- References:
    - Payment 1/2: [VIP-536 Payments issuance for audits and other expenses](https://app.venus.io/#/governance/proposal/536?chainId=56)
- Cost: 4,375 USDT, to be sent to the BEP20 address 0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/608)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, CERTIK_USDT_AMOUNT, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC_BSC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, PESSIMISTIC_USDT_AMOUNT, PESSIMISTIC],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip540;
