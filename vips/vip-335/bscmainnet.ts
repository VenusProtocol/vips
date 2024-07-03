import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip335 = () => {
  const meta = {
    version: "v2",
    title: "VIP-335 [Ethereum] Resume Market Incentives",
    description: `#### Summary

If passed, this VIP aims to resume XVS emissions on the Ethereum Mainnet using the 112,000 XVS transferred to the Venus Treasury on Ethereum from the previous [VIP-322](https://app.venus.io/#/governance/proposal/322?chainId=1). The distribution will continue based on the previously approved proportions. Emissions will be further reviewed in the upcoming days to take into account the deployment of Venus Prime on Ethereum.

#### Details

There are two market types to consider:

1. **Markets with active rewards:**
    * FRAX, sFRAX, sfrxFRAX, DAI, TUSD
    * No action is needed, and emissions will remain. Adjustments will be made based on market performance and community needs.
2. **Markets without rewards:**
    * WETH, WBTC, USDT, USDC, crvUSD, TUSD, CRV, wstETH
    * New distributors need to be created.
    * Funds from the old distributors need to be transferred to the new distributors. This amount is calculated based on VIP-322 for the missing 69 days of rewards.
    * The "last block" logic will be removed to allow for a more flexible approach, reactive to emission reductions.
    * These distributors need to be configured based on the same speeds as [VIP-322](https://app.venus.io/#/governance/proposal/322?chainId=1).

The amounts to send to the new distributors are as follows:

* Core: 29,571
* Curve: 1,739
* LST ETH: 50,870
* Total: 82,180

**The market speeds to set are the same from [VIP-322](https://app.venus.io/#/governance/proposal/322?chainId=1):**

**Monthly rewards:**

* WETH: 1,125
* WBTC: 3,375
* USDT: 3,375
* USDC: 3,375
* crvUSD: 1,500
* CRV: 375
* crvUSD: 375
* WETH: 18,333
* wstETH: 3,600

#### References

* [VIP-322](https://app.venus.io/#/governance/proposal/322?chainId=1)
* New RewardsDistributor contracts:
    * [XVS RewardsDistributor for the Core pool](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
    * [XVS RewardsDistributor for the Curve pool](https://etherscan.io/address/0x461dE281c453F447200D67C9Dd31b3046c8f49f8)
    * [XVS RewardsDistributor for the LST pool](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x733b89615d422bd2e777c92dfc570fe4cb33cac4c69c573234c1ca67e090cc06&safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip335;
