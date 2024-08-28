import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const USDT_AMOUNT = parseUnits("300000", 18);

export const vip214 = () => {
  const meta = {
    version: "v2",
    title: "VIP-214 Repayment of the insolvency in the Liquid Staked BNB pool - stage 1",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 300,000 USDT to the [Community wallet](https://bscscan.com/address/0xc444949e0054a23c44fc45789738bdf64aed2391)

#### Details

Due to the [incident explained by Chaos Labs in the Community forum](https://community.venus.io/t/lst-isolated-pool-oracle-incident/3961), the following insolvencies have been generated in the [Liquid Staked BNB market](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352) (defined in full tokens):

- ankrBNB: 108.890115080027695179 ($28,089.03 assuming the price $257.95758234)
- BNBx: 654.859606916027127141 ($169,444.84 assuming the price $258.74987025)
- stkBNB: 46.88799297198450373 ($11,733.84 assuming the price $250.2525884)
- WBNB: 275.071884556669618361 ($66,127.28 assuming the price $240.4)

The USD prices are the valid ones at block 34241940, [when the insolvency was recorded](https://bscscan.com/tx/0x9b76f9a17c48bd744038a2adfd657cb36d2c4d452a251f0a35132534fd1d22d3). The total insolvency, considering those USD prices, is $275,394.99. This VIP proposes to send 300,000 USDT to the Community wallet to have some margin and absorb potential changes in the USD prices before the VIP is executed.

This VIP is part of the mitigation plan. Specifically, this step is:

1. Transfer USDT tokens to the Community wallet (this VIP)
2. The Community wallet will swap needed assets to cover the generated insolvency. If due to price fluctuations some USDT are not needed, they will be sent to the Venus Treasury. If the USDT transferred is not enough to buy 100% of the needed tokens, the new scenario will be reevaluated.
3. The Community wallet will send the swapped tokens to the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
4. A new VIP will be proposed to remove the insolvency from the affected markets, injecting into the markets the tokens previously received in the Venus Treasury`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
