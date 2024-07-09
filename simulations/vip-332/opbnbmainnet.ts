import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip332, { OPBNBMAINNET_BOUND_VALIDATOR } from "../../vips/vip-332/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import BINANCE_ORACLE_API from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(28761242, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;

  before(async () => {
    binanceOracle = new ethers.Contract(opbnbmainnet.BINANCE_ORACLE, BINANCE_ORACLE_API, provider);
    resilientOracle = new ethers.Contract(opbnbmainnet.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(OPBNBMAINNET_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("vip332 configures bridge", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted", "RoleRevoked"], [18, 3]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).equals(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
