import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip348 = () => {
  const meta = {
    version: "v2",
    title: "VIP-348 [Ethereum] Market Emission Adjustment",
    description: `#### Summary

After the successful passing of the [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x508fc5f4eefae40532ebc5bbf3c917ea9e4460a5a916eca7f5cb371624815dc0) to adjust the XVS emissions on Ethereum, if passed, this VIP will update the distribution speeds for the different Ethereum markets.

The current emission on Ethereum markets is 1,271.1 XVS/day, and after the change the daily emission of XVS in these markets will be 1,007.5 XVS/day.

#### Details

Specifically, the changes in the monthly XVS emissions are:

Core pool:

- WETH. From 1,125 XVS/month to 844 XVS/month (-25%)
- WBTC. From 3,375 XVS/month to 2,531 XVS/month (-25%)
- USDT. From 3,375 XVS/month to 3,038 XVS/month (-10%)
- USDC. From 3,375 XVS/month to 3,038 XVS/month (-10%)
- crvUSD. From 1,500 XVS/month to 750 XVS/month (-50%)
- FRAX. From 600 XVS/month to 300 XVS/month (-50%)
- sFRAX. From 600 XVS/month to 300 XVS/month (-50%)
- TUSD. From 200 XVS/month to 100 XVS/month (-50%)
- DAI. From 500 XVS/month to 250 XVS/month (-50%)

Curve pool:

- CRV. From 375 XVS/month to 188 XVS/month (-50%)
- crvUSD. From 375 XVS/month to 188 XVS/month (-50%)

LST pool:

- ETH. From 18,333 XVS/month to 16,500 XVS/month (-10%)
- wstETH. From 3,600 XVS/month to 1,800 XVS/month (-50%)
- sfrxETH. From 800 XVS/month to 400 XVS/month (-50%)

#### References

- [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x508fc5f4eefae40532ebc5bbf3c917ea9e4460a5a916eca7f5cb371624815dc0)
- [Community post proposing the XVS emission adjustment on Ethereum](https://community.venus.io/t/emissions-adjustments-for-eth-mainnet/4480)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/331)
- RewardsDistributor contracts:
    - [XVS RewardsDistributor for the Core pool (1)](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8)
    - [XVS RewardsDistributor for the Core pool (2)](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
    - [XVS RewardsDistributor for the Curve pool (1)](https://etherscan.io/address/0x8473B767F68250F5309bae939337136a899E43F9)
    - [XVS RewardsDistributor for the Curve pool (2)](https://etherscan.io/address/0x461dE281c453F447200D67C9Dd31b3046c8f49f8)
    - [XVS RewardsDistributor for the LST pool (1)](https://etherscan.io/address/0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98)
    - [XVS RewardsDistributor for the LST pool (2)](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x0523ca9fae18ba3e27664eddf4c2e8787e2791b971b347a00b7e71a590afaedf) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip348;
