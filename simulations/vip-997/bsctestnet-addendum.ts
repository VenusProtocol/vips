import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ACM, NORMAL_TIMELOCK, SPOKE_COMPTROLLER, VUSDT_SPOKE } from "../../vips/vip-997/bsctestnet";
import vip997Addendum, {
  BSTOCK_LIQUIDATOR,
  CORE_COMPTROLLER,
  ENTER_MARKET_FOR_ACCOUNT,
  NEW_COLLATERAL_GATEWAY,
  OLD_COLLATERAL_GATEWAY,
} from "../../vips/vip-997/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import FLASH_LOAN_FACET_ABI from "./abi/FlashLoanFacet.json";

// After the BStockLiquidator deployment and owner setup, and after the CollateralGateway redeployment.
const BLOCK_NUMBER = 135400000;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const CORE_VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const SPOKE_POOL_REGISTRY = "0xeAA45288d804971e5a76f33559e629F5b2b1Cb8B";

// Holds nothing anywhere. `enterMarketForAccount` only records membership, so it needs no balance.
const BENEFICIARY = "0x0000000000000000000000000000000000000200";

const LIQUIDATOR_ABI = [
  "function poolRegistry() view returns (address)",
  "function coreFlashSource(address) view returns (address)",
];
const GATEWAY_ABI = [
  "function COMPTROLLER() view returns (address)",
  "function POOL_REGISTRY() view returns (address)",
  "function owner() view returns (address)",
];
// Core and Spoke share the name and argument order: (account, vToken).
const ENTER_MARKET_ABI = [
  "function enterMarketForAccount(address account, address vToken)",
  "function checkMembership(address account, address vToken) view returns (bool)",
];

// `isAllowedToCall` keys the role on `msg.sender`, so it is asked from the Comptroller's own address. Unlike
// `hasRole` it also counts address(0) wildcards, which could otherwise leave a revoke incomplete.
const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayEnterMarket = async (comptroller: string, account: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, ENTER_MARKET_FOR_ACCOUNT]);
  const result = await ethers.provider.call({ to: ACM, data, from: comptroller });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};
const enterMarketGrants = async (account: string) => [
  await mayEnterMarket(CORE_COMPTROLLER, account),
  await mayEnterMarket(SPOKE_COMPTROLLER, account),
];

forking(BLOCK_NUMBER, async () => {
  let core: Contract;

  before(async () => {
    core = await ethers.getContractAt(FLASH_LOAN_FACET_ABI, CORE_COMPTROLLER);
  });

  describe("Pre-VIP state", () => {
    it("the liquidator's owner has set the Spoke pool registry and the USDT flash source", async () => {
      const liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, BSTOCK_LIQUIDATOR);
      expect(await liquidator.poolRegistry()).to.equal(SPOKE_POOL_REGISTRY);
      expect(await liquidator.coreFlashSource(USDT)).to.equal(CORE_VUSDT);
    });

    it("the new gateway points at the same Comptroller and registry as the old one, owned by the Normal Timelock", async () => {
      const fresh = await ethers.getContractAt(GATEWAY_ABI, NEW_COLLATERAL_GATEWAY);
      const old = await ethers.getContractAt(GATEWAY_ABI, OLD_COLLATERAL_GATEWAY);
      expect(await fresh.COMPTROLLER()).to.equal(await old.COMPTROLLER());
      expect(await fresh.POOL_REGISTRY()).to.equal(await old.POOL_REGISTRY());
      expect(await fresh.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the liquidator is not whitelisted for flash loans", async () => {
      expect(await core.authorizedFlashLoan(BSTOCK_LIQUIDATOR)).to.equal(false);
    });

    it("the new gateway holds no grant, not even through a wildcard", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([false, false]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("the old gateway holds all three grants", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([true, true]);
      expect(await core.authorizedFlashLoan(OLD_COLLATERAL_GATEWAY)).to.equal(true);
    });
  });

  testVip(
    "VIP-997 Addendum [BNB Chain Testnet] Spoke pool: bStock liquidator and CollateralGateway grants",
    await vip997Addendum(),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [2, 2]);
        await expectEvents(txResponse, [FLASH_LOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [3]);
      },
    },
  );

  describe("Post-VIP state", () => {
    it("the liquidator is whitelisted for flash loans", async () => {
      expect(await core.authorizedFlashLoan(BSTOCK_LIQUIDATOR)).to.equal(true);
    });

    it("the new gateway holds both enterMarketForAccount roles and the flash loan whitelist", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([true, true]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("the old gateway holds none of them", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([false, false]);
      expect(await core.authorizedFlashLoan(OLD_COLLATERAL_GATEWAY)).to.equal(false);
    });
  });

  describe("Post-VIP behaviour", () => {
    const markets = [
      ["Core", CORE_COMPTROLLER, CORE_VUSDT],
      ["Spoke", SPOKE_COMPTROLLER, VUSDT_SPOKE],
    ];

    for (const [pool, comptroller, vToken] of markets) {
      it(`the new gateway enters a ${pool} market on an account's behalf`, async () => {
        const gateway = await initMainnetUser(NEW_COLLATERAL_GATEWAY, ethers.utils.parseEther("1"));
        const asGateway = new ethers.Contract(comptroller, ENTER_MARKET_ABI, gateway);
        expect(await asGateway.checkMembership(BENEFICIARY, vToken)).to.equal(false);
        await asGateway.enterMarketForAccount(BENEFICIARY, vToken);
        expect(await asGateway.checkMembership(BENEFICIARY, vToken)).to.equal(true);
      });

      it(`the old gateway can no longer enter a ${pool} market`, async () => {
        const gateway = await initMainnetUser(OLD_COLLATERAL_GATEWAY, ethers.utils.parseEther("1"));
        const asGateway = new ethers.Contract(comptroller, ENTER_MARKET_ABI, gateway);
        await expect(asGateway.enterMarketForAccount(BENEFICIARY, vToken)).to.be.reverted;
      });
    }
  });
});
