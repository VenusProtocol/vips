import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip110TestnetAddendum2 } from "../../vips/vip-110-testnet-addendum2";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCK_VTOKEN_ABI from "./abi/mockVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const MOCK_VTOKEN = "0x65d77756974d3DA088F75DA527009c286F0228EE";
const DUMMY_SIGNER= "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";

interface vTokenConfig {
  assetName: string;
  assetAddress: string;
  price: string;
}

const vTokens: vTokenConfig[] = [
  {
    assetName: "BIFI",
    assetAddress: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    price: "448.04805044"
  },
  {
    assetName: "BSW",
    assetAddress: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    price: "0.1671991"
  },
  {
    assetName: "ALPACA",
    assetAddress: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
    price: "0.2667"
  },
  {
    assetName: "WOO",
    assetAddress: "0x65B849A4Fc306AF413E341D44dF8482F963fBB91",
    price: "0.29290856"
  },
  {
    assetName: "FLOKI",
    assetAddress: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    price: "0.00003657"
  },
  {
    assetName: "BNBx",
    assetAddress: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    price: "342.50005266"
  },
  {
    assetName: "HAY",
    assetAddress: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    price: "1"
  },
  {
    assetName: "BTT",
    assetAddress: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    price: "0.0000006397"
  },
  {
    assetName: "WIN",
    assetAddress: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    price: "0.00008508"
  },
  {
    assetName: "USDD",
    assetAddress: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    price: "1"
  },
  {
    assetName: "stkBNB",
    assetAddress: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    price: "328.36"
  },
  {
    assetName: "RACA",
    assetAddress: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    price: "0.0001901"
  },
  {
    assetName: "NFT",
    assetAddress: "0xc440e4F21AFc2C3bDBA1Af7D0E338ED35d3e25bA",
    price: "0.0000003665"
  },
  {
    assetName: "ankrBNB",
    assetAddress: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    price: "337.95"
  },
  {
    assetName: "ANKR",
    assetAddress: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    price: "0.03112"
  },
];

forking(29333297, () => {
  const provider = ethers.provider;

  testVip("VIP-110-Addendum Set Feed for IL Markets", vip110TestnetAddendum2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["PricePosted"], [vTokens.length - 3]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: ethers.Contract;
    let comptroller: ethers.Contract;
    let mockVToken: ethers.Contract

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

      await impersonateAccount(DUMMY_SIGNER);
      mockVToken = new ethers.Contract(MOCK_VTOKEN, MOCK_VTOKEN_ABI, await ethers.getSigner(DUMMY_SIGNER))
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await mockVToken.setUnderlyingAsset(vToken.assetAddress)
        console.log(vToken.assetName)
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });
  });
});
