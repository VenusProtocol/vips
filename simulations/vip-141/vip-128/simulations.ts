import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import SD_ABI from "./abi/IERC20UpgradableAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import { vip141 } from "../../../vips/vip-141/vip-141";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const SD = "0x3bc5ac0dfdc871b365d159f728dd1b9a0b5481e8";

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

forking(29131121, () => {
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
    const factory = new ethers.ContractFactory(
      MOCK_VTOKEN_ABI,
      MOCK_VTOKEN_CODE,
      await ethers.getSigner(DUMMY_SIGNER),
    );
    mockVToken = await factory.deploy();
  });

  testVip("VIP-128 Add SD Price Feed", vip141(24 * 60 * 60 * 3), {
    callbackAfterExecution: async txResponse => {},
  });

  describe("Post-VIP behavior", async () => {
    it("get correct price from oracle ", async () => {
      await mockVToken.setUnderlyingAsset(SD);
      const price = await oracle.getUnderlyingPrice(mockVToken.address);
      expect(price).to.equal(parseUnits("1676.320518890000000000", 18));
    });
  })
  
});
