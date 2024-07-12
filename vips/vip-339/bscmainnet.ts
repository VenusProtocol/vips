import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_BLOCKS_PER_YEAR = parseUnits("10512000", 0); // assuming a block is mined every 3 seconds
export const BNB_BLOCKS_PER_QUARTER = BNB_BLOCKS_PER_YEAR.div(4);

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BTC_DISTRIBUTION_AMOUNT = parseUnits("0.81", 18);
export const BTC_DISTRIBUTION_SPEED = BTC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const ETH_DISTRIBUTION_AMOUNT = parseUnits("45.92", 18);
export const ETH_DISTRIBUTION_SPEED = ETH_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDC_DISTRIBUTION_AMOUNT = parseUnits("315000", 18);
export const USDC_DISTRIBUTION_SPEED = USDC_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DISTRIBUTION_AMOUNT = parseUnits("405000", 18);
export const USDT_DISTRIBUTION_SPEED = USDT_DISTRIBUTION_AMOUNT.div(BNB_BLOCKS_PER_QUARTER);

// XVS Transfer to Ethereum
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const XVS_AMOUNT = parseUnits("45000", 18);
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ETHEREUM_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_XVS_VAULT_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const DEST_ENDPOINT_ID = 101;

export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";

const vip339 = () => {
  const meta = {
    version: "v2",
    title: "VIP-339 Ethereum: Venus Prime Deployment Prime Adjustment Proposal - Q3 2024",
    description: `#### Summary
If passed, this VIP will configure the Prime contract with the reward speeds specified in [VIP-334](https://app.venus.io/#/governance/proposal/334?chainId=56), initiating rewards for Prime holders. Additionally, based on the approved parameters for the Ethereum Mainnet deployment (snapshot)[https://snapshot.org/#/venus-xvs.eth/proposal/0x39947aa28f834f73a607b506cf495925eda7ba2b5ab9e591ab23adb1f802cceb]. 45,000 XVS will be transferred from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) in preparation to fund the Vault incentives for 2 additional quarters.

#### Details

Following the approval of [VIP-334](https://app.venus.io/#/governance/proposal/334?chainId=56), funds have been successfully transferred and bridged to the [Prime Distributor Contract](https://etherscan.io/address/0x8ba6affd0e7bcd0028d1639225c84ddcf53d8872) on the Ethereum Mainnet. The next step is to set the reward speeds for each market to initiate the distribution of rewards.


**Rewards for the next 90 days are the following:**
 
  - ETH market in the staked ETH pool: 52.6647
  - USDT: 15,395
  - USDC: 15,395
  - BTC: 0.25476

Additionally, 45,000 XVS will be transferred from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). From this amount, 22,500 XVS will be sent to the [XVS Store contract](https://etherscan.io/address/0x1db646e1ab05571af99e47e8f909801e5c99d37b#code), which is responsible for distributing rewards via a [multisig transaction](https://app.safe.global/transactions/tx?).


Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?) multisig transaction will be executed. Otherwise, it will be rejected.

#### References

  - [VIP-326 Ethereum](https://app.venus.io/#/governance/proposal/326?chainId=56)
  - Deploy Venus Prime on ETH Mainet ([Venus Prime Deployment Proposal for Ethereum Mainnet - Proposals - Venus Community](https://community.venus.io/t/venus-prime-deployment-proposal-for-ethereum-mainnet/4417))
  - [VIP-334 Ethereum](https://app.venus.io/#/governance/proposal/334?chainId=56)
  - [Prime Deployment Boost Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x0a8305d81d70bf6ec05b2a652754cdec746de64a45e53d43473c6979b1e5f535)
  - [BTC transfer](https://etherscan.io/tx/0xbdad4c9c61970b999ee471f1d25f8ddc4da9a77c539915117f4d3eb3744bac7f),
  - [USDC transfer](https://etherscan.io/tx/0x8ab20fd0629fef4bfb80d93186013b794a621162a431bc252494f23b62ae279b)
  - [USDT transfer](https://etherscan.io/tx/0x97e5fe45a40d24a72bba20c46d81a94f8702d153eb0c717d639c5c9ca3d0514b)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
          [VTREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "500000000000000000",
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

export default vip339;
