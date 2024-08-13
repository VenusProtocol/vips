import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/arbitrumone/vip-010";
import { PLP, PRIME } from "../../multisig/proposals/arbitrumone/vip-010";
import vip350 from "../../vips/vip-350/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241112064, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;

  before(async () => {
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [14]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
