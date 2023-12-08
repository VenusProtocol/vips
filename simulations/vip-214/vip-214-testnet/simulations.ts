import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip214 } from "../../../vips/vip-214/vip-214-testnet";
import PRIME_ABI from "./abi/prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/primeLiquidityProvider.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";

const PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";


forking(35776436, () => {
  // const provider = ethers.provider;
  // let resilientOracle: ethers.Contract;
  // let defaultProxyAdmin: ethers.Contract;
  // let boundValidator: ethers.Contract;

  // before(async () => {
  //   await impersonateAccount(NORMAL_TIMELOCK);
  //   const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

  //   resilientOracle = new ethers.Contract(RESILIENT_ORACLE_PROXY, RESILIENT_ORACLE_ABI, timelock);
  //   boundValidator = new ethers.Contract(BOUND_VALIDATOR_PROXY, BOUND_VALIDATOR_ABI, timelock);
  //   defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
  // });

  describe("Pre-VIP behavior", () => {
  //   it("ResilientOracle proxy should have old implementation", async () => {
  //     const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
  //     expect(implementation).to.equal(OLD_RESILIENT_ORACLE_IMPLEMENTATION);
  //   });
  });

  testVip("vip214Testnet", vip214(), {
    callbackAfterExecution: async txResponse => {
    },
  });

  describe("Post-VIP behavior", () => {
    // it("ResilientOracle proxy should have new implementation", async () => {
    //   const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
    //   expect(implementation).to.equal(NEW_RESILIENT_ORACLE_IMPLEMENTATION);
    // });

    // it("ResilientOracle should point to correct dependencies", async () => {
    //   expect(await resilientOracle.boundValidator()).to.equal(BOUND_VALIDATOR_PROXY);
    //   expect(await resilientOracle.vBnb()).to.equal(VBNB_ADDRESS);
    //   expect(await resilientOracle.vai()).to.equal(VAI_ADDRESS);
    //   expect(await resilientOracle.accessControlManager()).to.equal(ACM);
    // });

    // it("Should return a valid price", async () => {
    //   expect(await resilientOracle.getPrice(TRX)).to.not.equal(0);
    //   expect(await resilientOracle.getUnderlyingPrice(VBNB_ADDRESS)).to.not.equal(0);
    // });

    // describe("BoundValidator behavior", () => {
    //   before(async () => {
    //     await resilientOracle.setOracle(TRX, CHAINLINK_ORACLE, 1); // Set Chainlink as the Pivot oracle for TRX
    //     await resilientOracle.enableOracle(TRX, 1, true); // Enable the Pivot Oracle for TRX
    //   });

    //   it("Inside the limits", async () => {
    //     await boundValidator.setValidateConfig({
    //       asset: TRX,
    //       upperBoundRatio: parseUnits("1.1", 18),
    //       lowerBoundRatio: parseUnits("0.9", 18),
    //     });

    //     expect(await resilientOracle.getPrice(TRX)).to.not.equal(0);
    //   });

    //   it("Outside the limits", async () => {
    //     await boundValidator.setValidateConfig({
    //       asset: TRX,
    //       upperBoundRatio: parseUnits("2", 18),
    //       lowerBoundRatio: parseUnits("1.1", 18),
    //     });

    //     await expect(resilientOracle.getPrice(TRX)).to.be.reverted;
    //   });
    // });
  });
});
