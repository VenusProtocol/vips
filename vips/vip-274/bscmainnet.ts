import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

export const vip274 = () => {
  const meta = {
    version: "v2",
    title: "VIP-274 Rebrand agEUR into EURA (1/2)",
    description: `#### Summary

If passed, this VIP will configure the price feeds of the EURA token, reusing the configuration previously set for agEUR, taking into account the already performed rebrand.

#### Details

Angle Protocol rebranded agEUR into EURA ([snapshot](https://snapshot.org/#/anglegovernance.eth/proposal/0x67b1a428cf8f0a6242c6649dab34acc6c59ac15de4198cc0e7e7796fb15c1455)), including the token symbol of the [underlying token](https://bscscan.com/address/0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89).

After executing this VIP, the agEUR market will be available again in the Venus Protocol.

Another (Normal) VIP will be proposed in the following days to complete the rebranding on Venus.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/232)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["EURA", "AGEUR"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip274;
