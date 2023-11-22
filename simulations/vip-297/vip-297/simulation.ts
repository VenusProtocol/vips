import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip297 } from "../../../vips/vip-297/vip-297";
import PRIME_PROXY_ABI from "./abis/PrimeProxy.json";

const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const OLD_PRIME_IMPL = "0xc86f1aA3cBe1F76F3335a66Db7F490e343CbeF50";
const NEW_PRIME_IMPL = "0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

forking(33721436, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;

    before(async () => {
      await impersonateAccount(DEFAULT_PROXY_ADMIN);
      const signer = await ethers.getSigner(DEFAULT_PROXY_ADMIN);

      prime = await ethers.getContractAt(PRIME_PROXY_ABI, PRIME, signer);
    });

    it("check implementation", async () => {
      const primeImplementation = await prime.callStatic.implementation();
      expect(primeImplementation).to.be.equal(OLD_PRIME_IMPL);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });

  testVip("VIP-297 Prime Program", vip297());

  describe("Post-VIP behavior", async () => {
    let prime: Contract;

    before(async () => {
      await impersonateAccount(DEFAULT_PROXY_ADMIN);
      const signer = await ethers.getSigner(DEFAULT_PROXY_ADMIN);

      prime = await ethers.getContractAt(PRIME_PROXY_ABI, PRIME, signer);
    });

    it("check implementation", async () => {
      const primeImplementation = await prime.callStatic.implementation();
      expect(primeImplementation).to.be.equal(NEW_PRIME_IMPL);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });
});
