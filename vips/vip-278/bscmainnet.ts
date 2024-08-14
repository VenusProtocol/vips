import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const TEMP_VTOKEN_IMPL = "0xD2E69514F33111093586a25D75A306B66f75F658";
export const vagEUR = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";
export const VTOKEN_IMPL = "0x1EC822383805FfDb9dC2Ae456DF8C0Ca2Bf14d7d";

export const vip278 = () => {
  const meta = {
    version: "v2",
    title: "VIP-278 Rebrand agEUR into EURA (2/2)",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Update the symbol of the VToken for [agEUR](https://bscscan.com/address/0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F):
    - vagEUR_StableCoins -> vEURA_Stablecoins
- Update the name of the same VToken:
    - Venus agEUR (Stable Coins) -> Venus EURA (Stablecoins)
- Configure the price feeds of the EURA token, using the [BinanceOracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820)

#### Details

Angle Protocol rebranded agEUR into EURA ([snapshot](https://snapshot.org/#/anglegovernance.eth/proposal/0x67b1a428cf8f0a6242c6649dab34acc6c59ac15de4198cc0e7e7796fb15c1455)), including the token symbol of the [underlying token](https://bscscan.com/address/0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89). This is a follow up of the [VIP-274](https://app.venus.io/#/governance/proposal/274?chainId=56), to complete the rebranding of the VTokens associated with the renamed underlying token.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/234)
- [VIP executed on BNB testnet](https://testnet.bscscan.com/tx/0xcfcc1577dcfa09470dcac1b6d3e3d4ea5e03d6c86c6022d7b5b8254b43b6a4ea)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["EURA", ""],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["EURA", 1500],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: vagEUR,
        signature: "setName(string)",
        params: ["Venus EURA (Stablecoins)"],
      },
      {
        target: vagEUR,
        signature: "setSymbol(string)",
        params: ["vEURA_Stablecoins"],
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

export default vip278;
