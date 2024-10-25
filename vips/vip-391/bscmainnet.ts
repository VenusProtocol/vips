import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const vLTC_CORE = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vAAVE_CORE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vTWT_DEFI = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";

export const vLTC_CORE_SUPPLY_CAP = parseUnits("240000", 18);
export const vLTC_CORE_BORROW_CAP = parseUnits("20000", 18);
export const vAAVE_CORE_BORROW_CAP = parseUnits("3000", 18);
export const vTWT_DEFI_SUPPLY_CAP = parseUnits("700000", 18);
export const vTWT_DEFI_COLLATERAL_FACTOR = 0;
export const vTWT_DEFI_LIQUIDATION_THRESHOLD = parseUnits("0.6", 18);

export const vip391 = () => {
  const meta = {
    version: "v2",
    title: "VIP-391 Risk Parameters Adjustment (LTC, AAVE on Core pool and TWT on Defi pool)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication.

It would update the following caps on BNB Chain, following this forum publication: [Chaos Labs - ]

- [LTC (Core pool)](https://bscscan.com/address/0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B):
    - increase supply cap from 120K LTC to 240K LTC
    - increase borrow cap from 10K LTC to 20K LTC
- [AAVE (Core pool)](https://bscscan.com/address/0x26DA28954763B92139ED49283625ceCAf52C6f94):
    - increase borrow cap from 2K AAVE to 3K AAVE
- [TWT (Defi pool)](https://bscscan.com/address/0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F):
    - decrease collateral factor from 50% to 0%
    - increase supply cap from 300K TWT to 700K TWT

Review the Chaos Labs’ recommendations for a deeper analysis.

VIP simulation: 
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vLTC_CORE], [vLTC_CORE_SUPPLY_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vLTC_CORE, vAAVE_CORE],
          [vLTC_CORE_BORROW_CAP, vAAVE_CORE_BORROW_CAP],
        ],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vTWT_DEFI], [vTWT_DEFI_SUPPLY_CAP]],
      },
      {
        target: DEFI_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vTWT_DEFI, vTWT_DEFI_COLLATERAL_FACTOR, vTWT_DEFI_LIQUIDATION_THRESHOLD],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip391;
