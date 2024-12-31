import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060 from "../../multisig/proposals/sepolia/vip-071";
import {
  COMPTROLLERS,
  CONVERTERS,
  CONVERTER_NETWORK,
  PLP,
  PRIME,
  PSR,
  REWARD_DISTRIBUTORS,
  VTOKENS,
  XVS_STORE,
} from "../../multisig/proposals/sepolia/vip-071";
import vip416 from "../../vips/vip-416/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6850243, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;
  const xvsVaultProxy = new ethers.Contract(sepolia.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);

  before(async () => {
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("vip350", await vip416());

  describe("Post-VIP behavior", async () => {
    for (const converter of CONVERTERS) {
      it(`owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(sepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
  });
});
