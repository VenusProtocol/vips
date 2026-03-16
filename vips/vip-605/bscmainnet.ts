import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const DEV_WALLET = "0x0000000000000000000000000000000000000000"; // TODO: set OTC wallet address

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Part 1: Treasury sells CAKE and THE to Risk Fund
// Treasury transfers CAKE and THE out; Risk Fund transfers equivalent USDT to Treasury
export const CAKE_AMOUNT = parseUnits("0", 18); // TODO: set CAKE amount
export const THE_AMOUNT = parseUnits("0", 18); // TODO: set THE amount
export const USDT_EQUIVALENT_FOR_TOKENS = parseUnits("0", 18); // TODO: set USD equivalent for CAKE + THE

// Part 2: Remaining bad debt - Risk Fund sweeps to dev wallet for OTC conversion
export const USDT_TO_DEV_WALLET = parseUnits("0", 18); // TODO: set USDT amount
export const WBNB_TO_DEV_WALLET = parseUnits("0", 18); // TODO: set WBNB amount

export const vip605 = () => {
  const meta = {
    version: "v2",
    title: "VIP-605 Repayment of Bad Debt - 15/03/2026",
    description: `If passed, this VIP will repay bad debt using two sources of funds:

**Part 1: Treasury token sale to Risk Fund**

The Risk Fund purchases CAKE and THE tokens from the Venus Treasury at their USD equivalent value. The Treasury transfers the tokens to the [Development Team wallet](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec), and the Risk Fund transfers an equal amount of USDT to the Treasury.

- CAKE from Treasury to Development Team wallet
- THE from Treasury to Development Team wallet
- Sweep equivalent USDT from Risk Fund to Treasury

**Part 2: Remaining bad debt via OTC**

For the remaining bad debt, USDT and WBNB are swept from the Risk Fund to the Development Team wallet. The Development Team will handle the OTC conversion to complete the bad debt repayment.

- Sweep USDT from Risk Fund to Development Team wallet
- Sweep WBNB from Risk Fund to Development Team wallet

This follows the same approach used in [VIP-564](https://app.venus.io/#/governance/proposal/564?chainId=56) for the October 10, 2025 bad debt repayment.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [VIP-564: Repayment of Bad Debt Using the Risk Fund](https://app.venus.io/#/governance/proposal/564?chainId=56)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Part 1: Treasury sells CAKE and THE tokens
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [CAKE, CAKE_AMOUNT, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [THE, THE_AMOUNT, DEV_WALLET],
      },
      // Sweep equivalent USDT from Risk Fund to Treasury
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, CORE_COMPTROLLER, bscmainnet.VTREASURY, USDT_EQUIVALENT_FOR_TOKENS],
      },

      // Part 2: Remaining bad debt - sweep from Risk Fund to dev wallet
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, CORE_COMPTROLLER, DEV_WALLET, USDT_TO_DEV_WALLET],
      },
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [WBNB, CORE_COMPTROLLER, DEV_WALLET, WBNB_TO_DEV_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip605;
