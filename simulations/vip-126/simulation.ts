import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip126 } from "../../vips/vip-126";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";

const MOCK_VTOKEN_CODE =
  "608060405234801561001057600080fd5b506101c3806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806325671dcb1461003b5780636f307dc314610057575b600080fd5b610055600480360381019061005091906100f1565b610075565b005b61005f6100b8565b60405161006c9190610129565b60405180910390f35b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000813590506100eb81610176565b92915050565b60006020828403121561010357600080fd5b6000610111848285016100dc565b91505092915050565b61012381610144565b82525050565b600060208201905061013e600083018461011a565b92915050565b600061014f82610156565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b61017f81610144565b811461018a57600080fd5b5056fea264697066735822122072c165598ea94093a05d15ef83a4a5cf715c200381a4687389a3455431698e7564736f6c63430008000033";
const MOCK_VTOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "_asset", type: "address" }],
    name: "setUnderlyingAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

interface VTokenConfig {
  assetAddress: string;
  price: string;
  name: string;
}

const vTokens: VTokenConfig[] = [
  {
    name: "ALPACA",
    assetAddress: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
    price: "0.16729569",
  },
  {
    name: "BIFI",
    assetAddress: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    price: "391.1780754",
  },
  {
    name: "BNBx",
    assetAddress: "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275",
    price: "277.75194832",
  },
  {
    name: "BSW",
    assetAddress: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    price: "0.10180354",
  },
  {
    name: "WBNB",
    assetAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    price: "261.35543723",
  },
  {
    name: "WIN",
    assetAddress: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    price: "0.00007019",
  },
  {
    name: "WOO",
    assetAddress: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    price: "0.21784583",
  },
  {
    name: "ANKR",
    assetAddress: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
    price: "0.02327742",
  },
  {
    name: "ankrBNB",
    assetAddress: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    price: "272.75724548",
  },
  {
    name: "BTT",
    assetAddress: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    price: "0.00000052",
  },
  {
    name: "FLOKI",
    assetAddress: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    price: "26820",
  },
  {
    name: "HAY",
    assetAddress: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    price: "1.00064968",
  },
  {
    name: "NFT",
    assetAddress: "0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa",
    price: "350000",
  },
  {
    name: "RACA",
    assetAddress: "0x12BB890508c125661E03b09EC06E404bc9289040",
    price: "0.00012172",
  },
  {
    name: "stkBNB",
    assetAddress: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    price: "265.77509576",
  },
  {
    name: "USDD",
    assetAddress: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
    price: "0.99931125",
  },
];

forking(28919155, async () => {
  const provider = ethers.provider;

  testVip("VIP-126 Configure Resilient Oracle for IL Pool Tokens", await vip126(60 * 60 * 24 * 3), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [7]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [vTokens.length]);
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [9]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: Contract;
    let comptroller: Contract;
    let mockVToken: Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);

      await impersonateAccount(DUMMY_SIGNER);
      const factory = new ethers.ContractFactory(
        MOCK_VTOKEN_ABI,
        MOCK_VTOKEN_CODE,
        await ethers.getSigner(DUMMY_SIGNER),
      );
      mockVToken = await factory.deploy();
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        await mockVToken.setUnderlyingAsset(vTokens[i].assetAddress);
        const vToken = vTokens[i];

        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });
});
