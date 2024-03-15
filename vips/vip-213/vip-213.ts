import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("166990", 18);
export const DEST_ENDPOINT_ID = 101;

export const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const VETH_AMOUNT = parseUnits("1453.28319", 8); // (close to 30 ETH, taking into account 1 ETH=48.442773 vETH)

export const vip213 = () => {
  const meta = {
    version: "v2",
    title: "VIP-272 Bootstrap XVS liquidity for the Ethereum rewards",
    description: `#### Summary

If passed, this VIP will send 166,990 XVS from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). Moreover this VIP will redeem and transfer to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) around 30 ETH on BNB chain, which will be used later to inject liquidity in a XVS/ETH pool on Uniswap Ethereum.

Most of the sent XVS tokens will be used on Ethereum for the first quarter of rewards defined at [XVS Ethereum Mainnet Development Program with Lido, Frax, Curve and Gitcoin](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200).

#### Description

According to the proposal [XVS Ethereum Mainnet Development Program with Lido, Frax, Curve and Gitcoin](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200), the following XVS rewards will be enabled on Ethereum for the first 3 months:

- **Market Emissions**: 137,500 XVS allocated for the first quarter as liquidity incentives.
- **XVS Vault Base Rewards**: 22,500 XVS allocated to the Ethereum vault for the first quarter.

Moreover, 8,000 XVS and 30 ETH will be provided to a XVS/ETH pool on Uniswap Ethereum.

In total, 168,000 XVS should be transferred to Ethereum. Previous VIP’s already sent some XVS to the Venus Treasury on Ethereum:

- [VIP-263](https://app.venus.io/#/governance/proposal/263?chainId=56): 10 XVS
- [VIP-267](https://app.venus.io/#/governance/proposal/267?chainId=56): 1,000 XVS

So, this VIP will transfer 168,000 XVS - 10 XVS - 1,000 XVS = **166,990 XVS**, to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). The funds will be used from that in the following days to configure the defined rewards and inject the liquidity to Uniswap.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/119)
- Snapshot “[XVS Ethereum Mainnet Development Program with Lido, Frax, Curve and Gitcoin](https://snapshot.org/#/venus-xvs.eth/proposal/0x39947aa28f834f73a607b506cf495925eda7ba2b5ab9e591ab23adb1f802cceb)”
- Community proposal “[XVS Ethereum Mainnet Development Program with Lido, Frax, Curve and Gitcoin](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200)”
- [Documentation](https://docs-v4.venus.io/)`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [parseUnits("0.5", 18), NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "500000000000000000",
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VETH, VETH_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VETH, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
