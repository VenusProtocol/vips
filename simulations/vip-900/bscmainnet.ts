import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip900, {
  CHAINLINK_OEV_SEARCHER,
  GUARDIAN_2,
  UNITROLLER,
  WBNB_BURN_CONVERTER,
} from "../../vips/vip-900/bscmainnet";
import COMPTROLLER_ABI from "./abi/FlashLoanFacet.json";

const SINGLE_TOKEN_CONVERTER_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function acceptOwnership() external",
];

forking(80413671, async () => {
  let comptroller: Contract;
  let wbnbBurnConverter: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    wbnbBurnConverter = await ethers.getContractAt(SINGLE_TOKEN_CONVERTER_ABI, WBNB_BURN_CONVERTER);
  });

  describe("Pre-VIP behavior", () => {
    it("Chainlink OEV Searcher should not be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(CHAINLINK_OEV_SEARCHER)).to.equal(false);
    });
  });

  testVip("VIP-900", await vip900(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Chainlink OEV Searcher should be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(CHAINLINK_OEV_SEARCHER)).to.equal(true);
    });

    it("Guardian 2 should be set as pending owner of WBNBBurnConverter", async () => {
      expect(await wbnbBurnConverter.pendingOwner()).to.equal(GUARDIAN_2);
    });

    it("Guardian 2 should be able to accept ownership of WBNBBurnConverter", async () => {
      const guardian2Signer = await initMainnetUser(GUARDIAN_2, ethers.utils.parseEther("1"));
      await wbnbBurnConverter.connect(guardian2Signer).acceptOwnership();
      expect(await wbnbBurnConverter.owner()).to.equal(GUARDIAN_2);
      expect(await wbnbBurnConverter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });
});
