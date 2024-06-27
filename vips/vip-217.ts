import { BigNumber } from "ethers";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export interface MarketInformation {
  name: string;
  vToken: string;
  underlying: string;
  badDebt: string;
  initialBalance?: BigNumber;
}

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";

const markets: MarketInformation[] = [
  {
    name: "ankrBNB",
    vToken: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    underlying: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    badDebt: "108890115080027695179", // 108.890115080027695179
  },
  {
    name: "BNBx",
    vToken: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    underlying: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
    badDebt: "654859606916027127141", // 654.859606916027127141
  },
  {
    name: "stkBNB",
    vToken: "0xcc5D9e502574cda17215E70bC0B4546663785227",
    underlying: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    badDebt: "46887992971984503730", // 46.88799297198450373
  },
  {
    name: "WBNB",
    vToken: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    badDebt: "275071884556669618361", // 275.071884556669618361
  },
];

export const vip217 = () => {
  const meta = {
    version: "v2",
    title: "VIP-217: Repayment of the insolvency in the Liquid Staked BNB pool - stage 2",
    description: `#### Summary

If passed, this VIP will reduce the following insolvencies using funds from the [Community Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9):

- 108.890115080027695179 [ankrBNB](https://bscscan.com/address/0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827) in the [ankrBNB market](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f)
- 654.859606916027127141 [BNBx](https://bscscan.com/address/0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275) in the [BNBx market](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791)
- 46.88799297198450373 [stkBNB](https://bscscan.com/address/0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16) in the [stkBNB market](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xcc5D9e502574cda17215E70bC0B4546663785227)
- 275.071884556669618361 [WBNB](https://bscscan.com/address/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c) in the [WBNB market](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2)

The [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) was funded with enough tokens using the USDT tokens previously transferred to the [Community wallet](https://bscscan.com/address/0xc444949e0054a23c44fc45789738bdf64aed2391) in the [VIP-214 Repayment of the insolvency in the Liquid Staked BNB pool - stage 1](https://app.venus.io/#/governance/proposal/214).

After executing this VIP, no insolvency will be in the mentioned markets.

#### Description

This VIP is part of the mitigation plan for the [incident explained by Chaos Labs in the Community forum](https://community.venus.io/t/lst-isolated-pool-oracle-incident/3961):

1. Transfer USDT tokens to the Community wallet ([VIP-214](https://app.venus.io/#/governance/proposal/214))
2. The Community wallet swaps needed assets to cover the generated insolvency
3. The Community wallet sends the swapped tokens to the Venus Treasury. Transfers:
    - ankrBNB: [108.903345571239252255 ankrBNB](https://bscscan.com/tx/0xab2e480e0fb06b2857e80bcd0a3f074ffe168565127f5ca4af285ca083414821)
    - BNBx: [654.862039688757794697 BNBx](https://bscscan.com/tx/0x8dd2b693baad5ce416ecdace2a654cd79bb77c0957f648110b1ae48df0cf4af5)
    - stkBNB: [46.898413035334849728 stkBNB](https://bscscan.com/tx/0xf041278b0338f6fa28916c3178710654115fa9ae5ac3032331df09492318acac)
    - WBNB: [275.072 WBNB](https://bscscan.com/tx/0x8ce2cf034ae4d685cf5219ce28c66a6d7e182849b23a768975099a06f55cdb6b)
    - USDT: [12,140.65 USDT](https://bscscan.com/tx/0x89c0c941f5ad733e12a0cd8b8cefd1a938a80e2ae4456561c9fb213db2380250) (refund to the Community Treasury the USDT not spent)
4. VIP to remove the insolvency from the affected markets, injecting into the markets the tokens previously received in the Venus Treasury ([this VIP](https://app.venus.io/#/governance/proposal/217))`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    markets.flatMap(marketInfo => [
      {
        target: marketInfo.vToken,
        signature: "setShortfallContract(address)",
        params: [TIMELOCK],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketInfo.underlying, marketInfo.badDebt, marketInfo.vToken],
      },
      {
        target: marketInfo.vToken,
        signature: "badDebtRecovered(uint256)",
        params: [marketInfo.badDebt],
      },
      {
        target: marketInfo.vToken,
        signature: "setShortfallContract(address)",
        params: [SHORTFALL],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};
