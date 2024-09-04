import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/arbitrumone/vip-010";
import vip332, { ARBITRUM_ONE_BOUND_VALIDATOR } from "../../vips/vip-332/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(230362555, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;

  before(async () => {
    chainLinkOracle = new ethers.Contract(arbitrumone.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(arbitrumone.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(arbitrumone.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(ARBITRUM_ONE_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip332 configures oracle permissions", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [10]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
