import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PAUSE_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const MANAGER = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";

const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const PROTOCOL_SHARE_RESERVE = "0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4";

const vTokens = {
  vHAY_Stablecoins: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  vUSDT_Stablecoins: "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B",
  vUSDD_Stablecoins: "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035",

  vALPACA_DeFi: "0x02c5Fb0F26761093D297165e902e96D08576D344",
  vANKR_DeFi: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
  vUSDT_DeFi: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
  vBSW_DeFi: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  vUSDD_DeFi: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
  vankrBNB_DeFi: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723",
  vTWT_DeFi: "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F",

  vFLOKI_GameFi: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  vRACA_GameFi: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  vUSDD_GameFi: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
  vUSDT_GameFi: "0x4978591f17670A846137d9d613e333C38dc68A37",

  vBNBx_LiquidStakedBNB: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
  vWBNB_LiquidStakedBNB: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
  vankrBNB_LiquidStakedBNB: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  vstkBNB_LiquidStakedBNB: "0xcc5D9e502574cda17215E70bC0B4546663785227",

  vBTT_Tron: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  vTRX_Tron: "0x836beb2cB723C498136e1119248436A645845F4E",
  vUSDD_Tron: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
  vUSDT_Tron: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
  vWIN_Tron: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
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

export const vip160 = () => {
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
