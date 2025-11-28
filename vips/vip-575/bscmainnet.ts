import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const LEVERAGE_STRATEGIES_MANAGER = "0x3Ee4F1474A1071c5fAC97bd881eabcA2Cf8F6085";

export const vip575 = () => {
  const meta = {
    version: "v2",
    title: "VIP-575 [BNB Chain] Whitelist LeverageStrategiesManager for flash loans",
    description: `#### Summary

This VIP whitelists the LeverageStrategiesManager contract for flash loans on BNB Chain mainnet.

#### Description

This VIP will whitelist the [LeverageStrategiesManager](https://bscscan.com/address/0x3Ee4F1474A1071c5fAC97bd881eabcA2Cf8F6085) contract to enable flash loan functionality for leverage strategies.

#### Deployed contracts

- [LeverageStrategiesManager](https://bscscan.com/address/0x3Ee4F1474A1071c5fAC97bd881eabcA2Cf8F6085)`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: LEVERAGE_STRATEGIES_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [LEVERAGE_STRATEGIES_MANAGER, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip575;
