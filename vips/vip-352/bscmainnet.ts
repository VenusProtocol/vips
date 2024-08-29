import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip352 = () => {
  const meta = {
    version: "v2",
    title: "VIP-352 [Ethereum] Unification of XVS rewards for DAI, TUSD, FRAX, sFRAX and sfrxETH",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer 5,731.81 XVS from [RewardsDistributor_Core_0](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8) to [RewardsDistributor_Core_2](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
- Transfer 1,473.64 XVS from [RewardsDistributor_Liquid Staked ETH_0](https://etherscan.io/address/0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98) to [RewardsDistributor_Liquid Staked ETH_3](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)

#### Description

In the [VIP-348](https://app.venus.io/#/governance/proposal/348?chainId=56), the rewards for the Ethereum markets of [DAI](https://app.venus.io/#/core-pool/market/0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657?chainId=1), [TUSD](https://app.venus.io/#/core-pool/market/0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b?chainId=1), [FRAX](https://app.venus.io/#/core-pool/market/0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95?chainId=1), [sFRAX](https://app.venus.io/#/core-pool/market/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe?chainId=1) and [sfrxETH](https://app.venus.io/#/isolated-pools/pool/0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3/market/0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E?chainId=1) were stopped in the original RewardsDistributor contracts ([RewardsDistributor_Core_0](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8) and [RewardsDistributor_Liquid Staked ETH_0](https://etherscan.io/address/0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98)) and enabled in the new ones ([RewardsDistributor_Core_2](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2) and [RewardsDistributor_Liquid Staked ETH_3](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)), aiming to unify the XVS rewards in one contract per pool.

This VIP will transfer the non-allocated XVS tokens from the original RewardsDistributor contracts to the new ones. This transfer doesn’t have any impact on the users, who will continue accruing rewards as usual.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/338)
- [VIP-302 Ethereum: new FRAX and sFRAX markets in the Core pool](https://app.venus.io/#/governance/proposal/302?chainId=56) ([PR](https://github.com/VenusProtocol/vips/pull/277)): 4,800 XVS were transferred to the RewardsDistributor_Core_0, to be distributed for 90 days among the FRAX and sFRAX market users
- [VIP-322: [Ethereum] Market Emission Adjustment](https://app.venus.io/#/governance/proposal/322?chainId=56) ([PR](https://github.com/VenusProtocol/vips/pull/301/files)): 112,000 XVS were transferred for the rewards of the following markets:
    - Core pool: WETH, WBTC, USDT, USDC, crvUSD, FRAX, sFRAX, TUSD, DAI
    - Curve pool: CRV, crvUSD
    - LST pool: wstETH
- [VIP-329 Ethereum: new sfrxETH market in the Liquid Staked ETH pool](https://app.venus.io/#/governance/proposal/329?chainId=56) ([PR](https://github.com/VenusProtocol/vips/pull/302)): 2,400 XVS were transferred to the RewardsDistributor_Core_0, to be distributed for 90 days among the sfrxETH market users
- [VIP-335 [Ethereum] Resume Market Incentives](https://app.venus.io/#/governance/proposal/335?chainId=1) ([PR](https://github.com/VenusProtocol/vips/pull/314)): 82,180 XVS were transferred from the old RewardsDistributor contracts to the new ones. These are the rewards associated to every market except FRAX, sFRAX, sfrxETH, DAI, TUSD
- [VIP-348 [Ethereum] Market Emission Adjustment](https://app.venus.io/#/governance/proposal/348?chainId=56) ([PR](https://github.com/VenusProtocol/vips/pull/331)): speeds for FRAX, sFRAX, sfrxETH, DAI, TUSD are set to zero in the old RewardsDistributor contracts and the new speeds are set in the new RewardsDistributor contracts

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x717fa100138a66aa5ca51cba4880a9448e6b18d87c3d2c3b41bfb91e7f27e8c8) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip352;
