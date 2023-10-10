import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBNB_ADDRESS = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VBNBAdmin_ADDRESS = "0x2b11a94DA41a5cAcAa6e1E3F23139cED805808b5";
const PSR = "0x99C0a8b68fAA4F1245Cd007E16CE4c5Eb2dB2415";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const NEW_RISK_FUND_IMPLEMENTATION = "0x0E8Ef0EC1e0C109c5B5249CcefB703A414835eaC";
const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const PSR_PROXY_ADMIN = "0x2b19f7301A5c1D90bD83DEe10e33dC3B7A3C0460";
const VBNBAdmin_PROXY_ADMIN = "0x3f918bA9446552AB184C6Ffd2e2fcB1FA5ee1e59";

export const vip152 = () => {
  const meta = {
    version: "v2",
    title: "Change vBNB admin to vBNBAdmin and Setup Protocol Share Reserve",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the vBNB admin and setting up PSR",
    againstDescription:
      "I do not think that Venus Protocol should proceed with setting the vBNB admin and setting up PSR",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with setting the vBNB admin and setting up PSR",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND, NEW_RISK_FUND_IMPLEMENTATION],
      },
      {
        target: VBNBAdmin_ADDRESS,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: vBNB_ADDRESS,
        signature: "_setPendingAdmin(address)",
        params: [VBNBAdmin_ADDRESS],
      },
      {
        target: VBNBAdmin_ADDRESS,
        signature: "_acceptAdmin()",
        params: [],
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: VBNBAdmin_PROXY_ADMIN,
        signature: "changeProxyAdmin(address,address)",
        params: [VBNBAdmin_ADDRESS, PROXY_ADMIN],
      },
      {
        target: VBNBAdmin_ADDRESS,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: PSR_PROXY_ADMIN,
        signature: "changeProxyAdmin(address,address)",
        params: [PSR, PROXY_ADMIN],
      },
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint8,address)[])",
        params: [
          [
            [0, 50, RISK_FUND],
            [0, 50, TREASURY],
            [1, 40, RISK_FUND],
            [1, 60, TREASURY],
          ],
        ],
      },
      {
        target: PSR,
        signature: "setPoolRegistry(address)",
        params: [POOL_REGISTRY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
