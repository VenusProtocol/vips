import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { REWARD_DISTRIBUTORS as ARBITRUMONE_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-020";
import { REWARD_DISTRIBUTORS as ETHEREUM_REWARD_DISTRIBUTORS } from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS as ETHEREUM_COMPTROLLERS } from "../../multisig/proposals/ethereum/vip-073";
import { VTOKENS as ETHEREUM_VTOKENS } from "../../multisig/proposals/ethereum/vip-073";

const vip436 = () => {
  const meta = {
    version: "v2",
    title: "VIP-436 [Ethereum][Arbitrum] Transfer contracts to Omnichain Governance (1/2)",
    description: `#### Summary

If passed, this VIP will transfer part of the contracts on Ethereum and Arbitrum one to the Normal Timelock, following the community proposals [[VRC] Deploy Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/vrc-deploy-venus-protocol-on-ethereum-mainnet/3885) and [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721), and the associated snapshots ([here](https://snapshot.org/#/venus-xvs.eth/proposal/0x68be3a2cf0d4e72459c286ecb3dfae7d6f489ba9d962747987be3a46771a0df2) and [here](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f)). There will be a second VIP to complete the transfer of every contract on these networks.

#### Description

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67) to the [Normal Timelock](https://etherscan.io/address/0xd969E79406c35E80750aAae061D402Aab9325714) on Ethereum:

- [ComptrollerBeacon](https://etherscan.io/address/0xAE2C3F21896c02510aA187BdA0791cDA77083708)
- [VTokenBeacon](https://etherscan.io/address/0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a)
- [XVS](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A)
- [DefaultProxyAdmin](https://etherscan.io/address/0x567e4cc5e085d09f66f836fa8279f38b4e5866b9)
- Markets of the Core pool
    - [crvUSD](https://etherscan.io/address/0x672208C10aaAA2F9A6719F449C4C8227bc0BC202)
    - [DAI](https://etherscan.io/address/0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657)
    - [eBTC](https://etherscan.io/address/0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2)
    - [EIGEN](https://etherscan.io/address/0x256AdDBe0a387c98f487e44b85c29eb983413c5e)
    - [FRAX](https://etherscan.io/address/0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95)
    - [LBTC](https://etherscan.io/address/0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91)
    - [sFRAX](https://etherscan.io/address/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe)
    - [TUSD](https://etherscan.io/address/0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b)
    - [USDC](https://etherscan.io/address/0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb)
    - [USDT](https://etherscan.io/address/0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E)
    - [WBTC](https://etherscan.io/address/0x8716554364f20BCA783cb2BAA744d39361fd1D8d)
    - [WETH](https://etherscan.io/address/0x7c8ff7d2A1372433726f879BD945fFb250B94c65)
- Markets of the Curve pool
    - [crvUSD](https://etherscan.io/address/0x2d499800239C4CD3012473Cb1EAE33562F0A6933)
    - [CRV](https://etherscan.io/address/0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa)
- Markets of the Liquid Staked ETH pool
    - [ezETH](https://etherscan.io/address/0xA854D35664c658280fFf27B6eDC6C4195c3229B3)
    - [PT-wETH-26DEC2024](https://etherscan.io/address/0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C)
    - [pufETH](https://etherscan.io/address/0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e)
    - [rsETH](https://etherscan.io/address/0xDB6C345f864883a8F4cae87852Ac342589E76D1B)
    - [sfrxETH](https://etherscan.io/address/0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E)
    - [WETH](https://etherscan.io/address/0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2)
    - [wstETH](https://etherscan.io/address/0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB)
    - [weETH](https://etherscan.io/address/0xb4933AF59868986316Ed37fa865C829Eba2df0C7)
    - [weETHs](https://etherscan.io/address/0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9)
- Markets of the Ethena pool
    - [PT-USDe-27MAR2025](https://etherscan.io/address/0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B)
    - [PT-sUSDE-27MAR2025](https://etherscan.io/address/0xCca202a95E8096315E3F19E46e19E1b326634889)
    - [sUSDe](https://etherscan.io/address/0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0)
    - [USDC](https://etherscan.io/address/0xa8e7f9473635a5CB79646f14356a9Fc394CA111A)
- RewardsDistributor contracts
    - [0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8)
    - [0x76611EEA26aF8842281B56Bb742129E77133592F](https://etherscan.io/address/0x76611EEA26aF8842281B56Bb742129E77133592F)
    - [0x886767B62C7ACD601672607373048FFD96Cf27B2](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
    - [0x8473B767F68250F5309bae939337136a899E43F9](https://etherscan.io/address/0x8473B767F68250F5309bae939337136a899E43F9)
    - [0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9](https://etherscan.io/address/0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9)
    - [0x461dE281c453F447200D67C9Dd31b3046c8f49f8](https://etherscan.io/address/0x461dE281c453F447200D67C9Dd31b3046c8f49f8)
    - [0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98](https://etherscan.io/address/0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98)
    - [0xe72Aa7BaB160eaa2605964D2379AA56Cb4b9A1BB](https://etherscan.io/address/0xe72Aa7BaB160eaa2605964D2379AA56Cb4b9A1BB)
    - [0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06](https://etherscan.io/address/0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06)
    - [0x1e25CF968f12850003Db17E0Dba32108509C4359](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)
- Comptrollers
    - [Core pool](https://etherscan.io/address/0x687a01ecF6d3907658f7A7c714749fAC32336D1B)
    - [Liquid Staked ETH pool](https://etherscan.io/address/0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3)
    - [Curve pool](https://etherscan.io/address/0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796)

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) to the [Normal Timelock](https://arbiscan.io/address/0x4b94589Cc23F618687790036726f744D602c4017) on Arbitrum one:

- [ComptrollerBeacon](https://arbiscan.io/address/0x8b6c2E8672504523Ca3a29a5527EcF47fC7d43FC)
- [VTokenBeacon](https://arbiscan.io/address/0xE9381D8CA7006c12Ae9eB97890575E705996fa66)
- [XVS](https://arbiscan.io/address/0xc1Eb7689147C81aC840d4FF0D298489fc7986d52)
- [DefaultProxyAdmin](https://arbiscan.io/address/0xF6fF3e9459227f0cDE8B102b90bE25960317b216)
- RewardsDistributor contracts
    - [0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a](https://arbiscan.io/address/0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a)
    - [0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D](https://arbiscan.io/address/0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D)

From now on, every privilege function executable only by the governance contract should be executed with a Normal VIP. To transfer these contracts, [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x666d09230fb9b37016984bd9e254ff4583bd47c382dbbb83d373deed0c377675) and [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x3ace1d4ff8cf5410f5a3546272341612352e2854b2edd6a101bf96576e78aa04) transactions are required, where the two steps transfer is initiated by the Guardian wallets. If this VIP passes, those transactions will be executed. Otherwise, they will be rejected.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the contracts are properly transferred and the Normal Timelock can execute the privilege functions
- **Deployment on testnet**: the same transfer has been performed on testnet

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/450)
- [Documentation](https://docs-v4.venus.io)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...ETHEREUM_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),

      ...ARBITRUMONE_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ETHEREUM_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ETHEREUM_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip436;
