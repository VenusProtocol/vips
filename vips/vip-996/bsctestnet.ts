import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK, UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export const CORE_COMPTROLLER = UNITROLLER;
export const SPOKE_COMPTROLLER = "0x11960c84d6c4F2a978a12372721C3A6A88C78f4c";
export const QA_SPOKE_COMPTROLLER = "0xb084B5af4a040933790Cdc1b2d15ac7BB3514E50";
export { GUARDIAN, NORMAL_TIMELOCK };

// ProtocolShareReserve
export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const OLD_PSR_IMPLEMENTATION = "0x248Ea902F2f50cb232799196530bCDaDcF2659E9";
export const NEW_PSR_IMPLEMENTATION = "0xADdE8c59097955B5A3b0677AF7a7a4255dC92930";

// Liquidity Hub
export const HUB_BEACON = "0x7cbaC6991aC33DaFDD347e84CFbE2F372b936d92";
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const OLD_HUB_IMPLEMENTATION = "0x9Ea3900fC0a413eFCe485F19d8681498b9600A41";
export const NEW_HUB_IMPLEMENTATION = "0xf5BF6a82ebA3A06747f45de26D8AC9604ca5dbE4";

export const ADAPTERS = {
  FRV: { old: "0xeF0E85ab9A23F50EB4595CF7e2F5461feF7E7fc5", new: "0xcdd9cf27C388dAc9e89De257505aff9290183537" },
  FLUX: { old: "0x15Dca35ae0b16BeceabAEC9Dea49630e8C601730", new: "0x51d8cAdc16Df3F8Cd0D1B536e943FbDcE77AC523" },
  CORE: { old: "0xDf669957448eCB23309eEFda4de230c62d22AE33", new: "0x07c80ed1F928913ab68E1fABB2fe0439CdC99F88" },
  CENTRIFUGE: { old: "0x8219375B48a9fcca0F9E5eA1c1B171524aa347E1", new: "0x63Ce07c3F1500B283B6d3451BdC3E3C6211a6c7F" },
  SPOKE: { old: "0xaE3e15f26815e2c517764d98791F828B140c010A", new: "0xA83dB9810f82C4df3F60DD0778112577B3Acaf92" },
};

// Every resource registered on Hub_USDT, by yield group, with the adapter family it uses.
export const RESOURCES: { group: string; resource: string; adapter: keyof typeof ADAPTERS }[] = [
  ...[
    "0x00f275BBc37Ec884Ea057F46463FfB669cd5F69d",
    "0x79B7c1b80ab09CbfF5a8350505AbCd3eb186b5B0",
    "0xF65a258bC1A01c3E19e46b7e6069082Ec4E49d82",
    "0xb64484B440B7332FdC9741229fB63c73E67E1aAF",
    "0xCA4dB890025a1940Ba9B65dbB6cd966c8b78EBe6",
    "0x39296eA9A38A35678f660390eA29a5657068b3aD",
    "0xc0c322aF01D85B1dF050fF4d3975a1B744CE722A",
    "0xf1786b41E755395b10870630542Af4e6b4F8789f",
  ].map(resource => ({ group: "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82", resource, adapter: "FRV" as const })),
  {
    group: "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016",
    resource: "0x52217232e12A1c906aB8DEf58532a3618970D025",
    adapter: "FLUX",
  },
  {
    group: "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88",
    resource: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    adapter: "CORE",
  },
  {
    group: "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542",
    resource: "0x8a3C1f806B635230b74741066DE9B0Aa902F83dC",
    adapter: "CENTRIFUGE",
  },
  {
    group: "0xb9Bf8232474aF0A18BbA0CbCc3bA10efD51542e2",
    resource: "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a",
    adapter: "SPOKE",
  },
];

// CollateralGateway
export const OLD_COLLATERAL_GATEWAY = "0x26837e144898D2C5c673FE880e21f83469Ad1Bf4";
export const NEW_COLLATERAL_GATEWAY = "0x1B6D1ff76beb57CF7C9B2e05BE16cb9529DCa2F9";
export const ENTER_MARKET_FOR_ACCOUNT = "enterMarketForAccount(address,address)";
export const GATEWAY_COMPTROLLERS = [CORE_COMPTROLLER, SPOKE_COMPTROLLER, QA_SPOKE_COMPTROLLER];

