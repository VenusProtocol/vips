import { expect } from "chai";
import { Contract, constants } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip681, { PANCAKESWAP_ORACLE_BASEMAINNET } from "../../vips/vip-681/bscmainnet";
import PANCAKESWAP_ORACLE_ABI from "./abi/PancakeSwapOracle.json";

const { NORMAL_TIMELOCK } = NETWORK_ADDRESSES.basemainnet;

const BLOCK_NUMBER = 55948288;
const DEPLOYER = "0x1461d2EcE51c07E88A54dB77Dade74a5B364037D";

forking(BLOCK_NUMBER, async () => {
  const oracle = new Contract(PANCAKESWAP_ORACLE_BASEMAINNET, PANCAKESWAP_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("the deployer owns the PancakeSwapOracle, with the Normal Timelock pending", async () => {
      expect(await oracle.owner()).to.equal(DEPLOYER);
      expect(await oracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
  });

  testForkedNetworkVipCommands("VIP-681 PancakeSwapOracle ownership", await vip681(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PANCAKESWAP_ORACLE_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("the Normal Timelock owns the PancakeSwapOracle", async () => {
      expect(await oracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await oracle.pendingOwner()).to.equal(constants.AddressZero);
    });
  });
});
