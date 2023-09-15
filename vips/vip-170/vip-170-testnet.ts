import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const PAUSE_GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const MANAGER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const PROTOCOL_SHARE_RESERVE = "0xc987a03ab6C2A5891Fc0919f021cc693B5E55278";

const vTokens = {
  vHAY_Stablecoins: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
  vUSDT_Stablecoins: "0x3338988d0beb4419Acb8fE624218754053362D06",
  vUSDD_Stablecoins: "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4",

  vALPACA_DeFi: "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
  vANKR_DeFi: "0xb677e080148368EeeE70fA3865d07E92c6500174",
  vUSDT_DeFi: "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
  vBSW_DeFi: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  vUSDD_DeFi: "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
  vankrBNB_DeFi: "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6",
  vTWT_DeFi: "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564",

  vFLOKI_GameFi: "0xef470AbC365F88e4582D8027172a392C473A5B53",
  vRACA_GameFi: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  vUSDD_GameFi: "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
  vUSDT_GameFi: "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",

  vBNBx_LiquidStakedBNB: "0x644A149853E5507AdF3e682218b8AC86cdD62951",
  vUSDD_LiquidStakedBNB: "0xD5b20708d8f0FcA52cb609938D0594C4e32E5DaD",
  vUSDT_LiquidStakedBNB: "0x2197d02cC9cd1ad51317A0a85A656a0c82383A7c",
  vWBNB_LiquidStakedBNB: "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
  vankrBNB_LiquidStakedBNB: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  vstkBNB_LiquidStakedBNB: "0x75aa42c832a8911B77219DbeBABBB40040d16987",

  vBTT_Tron: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  vTRX_Tron: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  vUSDD_Tron: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
  vUSDT_Tron: "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
  vWIN_Tron: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
};

const grant = (target: string, signature: string, caller: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
});

const acceptOwnership = () => {
  return [SHORTFALL, RISK_FUND, PROTOCOL_SHARE_RESERVE].map(target => ({
    target: target,
    signature: "acceptOwnership()",
    params: [],
  }));
};

const configureAccessControls = () => [
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", NORMAL_TIMELOCK),
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", FAST_TRACK_TIMELOCK),
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", CRITICAL_TIMELOCK),
  grant(RISK_FUND, "swapPoolsAssets(address[],uint256[],address[][],uint256)", MANAGER),

  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateIncentiveBps(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateIncentiveBps(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateIncentiveBps(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "pauseAuctions()", NORMAL_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", CRITICAL_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", PAUSE_GUARDIAN),

  grant(SHORTFALL, "resumeAuctions()", NORMAL_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", CRITICAL_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", PAUSE_GUARDIAN),
];

export const vip170Testnet = () => {
  const meta = {
    version: "v2",
    title: "Configure shortfall, PSR, risk fund",
    description: ``,
    forDescription: "y",
    againstDescription: "n",
    abstainDescription: "idk",
  };

  return makeProposal(
    [
      ...acceptOwnership(),
      ...configureAccessControls(),
      ...Object.values(vTokens).flatMap(vToken => [
        {
          target: vToken,
          signature: "setShortfallContract(address)",
          params: [SHORTFALL],
        },
        {
          target: vToken,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
