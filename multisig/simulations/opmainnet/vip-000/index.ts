import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000, { BOUND_VALIDATOR } from "../../../proposals/opmainnet/vip-000";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";

const { opmainnet } = NETWORK_ADDRESSES;

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  feed: string;
  oracle: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "WBTC",
    address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    price: "599478550000000000000000000000000",
    feed: "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593",
    oracle: "chainlink",
  },
  {
    name: "USDC",
    address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    price: "999839130000000000000000000000",
    feed: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    price: "1000095310000000000000000000000",
    feed: "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E",
    oracle: "chainlink",
  },
  {
    name: "OP",
    address: "0x4200000000000000000000000000000000000042",
    price: "1441500000000000000",
    feed: "0x0D276FC14719f9292D5C1eA2198673d1f4269246",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "2312450000000000000000",
    feed: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    oracle: "chainlink",
  },
  {
    name: "XVS",
    address: opmainnet.XVS,
    price: "6856116990000000000",
    feed: "0x414F8f961969A8131AbE53294600c6C515E68f81",
    oracle: "redstone",
  },
];

forking(125532676, async () => {
  const provider = ethers.provider;
  let treasury: Contract;
  let resilientOracle: Contract;
  let chainLinkOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      treasury = await ethers.getContractAt(TREASURY_ABI, opmainnet.VTREASURY);
      resilientOracle = new ethers.Contract(opmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(opmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(opmainnet.GUARDIAN);
      expect(await chainLinkOracle.pendingOwner()).to.equal(opmainnet.GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(opmainnet.GUARDIAN);
    });

    it("should revert for unconfigured asset price request", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        await expect(resilientOracle.getPrice(assetConfig.address)).to.be.revertedWith(
          "invalid resilient oracle price",
        );
      }
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip000());
    });

    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.opmainnet.GUARDIAN);
    });

    it("correct owner", async () => {
      expect(await resilientOracle.owner()).to.equal(opmainnet.GUARDIAN);
      expect(await chainLinkOracle.owner()).to.equal(opmainnet.GUARDIAN);
      expect(await boundValidator.owner()).to.equal(opmainnet.GUARDIAN);
    });

    it("validate asset prices", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(assetConfig.price);
      }
    });
  });
});
