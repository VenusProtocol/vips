import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import SD_ABI from "./abi/IERC20UpgradableAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import { vip141Testnet } from "../../../vips/vip-141/vip-141-testnet";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import MOCK_VTOKEN_ABI from "./abi/mockVToken.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const SD = "0xac7d6b77ebd1db8c5a9f0896e5eb5d485cb677b3";

const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";
const MOCK_VTOKEN = "0x65d77756974d3DA088F75DA527009c286F0228EE";

forking(30720569, () => {
  let comptroller: ethers.Contract;
  let sd: ethers.Contract;
  let oracle: ethers.Contract;
  let mockVToken: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    sd = new ethers.Contract(SD, SD_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);

    await impersonateAccount(DUMMY_SIGNER);
    mockVToken = new ethers.Contract(MOCK_VTOKEN, MOCK_VTOKEN_ABI, await ethers.getSigner(DUMMY_SIGNER));
  });

  testVip("VIP-128-testnet Add SD Price Feed", vip141Testnet(24 * 60 * 60 * 3), {
    callbackAfterExecution: async txResponse => {},
  });

  describe("Post-VIP behavior", async () => {
    it("get correct price from oracle ", async () => {
      await mockVToken.setUnderlyingAsset(SD);
      const price = await oracle.getUnderlyingPrice(mockVToken.address);
      expect(price).to.equal(parseUnits("1649.670295770000000000", 18));
    });
  });
});
