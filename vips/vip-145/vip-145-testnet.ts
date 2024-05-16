import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const CHAINLINK_ORACLE_IMPL = "0xa074529FD3d0E7261A730d0f867107BA0C20d74A";
const RESILIENT_ORACLE_IMPL = "0xF53cFE89b4c3eFCbdd9aF712e94017454d43c181";
const BOUND_VALIDATOR_IMPL = "0x4915F67a57FDcbA22535F0F021D64b66b095d026";
const PYTH_ORACLE_IMPL = "0xb8a450101DF8ab770c8F8521E189a4B39e7Cf5f5";
const TWAP_ORACLE_IMPL = "0x572ec272B4Ae3a50B99905AFd78671F84474ffd1";
const BINANCE_ORACLE_IMPL = "0xCd64844CD0E8E34782cd0d1bF3E537bf7b474FAe";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
const PYTH_ORACLE = "0x94E1534c14e0736BB24decA625f2F5364B198E0C";
const TWAP_ORACLE = "0x3eeE05d929D1E9816185B1b6d8c470eC192b4432";
const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";

const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

export const vip145Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-145 Get price Upgrade",
    description: `
    Upgrade Oracle to Support Get Price Feature
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PYTH_ORACLE, PYTH_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [TWAP_ORACLE, TWAP_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", NORMAL_TIMELOCK],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["WBNB", "BNB"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["wBETH", "WBETH"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
