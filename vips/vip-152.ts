import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBNB_ADDRESS = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VBNBAdmin_ADDRESS = "0xBC612ec01bB52349De615112F65A3DA66fb02648";
const PSR = "0x4382Da07e0fFba15CbB3F1013EcD56285542d27f";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
