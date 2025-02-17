import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const VENUS_STARS_TREASURY = "0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D";

export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("393008", 18);
export const VENUS_STARS_AMOUNT_USDT = parseUnits("285615", 18);

export const vip454 = () => {
  const meta = {
    version: "v2",
    title: "VIP-454 Coverage of Vanguard/Stars Incident lossage (1/2)",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 285,614 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) to the [Venus Stars Treasury multisig](https://bscscan.com/address/0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D)
- Transfer 393,008 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) to the [Vanguard Treasury multisig](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca)

#### Details

As proposed and approved by the community in this [Forum proposal](https://community.venus.io/t/coverage-for-vanguard-stars-social-engineering-incident-lossage/4896) and this [snapshot vote](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf727db5a29bd87674e654d4f1c42b4fd6440e1b359665ce8d9031afb9e526d57), this is the first of two VIP’s to allocate funds from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to cover budgets for maintaining operations.

#### Community Treasury multisig

- Refund 285,615 USDT to Venus Stars Treasury multisig
- To be sent to BEP20: 0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D

#### Vanguard Treasury multisig

- Refund 393,008 USDT to Vanguard Treasury multisig
- To be sent to BEP20: 0xf645a387180F5F74b968305dF81d54EB328d21ca

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/504)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
        params: [USDT, VENUS_STARS_AMOUNT_USDT, VENUS_STARS_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
