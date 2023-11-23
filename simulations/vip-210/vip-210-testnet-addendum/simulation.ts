import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip210TestnetAddendum } from "../../../vips/vip-210/vip-210-testnet-addendum";
import PRIME_PROXY_ABI from "./abis/PrimeProxy.json";
import { expectEvents } from "../../../src/utils";
import { TransactionResponse } from "@ethersproject/providers";

const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
const NEW_PRIME_IMPL = "0x72C9Bc4433C912ecd8184B3F7dda55Ee25761896";
const OLD_PRIME_IMPL = "0xf41141a3025798D03D08e846F35Ea655371A594a";

forking(35325853, () => {
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

  testVip("VIP-210 Prime Program", vip210TestnetAddendum(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_PROXY_ABI], ["Upgraded"], [1]);
    },
  });

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
