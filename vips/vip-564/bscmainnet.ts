import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const BSCMAINNET_USDT = "0x55d398326f99059ff775485246999027b3197955";
export const BSCMAINNET_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const DEV_WALLET = "0x5e7bb1f600e42bc227755527895a282f782555ec";
export const USDT_TOKENS_AMOUNT = parseUnits("1200000", 18); // 1.2 million USDT

export const vip564 = () => {
  const meta = {
    version: "v2",
    title: "VIP-564 Repayment of Bad Debt Using the Risk Fund",
    description: `If passed, this VIP will withdraw 1,200,000 USDT from the[Risk Fund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42)contract on BNB Chain to the[Development Team wallet](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec), which will convert them to$CAKE, $FIL and $EIGEN and transfer them to finish the subsequent steps to clear the bad debt.

This is the prerequisite exposed in the community post "[Proposal to Repay 10 Oct 2025 Bad Debt with the Venus Risk Fund](https://community.venus.io/t/proposal-to-repay-10-oct-2025-bad-debt-with-the-venus-risk-fund/5525)". In the follow up steps, these funds will be used to repay the bad debt generated during the 10 Oct 2025 Market Crash.

### **References**

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/634/files)
- Community post "[Proposal to Repay 10 Oct 2025 Bad Debt with the Venus Risk Fund](https://community.venus.io/t/proposal-to-repay-10-oct-2025-bad-debt-with-the-venus-risk-fund/5525)"`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [BSCMAINNET_USDT, BSCMAINNET_CORE_COMPTROLLER, DEV_WALLET, USDT_TOKENS_AMOUNT],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip564;
