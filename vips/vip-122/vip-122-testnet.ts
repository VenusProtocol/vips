import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const CHAINLINK_ORACLE = "0xfc4e26B7fD56610E84d33372435F0275A359E8eF";
const RESILIENT_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";
const BOUND_VALIDATOR = "0x84e96554776607E5Ba78aeC299a81b70D03a53D6";
const PYTH_ORACLE = "0xcBF6db3DC2f3F8e3552b12B564a8Faf74B64DaeA";
const TWAP_ORACLE = "0x49be570231a5b9EfB0359CfC781EfDf5359dcD51";
const BINANCE_ORACLE = "0x4aB96DCDE8c617FBBF95A381fDb21Fb49551ec63";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

interface AssetConfig {
  name: string;
  address: string;
  feed: string;
}

const ASSETS: AssetConfig[] = [
  {
    name: "BNX",
    address: "0xa8062D2bd49D1D2C6376B444bde19402B38938d0",
    feed: "0xf51492DeD1308Da8195C3bfcCF4a7c70fDbF9daE",
  },
  {
    name: "BTCB",
    address: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    feed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
  },
  {
    name: "TRX",
    address: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
  {
    name: "TRX",
    address: "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F",
    feed: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  },
  {
    name: "AAVE",
    address: "0x4B7268FC7C727B88c5Fc127D41b491BfAe63e144",
    feed: "0x298619601ebCd58d0b526963Deb2365B485Edc74",
  },
  {
    name: "MATIC",
    address: "0xcfeb0103d4BEfa041EA4c2dACce7B3E83E1aE7E3",
    feed: "0x957Eb0316f02ba4a9De3D308742eefd44a3c1719",
  },
  {
    name: "CAKE",
    address: "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
    feed: "0x81faeDDfeBc2F8Ac524327d70Cf913001732224C",
  },
  {
    name: "DOGE",
    address: "0x67D262CE2b8b846d9B94060BC04DC40a83F0e25B",
    feed: "0x963D5e7f285Cc84ed566C486c3c1bC911291be38",
  },
  {
    name: "ADA",
    address: "0xcD34BC54106bd45A04Ed99EBcC2A6a3e70d7210F",
    feed: "0x5e66a1775BbC249b5D51C13d29245522582E671C",
  },
  {
    name: "XRP",
    address: "0x3022A32fdAdB4f02281E8Fab33e0A6811237aab0",
    feed: "0x4046332373C24Aed1dC8bAd489A04E187833B28d",
  },
  {
    name: "LTC",
    address: "0x969F147B6b8D81f86175de33206A4FD43dF17913",
    feed: "0x9Dcf949BCA2F4A8a62350E0065d18902eE87Dca3",
  },
  {
    name: "ETH",
    address: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    feed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  },
  {
    name: "XVS",
    address: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
    feed: "0xCfA786C17d6739CBC702693F23cA4417B5945491",
  },
  {
    name: "SXP",
    address: "0x75107940Cf1121232C0559c747A986DEfbc69DA9",
    feed: "0x678AC35ACbcE272651874E782DB5343F9B8a7D66",
  },
  {
    name: "USDT",
    address: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    feed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
  },
  {
    name: "USDC",
    address: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    feed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
  },
  {
    name: "BNB",
    address: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  },
  {
    name: "BUSD",
    address: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
    feed: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
  },
];

const MAX_STALE_PERIOD = 60 * 60 * 24; // 24 hours

export const vip122Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-122 Resilient Oracle",
    description: `
    Configure Price Feeds for Existing Markets
    Configure Oracle Address in Comptroller
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BOUND_VALIDATOR, "setValidateConfigs(ValidateConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CHAINLINK_ORACLE, "setUnderlyingPrice(VBep20Interface,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CHAINLINK_ORACLE, "setTokenConfigs(TokenConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PYTH_ORACLE, "setTokenConfigs(TokenConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PYTH_ORACLE, "setUnderlyingPythOracle(IPyth)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PYTH_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TWAP_ORACLE, "setTokenConfigs(TokenConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [TWAP_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "unpause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "pause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "setTokenConfigs(TokenConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "setOracle(address,address,OracleRole)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "enableOracle(address,OracleRole,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: PYTH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: TWAP_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
      },
      ...ASSETS.map(asset => {
        return {
          target: CHAINLINK_ORACLE,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[asset.address, asset.feed, MAX_STALE_PERIOD]],
        };
      }),
      ...ASSETS.map(asset => {
        return {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3]))",
          params: [
            [
              asset.address,
              [
                CHAINLINK_ORACLE,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
              ],
              [true, false, false],
            ],
          ],
        };
      }),
      {
        target: COMPTROLLER,
        signature: "_setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
