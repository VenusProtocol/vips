import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const NEW_PRIME_IMPLEMENTATION = "0x7A2e3481F345367045539896e5Bf385910fB5C2C";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0x9817823d5C4023EFb6173099928F17bb77CD1d69";
const NEW_PLP_IMPLEMENTATION = "0x208068AE8A619FCc851659791659B1aA40d796dA";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const IL_COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const IL_VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
const NEW_IL_COMPTROLLER_IMPL = "0x3f66e044dfd1ccc834e55624b5f6e9e75ab36000";
const NEW_IL_VTOKEN_IMPL = "0x9A8ADe92b2D71497b6F19607797F2697cF30f03A";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";

export const vip214 = () => {
  const meta = {
    version: "v2",
    title: "VAI Controller and Prime Upgrade",
    description:
      "This VIP upgrades the VAI Controller and Prime contracts. The VAI controller will now be able to only allow Prime users to mint VAI.",
    forDescription: "I agree that Venus Protocol should proceed with upgrading Prime and VAI Controller",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading Prime and VAI Controller",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading Prime and VAI Controller",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME_PROXY, NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: PRIME_PROXY,
        signature: "initializeV2(address)",
        params: [POOL_REGISTRY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_VAI_CONTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PLP_PROXY, NEW_PLP_IMPLEMENTATION],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setPrimeToken(address)",
        params: [PRIME_PROXY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setVAIToken(address)",
        params: [VAI],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "toggleOnlyPrimeHolderMint()",
        params: [],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: [parseUnits("0.07", 18).toString()],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setMintCap(uint256)",
        params: [parseUnits("10000000", 18).toString()],
      },
      {
        target: COMPTROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: [parseUnits("1", 18).toString()],
      },
      {
        target: IL_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IL_COMPTROLLER_IMPL],
      },
      {
        target: IL_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IL_VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
