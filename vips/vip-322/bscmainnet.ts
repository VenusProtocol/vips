import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const ETH_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const REWARDS = [
  {
    market: "WETH",
    reward: parseUnits("1125", 18),
  },
  {
    market: "WBTC",
    reward: parseUnits("3375", 18),
  },
  {
    market: "USDT",
    reward: parseUnits("3375", 18),
  },
  {
    market: "USDC",
    reward: parseUnits("3375", 18),
  },
  {
    market: "crvUSD",
    reward: parseUnits("1500", 18),
  },
  {
    market: "FRAX",
    reward: parseUnits("600", 18),
  },
  {
    market: "sFRAX",
    reward: parseUnits("600", 18),
  },
  {
    market: "TUSD",
    reward: parseUnits("200", 18),
  },
  {
    market: "DAI",
    reward: parseUnits("500", 18),
  },
  {
    market: "CRV",
    reward: parseUnits("375", 18),
  },
  {
    market: "crvUSD",
    reward: parseUnits("375", 18),
  },
  {
    market: "WETH",
    reward: parseUnits("18333", 18),
  },
  {
    market: "wstETH",
    reward: parseUnits("3600", 18),
  },
];

export const BRIDGE_FEES = parseUnits("0.5", 18);
export const DEST_ENDPOINT_ID = 101; // Ethereum chain
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const TOTAL_MONTHS = 3;
export const TOTAL_XVS_TO_BRIDGE = REWARDS.reduce((acc, { reward }) => acc.add(reward), ethers.BigNumber.from(0)).mul(
  TOTAL_MONTHS,
);

export const vip322 = () => {
  const meta = {
    version: "v2",
    title: "VIP-322: [Ethereum] Market Emission Adjustment",
    description: `#### Summary

After the successful passing of the [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xaa716ef493b090060a1f5fef3d27aa4b20c9a56e941544a0a4204fa75471a825) to adjust the XVS emissions on Ethereum, if passed, this VIP will perform the following actions:

- Transfer 112,000 XVS from the [Distributor contract](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) on BNB Chain to the Venus Treasury on Ethereum
- Transfer the required XVS from the Venus Treasury on Ethereum to the different RewardsDistributor contract on Ethereum, and update the distribution speeds for the different markets on these contracts.

The current emission on Ethereum markets is 1,424 XVS/day, and after the change the daily emission of XVS in these markets will be 1,244 XVS/day.

#### Details

Specifically, the changes in the monthly XVS emissions are:

Core pool:

- WETH. From 1,500 XVS/month to 1,125 XVS/month (-25%)
- WBTC. From 4,500 XVS/month to 3,375 XVS/month (-25%)
- USDT. From 4,500 XVS/month to 3,375 XVS/month (-25%)
- USDC. From 4,500 XVS/month to 3,375 XVS/month (-25%)
- crvUSD. From 2,000 XVS/month to 1,500 XVS/month (-25%)
- FRAX. From 800 XVS/month to 600 XVS/month (-25%)
- sFRAX. From 800 XVS/month to 600 XVS/month (-25%)
- TUSD. From 0 XVS/month to 200 XVS/month
- DAI. From 0 XVS/month to 500 XVS/month

Curve pool:

- CRV. From 500 XVS/month to 375 XVS/month (-25%)
- crvUSD. From 500 XVS/month to 375 XVS/month (-25%)

LST pool:

- wstETH. From 4,800 XVS/month to 3,600 XVS/month (-25%)

#### References

- [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xaa716ef493b090060a1f5fef3d27aa4b20c9a56e941544a0a4204fa75471a825)
- [Community post proposing the XVS emission adjustment on Ethereum](https://community.venus.io/t/eth-mainnet-market-emission-adjustment/4377)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/301)
- RewardsDistributor contracts:
    - [XVS RewardsDistributor for the Core pool](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8)
    - [XVS RewardsDistributor for the Curve pool](https://etherscan.io/address/0x8473B767F68250F5309bae939337136a899E43F9)
    - [XVS RewardsDistributor for the LST pool](https://etherscan.io/address/0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x3a3fafc9d5b2c99ab9619560b211e6d60bf6100fe513365396138c8081d845cf) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BRIDGE_FEES, NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, TOTAL_XVS_TO_BRIDGE],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, TOTAL_XVS_TO_BRIDGE],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          ethers.utils.defaultAbiCoder.encode(["address"], [ETH_TREASURY]),
          TOTAL_XVS_TO_BRIDGE,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip322;
