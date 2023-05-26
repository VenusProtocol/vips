import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip122TestnetAddendum3 } from "../../../vips/vip-122/vip-122-testnet-addendum3";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCK_VTOKEN_ABI from "./abi/mockVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const MOCK_VTOKEN = "0x65d77756974d3DA088F75DA527009c286F0228EE";
const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";

interface vTokenConfig {
  assetName: string;
  assetAddress: string;
  price: string;
}

const vTokens: vTokenConfig[] = [
  {
    assetName: "WBNB",
    assetAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    price: "325.34822097",
  },
];

forking(29532024, () => {
  const provider = ethers.provider;

  testVip("VIP-122-Addendum Set Feed for WBNB Market", vip122TestnetAddendum3(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: ethers.Contract;
    let comptroller: ethers.Contract;
    let mockVToken: ethers.Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

      await impersonateAccount(DUMMY_SIGNER);
      mockVToken = new ethers.Contract(MOCK_VTOKEN, MOCK_VTOKEN_ABI, await ethers.getSigner(DUMMY_SIGNER));
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await mockVToken.setUnderlyingAsset(vToken.assetAddress);
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });
  });
});
