import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const vip565 = () => {
  const meta = {
    version: "v2",
    title: "VIP-565 [BNB Chain] Adjust Prime Rewards Allocation for November 2025",
    // disable eslint-disable-next-line
    description: `## **Description**

Following the community proposal [“Proposal: Adjust Prime Rewards Allocation for November 2025”](https://community.venus.io/t/adjust-prime-rewards-allocation-for-nov-25/5519), if passed, this VIP will implement the following changes on BNB Chain:

- **Adjust Prime income distribution**
    - 25% to [USDCPrimeConverter](https://bscscan.com/address/0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b) (-25pp)
    - 75% to [USDTPrimeConverter](https://bscscan.com/address/0xD9f101AA67F3D72662609a2703387242452078C3) (+25pp)
- **Update distribution speeds in the Prime markets**
    - USDT: 55,000 USDT/month (+30,000)
    - USDC: 55,000 USDC/month (+30,000)

### **References**

- Community post: [Proposal: Adjust Prime Rewards Allocation for November 2025](https://community.venus.io/t/adjust-prime-rewards-allocation-for-nov-25/5519)
- Previous Prime adjustments on BNB Chain: [Proposal: Adjust Prime Rewards Allocation for October 2025](https://community.venus.io/t/proposal-adjust-prime-rewards-allocation-for-october-2025/5368/1) ([VIP-550](https://app.venus.io/#/governance/proposal/550?chainId=56))
- [Venus Prime documentation](https://docs-v4.venus.io/whats-new/prime-yield)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/635/files)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 1500, USDT_PRIME_CONVERTER],
            [0, 500, USDC_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDC, USDT],
          [15400990000000000n, 15400990000000000n],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip565;
