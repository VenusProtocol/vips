import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const POOL_STABLECOIN = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const POOL_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const POOL_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const POOL_LIQUID_STAKED_BNB = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const POOL_TRON = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

interface GrantAccess {
  target: string;
  signature: string;
  params: Array<string>;
}

const grantAccessControl = (contract: string) => {
  const accessProposals: Array<GrantAccess> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [contract, "setForcedLiquidation(address,bool)", target],
    });
  });

  return accessProposals;
};

export const vip185 = () => {
  const meta = {
    version: "v2",
    title: "VIP-185 Add forced liquidations feature into the Isolated Pools",
    description: `
        Upgardes the implementation contract for comptroller beacon for isolated pools
        Gives call permissions to all three timelocks for setting forced liquidation`,

    forDescription: "I agree that Venus Protocol should proceed with upgrading comptroller beacon",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading comptroller beacon",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading comptroller beacon",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      ...grantAccessControl(POOL_STABLECOIN),
      ...grantAccessControl(POOL_DEFI),
      ...grantAccessControl(POOL_GAMEFI),
      ...grantAccessControl(POOL_LIQUID_STAKED_BNB),
      ...grantAccessControl(POOL_TRON),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
