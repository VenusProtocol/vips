import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const SnBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const TEMP_VTOKEN_IMPL = "0xD2E69514F33111093586a25D75A306B66f75F658";
export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const vSnBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const vHAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
export const VTOKEN_IMPL = "0x9A8ADe92b2D71497b6F19607797F2697cF30f03A";

export const vip256 = () => {
  const meta = {
    version: "v2",
    title: "VIP-256 Rebrand of VTokens for HAY and SnBNB",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Update the symbol of the VTokens for [HAY](https://bscscan.com/address/0xCa2D81AA7C09A1a025De797600A7081146dceEd9) and [SnBNB](https://bscscan.com/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A):
    - vHAY_StableCoins -> vlisUSD_Stablecoins
    - vSnBNB_LiquidStakedBNB -> vslisBNB_LiquidStakedBNB
- Update the name of the same VTokens:
    - Venus HAY (Stable Coins) -> Venus lisUSD (Stablecoins)
    - Venus SnBNB (Liquid Staked BNB) -> Venus slisBNB (Liquid Staked BNB)
- Configure the price feeds of the lisUSD and slisBNB tokens, using the [original BinanceOracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820) (follow-up of the [VIP-250](https://app.venus.io/#/governance/proposal/250))
- Grant [Fast-track](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d) timelocks, and [guardian](https://bscscan.com/address/0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF), to execute more privilege functions on the Binance oracle, to be able to react quicker to similar situations in the future

#### Details

Helio Protocol has been rebranded to Lista DAO, and the token symbols of [HAY](https://bscscan.com/token/0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5) & [SnBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) have been changed to lisUSD and slisBNB respectively. See the official announcement [here](https://medium.com/listadao/lista-is-coming-product-update-ae37b3869db0).

In the Critical [VIP-250](https://app.venus.io/#/governance/proposal/250), a [temporary BinanceOracle contract](https://bscscan.com/address/0x1AD1A94550308f9f85871c8b68ac8442C39EE60b) was configured for the symbols lisUSD and slisBNB. This VIP applies the same config on the BinanceOracle contract used for the rest of the symbols on Venus. To allow Governance to execute similar changes in a faster way in the future, needed permissions are granted to the Fast-track and Critical timelock contracts.

Finally, the names and the symbols of the VTokens for lisUSD and slisBNB are updated, to reflect the rebranding initiated by the Helio Protocol.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/198)
- [VIP executed on BNB testnet](https://testnet.bscscan.com/tx/0x2a27fa0156bcca2eea566504ffb2c481736ede1122d130092a4c12bd1d741beb)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["lisUSD", 1500],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["slisBNB", 1500],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SnBNB,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            HAY,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", ORACLE_GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", ORACLE_GUARDIAN],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: vHAY,
        signature: "setName(string)",
        params: ["Venus lisUSD (Stablecoins)"],
      },
      {
        target: vHAY,
        signature: "setSymbol(string)",
        params: ["vlisUSD_Stablecoins"],
      },
      {
        target: vSnBNB,
        signature: "setName(string)",
        params: ["Venus slisBNB (Liquid Staked BNB)"],
      },
      {
        target: vSnBNB,
        signature: "setSymbol(string)",
        params: ["vslisBNB_LiquidStakedBNB"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip256;
