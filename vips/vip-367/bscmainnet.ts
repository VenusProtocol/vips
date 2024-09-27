import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("77856", 18);
export const DEST_CHAIN_ID = 101;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const vip367 = () => {
  const meta = {
    version: "v2",
    title: "VIP-367 [Ethereum] Market Emission Adjustment",
    description: `#### Summary

After the successful passing of the [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x555d0b3a30a0bb968ec1bfc15a2fce2c77c0c25f562d9f6d995c7ca264ac8db8) to adjust the XVS emissions on Ethereum, if passed, this VIP will perform the following actions:

- Transfer 77,856 XVS from the [Distributor contract](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) on BNB Chain to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA)
- Transfer the required XVS from the Venus Treasury on Ethereum to the different RewardsDistributor contracts on Ethereum, and update the distribution speeds for the different markets on these contracts.

The current emission on Ethereum markets is 1,007.5 XVS/day, and after the change the daily emission of XVS in these markets will be 648.8 XVS/day.

#### Details

Specifically, the changes in the monthly XVS emissions are:

Core pool:

- WETH. From 844 XVS/month to 633 XVS/month (-25%)
- WBTC. From 2,531 XVS/month to 1,898 XVS/month (-25%)
- USDT. From 3,038 XVS/month to 2,279 XVS/month (-25%)
- USDC. From 3,038 XVS/month to 2,279 XVS/month (-25%)
- crvUSD. From 750 XVS/month to 0 XVS/month (-100%)
- FRAX. From 300 XVS/month to 0 XVS/month (-100%)
- sFRAX. From 300 XVS/month to 0 XVS/month (-100%)
- TUSD. From 100 XVS/month to 0 XVS/month (-100%)
- DAI. From 250 XVS/month to 0 XVS/month (-100%)

Curve pool:

- CRV. From 188 XVS/month to 0 XVS/month (-100%)
- crvUSD. From 188 XVS/month to 0 XVS/month (-100%)

LST pool:

- ETH. From 16,500 XVS/month to 12,375 XVS/month (-25%)
- wstETH. From 1,800 XVS/month to 0 XVS/month (-100%)
- sfrxETH. From 400 XVS/month to 0 XVS/month (-100%)

#### References

- [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x555d0b3a30a0bb968ec1bfc15a2fce2c77c0c25f562d9f6d995c7ca264ac8db8)
- [Community post proposing the XVS emission adjustment on Ethereum](https://community.venus.io/t/proposal-emissions-adjustments-for-eth-mainnet/4574)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/381)
- RewardsDistributor contracts:
    - [XVS RewardsDistributor for the Core pool](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2)
    - [XVS RewardsDistributor for the Curve pool](https://etherscan.io/address/0x461dE281c453F447200D67C9Dd31b3046c8f49f8)
    - [XVS RewardsDistributor for the LST ETH pool](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x7b78e977dfb79b7df832ef9491d9325303c1177d191cc159a175e2ec91617ef0&safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67) multisig transaction will be executed. Otherwise, it will be rejected.
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          ETHEREUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: parseUnits("0.5", 18).toString(),
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip367;