// EBrake and BStockPauseSentinel
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const OLD_EBRAKE_IMPLEMENTATION = "0x99E0caa86Ef6f99c2DB622C6164d68904604Ce55";
export const NEW_EBRAKE_IMPLEMENTATION = "0xAC54A4D148690b7FDA22B1D29c4439aCBF668fb2";
export const BSTOCK_PAUSE_SENTINEL = "0xC25b2B657D24380eDd1a1Cff5296385541e85204";
export const SET_ACTIONS_PAUSED = "setActionsPaused(address[],uint256[],bool)";
export const DECREASE_CF = "decreaseCF(address,uint256)";
export const SENTINEL_SETTERS = ["setTrustedKeeper(address,bool)", "setMarketMonitored(address,bool)"];

// HubNavDeviationSentinel. The new proxy gets the old one's live configuration; the old one keeps its grants.
export const OLD_HUB_NAV_SENTINEL = "0x211c38CB5543D1dd589c06ba1a27eDcF0FE25e2f";
export const NEW_HUB_NAV_SENTINEL = "0x347fBbC71C07496fbBb2fEc5D2a036605F14089D";
export const PAUSE_HUB = "pauseHub(address)";
export const HUB_NAV_SETTERS = [
  "setTrustedKeeper(address,bool)",
  "setHubNavConfig(address,address,uint16,uint16)",
  "setMinHubNavGapBps(uint16)",
  "setNavMonitoringEnabled(address,address,bool)",
];
export const CENTRIFUGE_SOURCE_USDT = "0x8DFF12277C44E73cbF551ceB6E5Ae1eD4CC85542";
export const CENTRIFUGE_VAULT_USDT = "0x8a3C1f806B635230b74741066DE9B0Aa902F83dC";
export const MIN_HUB_NAV_GAP_BPS = 1;
export const PAUSE_UP_BPS = 1000;
export const PAUSE_DOWN_BPS = 1000;

