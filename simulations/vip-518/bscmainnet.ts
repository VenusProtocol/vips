import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip518, {
  BINANCE_ORACLE_IMPLEMENTATION,
  BOUND_VALIDATOR,
  BOUND_VALIDATOR_IMPLEMENTATION,
  CHAINLINK_ORACLE_IMPLEMENTATION,
  DEFAULT_PROXY_ADMIN,
  REDSTONE_ORACLE_IMPLEMENTATION,
  RESILIENT_ORACLE_IMPLEMENTATION,
} from "../../vips/vip-518/bscmainnet";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(51270995, async () => {
  const provider = ethers.provider;
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

  testVip("VIP-518", await vip518(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [5]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.RESILIENT_ORACLE)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.CHAINLINK_ORACLE)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.REDSTONE_ORACLE)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Binance oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.BINANCE_ORACLE)).to.equal(
          BINANCE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR)).to.equal(BOUND_VALIDATOR_IMPLEMENTATION);
      });
    });
  });
});
