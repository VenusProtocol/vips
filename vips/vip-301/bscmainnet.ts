import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TOKEN_REDEEMER = "0x13fFde8050fa0Ef5A6f3c28B500c9267ec8A2C46";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";

export const shortfallAccounts = [
  "0xc4fce1f122117a1f4433c9ea4d2b1cb075c19a0b",
  "0xa745A278E9459c35562E36255f38602c77837461",
  "0x5d458D8eAB6C4eb8e1ee1D7bA4B667eF09681900",
  "0x33454D23fB15ae91CDe5085e0c43AEC1f2082C8b",
  "0x9610C8E026334E1B5ccAb9d57aAF3fBa90A286bE",
  "0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92",
];

export const VAI_WITHDRAW_AMOUNT = parseUnits("140000", 18);

const vip301 = () => {
  const meta = {
    version: "v2",
    title: "VIP-301 Partial shortfall repayment (VAI)",
    description: `Following [VIP-281](https://app.venus.io/#/governance/proposal/281), Venus continues to repay old shortfalls with the objective of being 100% debt-free this quarter. If passed, this VIP will repay 100% of the VAI debt for the following accounts, using the funds from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9):

- 44,021 VAI for account [0xc4fce1f122117a1f4433c9ea4d2b1cb075c19a0b](https://debank.com/profile/0xc4fce1f122117a1f4433c9ea4d2b1cb075c19a0b)
- 41,994 VAI for account [0xa745A278E9459c35562E36255f38602c77837461](https://debank.com/profile/0xa745a278e9459c35562e36255f38602c77837461)
- 21,675 VAI for account [0x5d458D8eAB6C4eb8e1ee1D7bA4B667eF09681900](https://debank.com/profile/0x5d458d8eab6c4eb8e1ee1d7ba4b667ef09681900)
- 3,078 VAI for account [0x33454D23fB15ae91CDe5085e0c43AEC1f2082C8b](https://debank.com/profile/0x33454D23fB15ae91CDe5085e0c43AEC1f2082C8b)
- 1,709 VAI for account [0x9610C8E026334E1B5ccAb9d57aAF3fBa90A286bE](https://debank.com/profile/0x9610C8E026334E1B5ccAb9d57aAF3fBa90A286bE)
- 1,012 VAI for account [0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92](https://debank.com/profile/0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92)

The total repayments are 113,489 VAI, considering the May 3rd, 2024 balances and ignoring decimals. The [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) has enough assets to repay all debts.

#### References

- [TokenRedeemer contract used to repay the debt](https://bscscan.com/address/0x13fFde8050fa0Ef5A6f3c28B500c9267ec8A2C46)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/265)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, VAI_WITHDRAW_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "batchRepayVAI(address,address[],address)",
        params: [VAI_UNITROLLER, shortfallAccounts, TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip301;
