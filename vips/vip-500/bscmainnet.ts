import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BNB_GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const ETH_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

export const BNB_UNI_CORE = "0x27FF564707786720C71A2e5c1490A63266683612";
export const BNB_UNI_CORE_SUPPLY_CAP = parseUnits("2200000", 18);
export const BNB_UNI_CORE_BORROW_CAP = parseUnits("200000", 18);

export const BNB_USDT_CORE = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const BNB_USDT_CORE_SUPPLY_CAP = parseUnits("600000000", 18);

export const BNB_SOL_CORE = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
export const BNB_SOL_CORE_SUPPLY_CAP = parseUnits("36000", 18);

export const BNB_RACA_GAMEFI = "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465";
export const BNB_RACA_GAMEFI_SUPPLY_CAP = parseUnits("2000000000", 18);

export const ETH_WEETHS_CORE = "0xc42E4bfb996ED35235bda505430cBE404Eb49F77";
export const ETH_WEETHS_CORE_SUPPLY_CAP = parseUnits("2800", 18);

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-XXX [BNB Chain][Ethereum] Risk Parameters Adjustments (UNI)",
    description: `VIP-XXX [BNB Chain][Ethereum] Risk Parameters Adjustments (UNI)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [BNB_UNI_CORE, BNB_USDT_CORE, BNB_SOL_CORE],
          [BNB_UNI_CORE_SUPPLY_CAP, BNB_USDT_CORE_SUPPLY_CAP, BNB_SOL_CORE_SUPPLY_CAP],
        ],
      },
      {
        target: BNB_CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[BNB_UNI_CORE], [BNB_UNI_CORE_BORROW_CAP]],
      },
      {
        target: BNB_GAMEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[BNB_RACA_GAMEFI], [BNB_RACA_GAMEFI_SUPPLY_CAP]],
      },
      {
        target: ETH_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[ETH_WEETHS_CORE], [ETH_WEETHS_CORE_SUPPLY_CAP]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip500;