const callPermission = (grant: boolean, contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: grant ? "giveCallPermission(address,string,address)" : "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

const setFlashLoanWhitelist = (account: string, allowed: boolean) => ({
  target: CORE_COMPTROLLER,
  signature: "setWhiteListFlashLoanAccount(address,bool)",
  params: [account, allowed],
});

export const vip996 = () => {
  const meta = {
    version: "v2",
    title: "VIP-996 [BNB Chain Testnet] Hub, ProtocolShareReserve, CollateralGateway, EBrake and sentinel upgrades",
    description: `#### Summary

Moves the hub and spoke stack on BNB Chain Testnet to its latest builds: the ProtocolShareReserve, the Liquidity Hub with every resource adapter, the CollateralGateway, and EBrake with the new BStockPauseSentinel and HubNavDeviationSentinel.

#### Actions

1. Upgrade the **ProtocolShareReserve** proxy to the implementation with the Sherlock audit fixes. It adds \`setMaxLoopsLimit\`, and \`removeDistributionConfig\` now reverts when no target matches.
2. Upgrade the **Hub** beacon to the implementation with the deposit capacity changes, the Spoke integration and the HashDit and Cantina fixes. Size deposits from \`HubLens\`, deployed at [0x2e5e48242aB01b636CA0684AED2B22aDE108e337](https://testnet.bscscan.com/address/0x2e5e48242aB01b636CA0684AED2B22aDE108e337).
3. Point all 12 resources on Hub_USDT at the new adapters. Every adapter now reports a \`resourceName\`, and the Spoke adapter values its position at the market's exchange rate.
4. Grant the new **CollateralGateway** \`enterMarketForAccount(address,address)\` on the Core Comptroller and both Spoke Comptrollers, and whitelist it for Core flash loans.
5. Revoke the same three roles and the flash loan whitelist from the previous gateway.
6. Upgrade the **EBrake** proxy to the implementation that acts on each market's own comptroller, so it reaches Spoke pool markets.
7. Grant EBrake \`setActionsPaused(address[],uint256[],bool)\` on both Spoke Comptrollers. Its collateral factor and cap setters are already granted.
8. Grant the **BStockPauseSentinel** \`decreaseCF(address,uint256)\` on EBrake, and grant the Normal Timelock and the Guardian the sentinel's \`setTrustedKeeper\` and \`setMarketMonitored\`.
9. Accept ownership of the BStockPauseSentinel.
10. Move Hub NAV monitoring to the new **HubNavDeviationSentinel**: accept its ownership, grant the Normal Timelock and the Guardian its configuration setters, grant it \`pauseHub(address)\` on EBrake, and give it the previous sentinel's configuration (the Guardian as keeper, a 1 bps minimum gap, and 10% pause bands on the Centrifuge USDT vault).

#### Notes

- Testnet only.
- The previous HubNavDeviationSentinel keeps its \`pauseHub\` grant for now, so both can pause the Hub.
- No market is monitored yet. The sentinel needs a market whose underlying exposes \`pauseManager()\`, which is listed separately.

#### References

- [ProtocolShareReserve multi registry](https://github.com/VenusProtocol/protocol-reserve/pull/168) and [its Sherlock fixes](https://github.com/VenusProtocol/protocol-reserve/pull/170)
- [Hub deposit capacity](https://github.com/VenusProtocol/venus-liquidity-hub/pull/20), [Spoke integration](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22), [HashDit fixes](https://github.com/VenusProtocol/venus-liquidity-hub/pull/29) and [Cantina fixes](https://github.com/VenusProtocol/venus-liquidity-hub/pull/37)
- [CollateralGateway Cantina fixes](https://github.com/VenusProtocol/venus-periphery/pull/83)
- [EBrake Spoke support and BStockPauseSentinel](https://github.com/VenusProtocol/venus-periphery/pull/81) and [their testnet deployment](https://github.com/VenusProtocol/venus-periphery/pull/84)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PSR, NEW_PSR_IMPLEMENTATION],
      },

      {
        target: HUB_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_HUB_IMPLEMENTATION],
      },
      ...RESOURCES.map(({ group, resource, adapter }) => ({
        target: group,
        signature: "updateResourceAdapter(address,address)",
        params: [resource, ADAPTERS[adapter].new],
      })),

      ...GATEWAY_COMPTROLLERS.map(comptroller =>
        callPermission(true, comptroller, ENTER_MARKET_FOR_ACCOUNT, NEW_COLLATERAL_GATEWAY),
      ),
      setFlashLoanWhitelist(NEW_COLLATERAL_GATEWAY, true),
      ...GATEWAY_COMPTROLLERS.map(comptroller =>
        callPermission(false, comptroller, ENTER_MARKET_FOR_ACCOUNT, OLD_COLLATERAL_GATEWAY),
      ),
      setFlashLoanWhitelist(OLD_COLLATERAL_GATEWAY, false),

      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },
      callPermission(true, SPOKE_COMPTROLLER, SET_ACTIONS_PAUSED, EBRAKE),
      callPermission(true, QA_SPOKE_COMPTROLLER, SET_ACTIONS_PAUSED, EBRAKE),
      callPermission(true, EBRAKE, DECREASE_CF, BSTOCK_PAUSE_SENTINEL),
      ...SENTINEL_SETTERS.flatMap(sig => [
        callPermission(true, BSTOCK_PAUSE_SENTINEL, sig, NORMAL_TIMELOCK),
        callPermission(true, BSTOCK_PAUSE_SENTINEL, sig, GUARDIAN),
      ]),
      {
        target: BSTOCK_PAUSE_SENTINEL,
        signature: "acceptOwnership()",
        params: [],
      },

      {
        target: NEW_HUB_NAV_SENTINEL,
        signature: "acceptOwnership()",
        params: [],
      },
      ...[NORMAL_TIMELOCK, GUARDIAN].flatMap(account =>
        HUB_NAV_SETTERS.map(sig => callPermission(true, NEW_HUB_NAV_SENTINEL, sig, account)),
      ),
      callPermission(true, EBRAKE, PAUSE_HUB, NEW_HUB_NAV_SENTINEL),
      {
        target: NEW_HUB_NAV_SENTINEL,
        signature: "setTrustedKeeper(address,bool)",
        params: [GUARDIAN, true],
      },
      {
        target: NEW_HUB_NAV_SENTINEL,
        signature: "setMinHubNavGapBps(uint16)",
        params: [MIN_HUB_NAV_GAP_BPS],
      },
      {
        target: NEW_HUB_NAV_SENTINEL,
        signature: "setHubNavConfig(address,address,uint16,uint16)",
        params: [CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS],
      },
      {
        target: NEW_HUB_NAV_SENTINEL,
        signature: "setNavMonitoringEnabled(address,address,bool)",
        params: [CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip996;
