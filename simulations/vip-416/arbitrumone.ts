import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014 from "../../multisig/proposals/arbitrumone/vip-019";
import {
  COMPTROLLERS,
  CONVERTER_NETWORK,
  PLP,
  PRIME,
  PSR,
  REWARD_DISTRIBUTORS,
  VTOKENS,
  NTGs
} from "../../multisig/proposals/arbitrumone/vip-019";
import vip416 from "../../vips/vip-416/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import VTOKEN_ABI from "./abi/VToken.json";
import NTG_ABI from "./abi/NativeTokenGateway.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(290585586, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;

  before(async () => {
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);

    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip350", await vip416());

  describe("Post-VIP behavior", async () => {
    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, NTG_ABI, provider);
        expect(await ntg.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
  });
});
