import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const DEFI_COMPTROLLER_ADDRESS = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const VUSDC_SUPPLY_CAP = parseUnits("360000000", 18);
export const VUSDC_BORROW_CAP = parseUnits("324000000", 18);

export const VSUSDE = "0x699658323d58eE25c69F1a29d476946ab011bD18";
export const VSUSDE_SUPPLY_CAP = parseUnits("4000000", 18);

export const DEFI_VALPACA = "0x02c5Fb0F26761093D297165e902e96D08576D344";
export const DEFI_VALPACA_SUPPLY_CAP = parseUnits("200000", 18);

export const vip490 = () => {
  const meta = {
    version: "v2",
    title: "VIP-490 [BNB Chain] Risk Parameters Adjustments (USDC, sUSDe, ALPACA)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 04/28/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-28-25/5078):

- [USDC (Core pool)](https://app.venus.io/#/core-pool/market/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8?chainId=56):
    - increase supply cap from 258M USDC to 360M USDC
    - increase borrow cap from 200M USDC to 324M USDC
- [sUSDe (Core pool)](https://app.venus.io/#/core-pool/market/0x699658323d58eE25c69F1a29d476946ab011bD18?chainId=56): increase supply cap from 2M sUSDe to 4M sUSDe
- [ALPACA (DeFi pool)](https://app.venus.io/#/isolated-pools/pool/0x3344417c9360b963ca93A4e8305361AEde340Ab9/market/0x02c5Fb0F26761093D297165e902e96D08576D344?chainId=56): decrease supply cap from 1.5M ALPACA to 200K ALPACA

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/547](https://github.com/VenusProtocol/vips/pull/547)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [VUSDC, VSUSDE],
          [VUSDC_SUPPLY_CAP, VSUSDE_SUPPLY_CAP],
        ],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUSDC], [VUSDC_BORROW_CAP]],
      },
      {
        target: DEFI_COMPTROLLER_ADDRESS,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[DEFI_VALPACA], [DEFI_VALPACA_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip490;
