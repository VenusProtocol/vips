import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip0021 } from "../../../proposals/vip-002/vip-002-sepolia-reset-reward-distr";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { sepolia } = NETWORK_ADDRESSES;
const COMPTROLLER_LST = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
const COMPTROLLER_IMPL = "0x0bA3dBDb53a367e9132587c7Fc985153A2E25f08";

forking(5517400, () => {
  let comptrollerCore: Contract;
  let comptrollerStableCoins: Contract;
  let comptrollerCurve: Contract;
  let comptrollerLst: Contract;
  let comptrollerBeacon: Contract;

  before(async () => {
    comptrollerCore = await ethers.getContractAt(COMPTROLLER_ABI, sepolia.COMPTROLLER_CORE);
    comptrollerStableCoins = await ethers.getContractAt(COMPTROLLER_ABI, sepolia.COMPTROLLER_STABLECOINS);
    comptrollerCurve = await ethers.getContractAt(COMPTROLLER_ABI, sepolia.COMPTROLLER_CURVE);
    comptrollerLst = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_LST);
    comptrollerBeacon = await ethers.getContractAt(BEACON_ABI, COMPTROLLER_BEACON);
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip0021());
    });
    describe("Rewards Distributors state", () => {
      it("Comptrollers should have 0 reward distributors", async () => {
        expect(await comptrollerCore.getRewardDistributors()).to.have.lengthOf(0);
        expect(await comptrollerStableCoins.getRewardDistributors()).to.have.lengthOf(0);
        expect(await comptrollerCurve.getRewardDistributors()).to.have.lengthOf(0);
        expect(await comptrollerLst.getRewardDistributors()).to.have.lengthOf(0);
      });
      it("Beacon should have the correct comptroller implementation", async () => {
        expect(await comptrollerBeacon.implementation()).to.equal(COMPTROLLER_IMPL);
      });
    });
  });
});
