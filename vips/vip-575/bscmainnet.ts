import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
export const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

export const vip575 = () => {
  const meta = {
    version: "v2",
    title: "VIP-575 [BNB Chain] Whitelist LeverageStrategiesManager for flash loans",
    description: `#### Summary

This VIP whitelists the LeverageStrategiesManager contract for flash loans on BNB Chain mainnet and accepts ownership of SwapHelper and LeverageStrategiesManager contracts.

#### Description

This VIP will:
- Accept ownership of [SwapHelper](https://bscscan.com/address/0xD79be25aEe798Aa34A9Ba1230003d7499be29A24) contract
- Accept ownership of [LeverageStrategiesManager](https://bscscan.com/address/0x03F079E809185a669Ca188676D0ADb09cbAd6dC1) contract
- Whitelist the [LeverageStrategiesManager](https://bscscan.com/address/0x03F079E809185a669Ca188676D0ADb09cbAd6dC1) contract to enable flash loan functionality for leverage strategies

#### Deployed contracts

- [LeverageStrategiesManager](https://bscscan.com/address/0x03F079E809185a669Ca188676D0ADb09cbAd6dC1)
- [SwapHelper](https://bscscan.com/address/0xD79be25aEe798Aa34A9Ba1230003d7499be29A24)`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: SWAP_HELPER,
        signature: "acceptOwnership()",
        params: [],
      },
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
