import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";

export const NEW_CF = parseUnits("0.8", 18);
export const NEW_LT = parseUnits("0.8", 18);
export const NEW_LI = parseUnits("1.1", 18);

export const vip597 = () => {
  const meta = {
    version: "v2",
    title: "VIP-597 [BNB Chain] slisBNB Core Pool Risk Parameter Update",
    description: `#### Summary

If passed, this VIP will update the risk parameters for the [slisBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) market in the Venus Core Pool on BNB Chain, enabling it as productive collateral to support BNB looping strategies for Binance Wallet users.

#### Description

**Context**

To leverage Binance Wallet's distribution channel, Venus Protocol will enable BNB looping for Binance Wallet users directly within the wallet by enabling slisBNB as active collateral in the Venus Core Pool.

**Parameter Changes**

| Parameter | Current | New |
|---|---|---|
| Collateral Factor (CF) | 0% | 80% |
| Liquidation Threshold (LT) | 0% | 80% |
| Liquidation Incentive (LI) | 100% | 110% |

**Rationale**

- **Unlock utility for slisBNB**: Moving CF/LT from 0% to 80% allows slisBNB to be used as productive collateral in Core Pool, enabling users to borrow against their slisBNB holdings.
- **Support Binance Wallet-native looping**: Users can execute BNB looping strategies directly via Binance Wallet's distribution channel without switching platforms.
- **Maintain liquidation motivation**: LI of 110% provides sufficient incentive for liquidators during stress conditions, improving liquidation reliability. The 10% liquidation penalty balances protocol safety and user cost.

**Risk Notes**

- Increasing CF/LT to 80% significantly expands borrow power and should be monitored for slisBNB liquidity depth and liquidation execution efficiency.
- LI of 110% introduces a 10% borrower penalty at liquidation.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/677)
- [Community post](https://community.venus.io/)
- [vslisBNB market](https://bscscan.com/address/0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc)

#### Voting Options

- For: I agree that Venus Protocol should proceed with this proposal
- Against: I do not think that Venus Protocol should proceed with this proposal
- Abstain: I am indifferent to whether Venus Protocol proceeds or not`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vslisBNB, NEW_CF, NEW_LT],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [vslisBNB, NEW_LI],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip597;
