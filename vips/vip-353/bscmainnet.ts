import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const LIQUIDATOR_CONTRACT = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
export const REPAY_AMOUNT = parseUnits("840320.493777076510891477", 18);
export const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const TRANSFER_ALL = "0xCa111028493fda75ad8c627c70Fae008991C4772";

export const vip353 = async () => {
  const meta = {
    version: "v2",
    title: "VIP-353",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, CORE_COMPTROLLER, CRITICAL_TIMELOCK, REPAY_AMOUNT],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [LIQUIDATOR_CONTRACT, REPAY_AMOUNT],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "liquidateBorrow(address,address,uint256,address)",
        params: [VUSDT, EXPLOITER_WALLET, REPAY_AMOUNT, VBNB],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [LIQUIDATOR_CONTRACT, 0],
      },
      {
        target: VBNB,
        signature: "approve(address,uint256)",
        params: [TRANSFER_ALL, ethers.constants.MaxUint256],
      },
      {
        target: TRANSFER_ALL,
        signature: "transferAll(address,address)",
        params: [VBNB, VTREASURY],
      },
      {
        target: VBNB,
        signature: "approve(address,uint256)",
        params: [TRANSFER_ALL, 0],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip353;
