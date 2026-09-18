import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip712, {
  COLLATERAL_GATEWAY,
  ENTER_MARKET_FOR_ACCOUNT_SIGNATURE,
  NEW_MARKET_FACET,
  PRIME,
  PRIME_NEW_IMPLEMENTATION,
} from "../../vips/vip-712/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const OLD_MARKET_FACET = "0x3372D6aeb32aa6AB0933127ac9194E8915172752";

const ENTER_MARKET_FOR_ACCOUNT_SELECTOR = "0x2e30a93c";

// EIP-1967 implementation slot: keccak256("eip1967.proxy.implementation") - 1
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

// Role the AccessControlManager stores for one function on one contract.
const callPermissionRole = (target: string, signature: string) =>
  ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [target, signature]));

// Reads the address held in the EIP-1967 implementation slot of a proxy.
const readImplementation = async (proxy: string) => {
  const raw = await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT);
  return ethers.utils.getAddress(ethers.utils.hexDataSlice(raw, 12));
};

forking(131148513, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;
  let acm: Contract;
  let oldMarketFacetSelectors: string[];

  before(async () => {
    unitroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);
    acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    oldMarketFacetSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
  });

  describe("Pre-VIP behavior", async () => {
    it("MarketFacet routes 31 selectors from the old facet", async () => {
      expect(oldMarketFacetSelectors).to.have.lengthOf(31);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal([]);
    });

    it("enterMarketForAccount is not routed", async () => {
      expect(oldMarketFacetSelectors).to.not.include(ENTER_MARKET_FOR_ACCOUNT_SELECTOR);
    });

    it("Prime proxy points at the old implementation", async () => {
      expect(await readImplementation(PRIME)).to.not.equal(PRIME_NEW_IMPLEMENTATION);
    });

    it("gateway cannot call enterMarketForAccount", async () => {
      const role = callPermissionRole(bsctestnet.UNITROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      expect(await acm.hasRole(role, COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("gateway is not a whitelisted flash loan account", async () => {
      expect(await unitroller.authorizedFlashLoan(COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("Normal Timelock already holds the flash loan whitelist permission", async () => {
      const role = callPermissionRole(bsctestnet.UNITROLLER, "setWhiteListFlashLoanAccount(address,bool)");
      expect(await acm.hasRole(role, bsctestnet.NORMAL_TIMELOCK)).to.equal(true);
    });
  });

  testVip("vip-712 testnet", await vip712(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Prime proxy points at the new implementation", async () => {
      expect(await readImplementation(PRIME)).to.equal(ethers.utils.getAddress(PRIME_NEW_IMPLEMENTATION));
    });

    it("all MarketFacet selectors move to the new facet", async () => {
      const expected = [...oldMarketFacetSelectors, ENTER_MARKET_FOR_ACCOUNT_SELECTOR].sort();
      const actual = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

      expect(actual).to.deep.equal(expected);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET);
    });

    it("gateway can call enterMarketForAccount", async () => {
      const role = callPermissionRole(bsctestnet.UNITROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      expect(await acm.hasRole(role, COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("gateway is a whitelisted flash loan account", async () => {
      expect(await unitroller.authorizedFlashLoan(COLLATERAL_GATEWAY)).to.equal(true);
    });
  });
});
