import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/opbnbtestnet/vip-020";
import vip332, { OPBNBTESTNET_BOUND_VALIDATOR } from "../../vips/vip-332/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(33719963, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;

  before(async () => {
    binanceOracle = new ethers.Contract(opbnbtestnet.BINANCE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(opbnbtestnet.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(OPBNBTESTNET_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("vip332 configures bridge", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [13]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
