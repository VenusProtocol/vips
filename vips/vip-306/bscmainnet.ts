import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER_ADDRESS = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const CORE_UNI_ADDRESS = "0x27FF564707786720C71A2e5c1490A63266683612";
export const CORE_UNI_SUPPLY_CAP = parseUnits("600000", 18);
export const CORE_TUSD_ADDRESS = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const CORE_TUSD_SUPPLY_CAP = parseUnits("750000", 18);
export const CORE_TUSD_BORROW_CAP = parseUnits("600000", 18);

export const STABLE_COMPTROLLER_ADDRESS = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
export const STABLE_USDD_ADDRESS = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";
export const STABLE_USDD_SUPPLY_CAP = parseUnits("100000", 18);
export const STABLE_USDD_BORROW_CAP = parseUnits("90000", 18);
export const STABLE_lisUSD_ADDRESS = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
export const STABLE_lisUSD_SUPPLY_CAP = parseUnits("200000", 18);
export const STABLE_lisUSD_BORROW_CAP = parseUnits("100000", 18);
export const STABLE_USDT_ADDRESS = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
export const STABLE_USDT_SUPPLY_CAP = parseUnits("500000", 18);
export const STABLE_USDT_BORROW_CAP = parseUnits("400000", 18);

export const TRON_COMPTROLLER_ADDRESS = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
export const TRON_USDD_ADDRESS = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";
export const TRON_USDD_SUPPLY_CAP = parseUnits("500000", 18);
export const TRON_USDD_BORROW_CAP = parseUnits("400000", 18);
export const TRON_USDT_ADDRESS = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";
export const TRON_USDT_SUPPLY_CAP = parseUnits("500000", 18);
export const TRON_USDT_BORROW_CAP = parseUnits("400000", 18);
export const TRON_BTT_ADDRESS = "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee";
export const TRON_BTT_SUPPLY_CAP = parseUnits("100000000000", 18);
export const TRON_BTT_BORROW_CAP = parseUnits("50000000000", 18);
export const TRON_TRX_ADDRESS = "0x836beb2cB723C498136e1119248436A645845F4E";
export const TRON_TRX_SUPPLY_CAP = parseUnits("2000000", 6);
export const TRON_TRX_BORROW_CAP = parseUnits("1000000", 6);
export const TRON_WIN_ADDRESS = "0xb114cfA615c828D88021a41bFc524B800E64a9D5";
export const TRON_WIN_SUPPLY_CAP = parseUnits("500000000", 18);
export const TRON_WIN_BORROW_CAP = parseUnits("250000000", 18);

export const GAMEFI_COMPTROLLER_ADDRESS = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const GAMEFI_USDT_ADDRESS = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const GAMEFI_USDT_SUPPLY_CAP = parseUnits("4000000", 18);
export const GAMEFI_USDT_BORROW_CAP = parseUnits("3800000", 18);
export const GAMEFI_USDD_ADDRESS = "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C";
export const GAMEFI_USDD_SUPPLY_CAP = parseUnits("100000", 18);
export const GAMEFI_USDD_BORROW_CAP = parseUnits("90000", 18);
export const GAMEFI_RACA_ADDRESS = "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465";
export const GAMEFI_RACA_SUPPLY_CAP = parseUnits("1000000000", 18);
export const GAMEFI_RACA_BORROW_CAP = parseUnits("500000000", 18);
export const GAMEFI_FLOKI_ADDRESS = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const GAMEFI_FLOKI_BORROW_CAP = parseUnits("2000000000", 9);

export const DEFI_COMPTROLLER_ADDRESS = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const DEFI_ankrBNB_ADDRESS = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
export const DEFI_ankrBNB_SUPPLY_CAP = parseUnits("500", 18);
export const DEFI_ankrBNB_BORROW_CAP = parseUnits("250", 18);
export const DEFI_USDD_ADDRESS = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";
export const DEFI_USDD_SUPPLY_CAP = parseUnits("100000", 18);
export const DEFI_USDD_BORROW_CAP = parseUnits("90000", 18);
export const DEFI_BSW_ADDRESS = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
export const DEFI_BSW_SUPPLY_CAP = parseUnits("3000000", 18);
export const DEFI_BSW_BORROW_CAP = parseUnits("1500000", 18);
export const DEFI_TWT_ADDRESS = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";
export const DEFI_TWT_BORROW_CAP = parseUnits("100000", 18);
export const DEFI_ALPACA_ADDRESS = "0x02c5Fb0F26761093D297165e902e96D08576D344";
export const DEFI_ALPACA_BORROW_CAP = parseUnits("100000", 18);
export const DEFI_PLANET_ADDRESS = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
export const DEFI_PLANET_SUPPLY_CAP = parseUnits("2000000000", 18);
export const DEFI_PLANET_BORROW_CAP = parseUnits("750000000", 18);
export const DEFI_ANKR_ADDRESS = "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362";
export const DEFI_ANKR_SUPPLY_CAP = parseUnits("2000000", 18);
export const DEFI_ANKR_BORROW_CAP = parseUnits("1000000", 18);

export const ETH_DAI_ADDRESS = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const ETH_FRAX_ADDRESS = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const ETH_crvUSD_ADDRESS = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const ETH_CRV_ADDRESS = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
export const ETH_weETH_ADDRESS = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const ETH_wstETH_ADDRESS = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";

const vip306 = () => {
  const meta = {
    version: "v2",
    title: "VIP-306 Risk Parameters Adjustments",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 05/14/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-05-14-24/4329).

### BNB Chain

**Cap Increases:**

- [USDT (GameFi)](https://bscscan.com/address/${GAMEFI_USDT_ADDRESS}) 
  - Increase supply cap from 3M to 4M
  - Increase borrow cap from 2.8M to 3,8M
- [UNI (Core)](https://bscscan.com/address/${CORE_UNI_ADDRESS})
  - Increase supply cap from 500K to 600K

**Cap Decreases:**
- [TUSD (Core)](https://bscscan.com/address/${CORE_TUSD_ADDRESS})
  - Decrease supply cap from 1.5M to 750K
  - Decrease borrow cap from 1.2M to 600K
- [ankrBNB (DeFi)](https://bscscan.com/address/${DEFI_ankrBNB_ADDRESS})
  - Decrease supply cap from 10K to 500
  - Decrease borrow cap from 4K to 250
- [USDD (DeFi)](https://bscscan.com/address/${DEFI_USDD_ADDRESS})
  - Decrease supply cap from 450K to 100K
  - Decrease borrow cap from 300K to 90K
- [BSW (DeFi)](https://bscscan.com/address/${DEFI_BSW_ADDRESS})
  - Decrease supply cap from 11.6M to 3M
  - Decrease borrow cap from 5.8M to 1.5M
- [TWT (DeFi)](https://bscscan.com/address/${DEFI_TWT_ADDRESS})
  - Decrease borrow cap from 500K to 100K
- [ALPACA (DeFi)](https://bscscan.com/address/${DEFI_ALPACA_ADDRESS})
  - Decrease borrow cap from 750K to 100K
- [PLANET (DeFi)](https://bscscan.com/address/${DEFI_PLANET_ADDRESS})
  - Decrease supply cap from 4B to 2B
  - Decrease borrow cap from 1.5B to 750M
- [ANKR (DeFi)](https://bscscan.com/address/${DEFI_ANKR_ADDRESS})
  - Decrease supply cap from 17.7M to 2M
  - Decrease borrow cap from 8.85M to 1M
- [USDD (GameFi)](https://bscscan.com/address/${GAMEFI_USDD_ADDRESS})
  - Decrease supply cap from 450K to 100K
  - Decrease borrow cap from 300K to 90K
- [RACA (GameFi)](https://bscscan.com/address/${GAMEFI_RACA_ADDRESS})
  - Decrease supply cap from 4.2B to 1B
  - Decrease borrow cap from 2.1B to 500M
- [FLOKI (GameFi)](https://bscscan.com/address/${GAMEFI_FLOKI_ADDRESS})
  - Decrease borrow cap from 22B to 2B
- [USDD (Stablecoins)](https://bscscan.com/address/${STABLE_USDD_ADDRESS})
  - Decrease supply cap from 240K to 100K
  - Decrease borrow cap from 160K to 90K
- [lisUSD (Stablecoins)](https://bscscan.com/address/${STABLE_lisUSD_ADDRESS})
  - Decrease supply cap from 1M to 200K
  - Decrease borrow cap from 250K to 100K
- [USDT (Stablecoins)](https://bscscan.com/address/${STABLE_USDT_ADDRESS})
  - Decrease supply cap from 960K to 500K
  - Decrease borrow cap from 640K to 400K
- [USDD (Tron)](https://bscscan.com/address/${TRON_USDD_ADDRESS})
  - Decrease supply cap from 2.7M to 500K
  - Decrease borrow cap from 1.8M to 400K
- [USDT (Tron)](https://bscscan.com/address/${TRON_USDT_ADDRESS})
  - Decrease supply cap from 1.38M to 500K
  - Decrease borrow cap from 920K to 400K
- [BTT (Tron)](https://bscscan.com/address/${TRON_BTT_ADDRESS})
  - Decrease supply cap from 1.13T to 100B
  - Decrease borrow cap from 565B to 50B
- [TRX (Tron)](https://bscscan.com/address/${TRON_TRX_ADDRESS})
  - Decrease supply cap from 6.3M to 2M
  - Decrease borrow cap from 3.15M to 1M
- [WIN (Tron)](https://bscscan.com/address/${TRON_WIN_ADDRESS})
  - Decrease supply cap from 2.3B to 500M
  - Decrease borrow cap from 1.15B to 250M

### Ethereum

- [DAI (Core)](https://etherscan.io/address/${ETH_DAI_ADDRESS})
  - Decrease supply cap from 50M to 5M
  - Decrease borrow cap from 45M to 4.5M
- [FRAX (Core)](https://etherscan.io/address/${ETH_FRAX_ADDRESS})
  - Decrease supply cap from 10M to 2M
  - Decrease borrow cap from 8M to 1.6M
- [crvUSD (Core)](https://etherscan.io/address/${ETH_crvUSD_ADDRESS})
  - Decrease supply cap from 50M to 10M
  - Decrease borrow cap from 45M to 9M
- [CRV (Core)](https://etherscan.io/address/${ETH_CRV_ADDRESS})
  - Decrease supply cap from 6M  to 3M
  - Decrease borrow cap from 3M  to 1.5M
- [weETH (Liquid Staking)](https://etherscan.com/address/${ETH_weETH_ADDRESS})
  - Increase supply cap from 7.5K to 15K
  - Increase borrow cap from 1.5K to 7.5K
- [wstETH (Liquid Staking)](https://etherscan.com/address/${ETH_wstETH_ADDRESS})
  - Increase borrow cap from 2K to 4K

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/289](https://github.com/VenusProtocol/vips/pull/289)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x24083080b9bcac982011a3d23fdf3f8e6b70b2be72b48f54ef78d6d8d02c2249) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: GAMEFI_COMPTROLLER_ADDRESS,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [GAMEFI_USDT_ADDRESS, GAMEFI_USDD_ADDRESS, GAMEFI_RACA_ADDRESS],
          [GAMEFI_USDT_SUPPLY_CAP, GAMEFI_USDD_SUPPLY_CAP, GAMEFI_RACA_SUPPLY_CAP],
        ],
      },
      {
        target: GAMEFI_COMPTROLLER_ADDRESS,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [GAMEFI_USDT_ADDRESS, GAMEFI_USDD_ADDRESS, GAMEFI_RACA_ADDRESS, GAMEFI_FLOKI_ADDRESS],
          [GAMEFI_USDT_BORROW_CAP, GAMEFI_USDD_BORROW_CAP, GAMEFI_RACA_BORROW_CAP, GAMEFI_FLOKI_BORROW_CAP],
        ],
      },
      {
        target: STABLE_COMPTROLLER_ADDRESS,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [STABLE_USDD_ADDRESS, STABLE_lisUSD_ADDRESS, STABLE_USDT_ADDRESS],
          [STABLE_USDD_SUPPLY_CAP, STABLE_lisUSD_SUPPLY_CAP, STABLE_USDT_SUPPLY_CAP],
        ],
      },
      {
        target: STABLE_COMPTROLLER_ADDRESS,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [STABLE_USDD_ADDRESS, STABLE_lisUSD_ADDRESS, STABLE_USDT_ADDRESS],
          [STABLE_USDD_BORROW_CAP, STABLE_lisUSD_BORROW_CAP, STABLE_USDT_BORROW_CAP],
        ],
      },
      {
        target: TRON_COMPTROLLER_ADDRESS,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [TRON_USDD_ADDRESS, TRON_USDT_ADDRESS, TRON_BTT_ADDRESS, TRON_TRX_ADDRESS, TRON_WIN_ADDRESS],
          [TRON_USDD_SUPPLY_CAP, TRON_USDT_SUPPLY_CAP, TRON_BTT_SUPPLY_CAP, TRON_TRX_SUPPLY_CAP, TRON_WIN_SUPPLY_CAP],
        ],
      },
      {
        target: TRON_COMPTROLLER_ADDRESS,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [TRON_USDD_ADDRESS, TRON_USDT_ADDRESS, TRON_BTT_ADDRESS, TRON_TRX_ADDRESS, TRON_WIN_ADDRESS],
          [TRON_USDD_BORROW_CAP, TRON_USDT_BORROW_CAP, TRON_BTT_BORROW_CAP, TRON_TRX_BORROW_CAP, TRON_WIN_BORROW_CAP],
        ],
      },
      {
        target: DEFI_COMPTROLLER_ADDRESS,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [DEFI_ankrBNB_ADDRESS, DEFI_USDD_ADDRESS, DEFI_BSW_ADDRESS, DEFI_PLANET_ADDRESS, DEFI_ANKR_ADDRESS],
          [
            DEFI_ankrBNB_SUPPLY_CAP,
            DEFI_USDD_SUPPLY_CAP,
            DEFI_BSW_SUPPLY_CAP,
            DEFI_PLANET_SUPPLY_CAP,
            DEFI_ANKR_SUPPLY_CAP,
          ],
        ],
      },
      {
        target: DEFI_COMPTROLLER_ADDRESS,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [
            DEFI_ankrBNB_ADDRESS,
            DEFI_USDD_ADDRESS,
            DEFI_BSW_ADDRESS,
            DEFI_TWT_ADDRESS,
            DEFI_PLANET_ADDRESS,
            DEFI_ANKR_ADDRESS,
            DEFI_ALPACA_ADDRESS,
          ],
          [
            DEFI_ankrBNB_BORROW_CAP,
            DEFI_USDD_BORROW_CAP,
            DEFI_BSW_BORROW_CAP,
            DEFI_TWT_BORROW_CAP,
            DEFI_PLANET_BORROW_CAP,
            DEFI_ANKR_BORROW_CAP,
            DEFI_ALPACA_BORROW_CAP,
          ],
        ],
      },
      {
        target: CORE_COMPTROLLER_ADDRESS,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [CORE_UNI_ADDRESS, CORE_TUSD_ADDRESS],
          [CORE_UNI_SUPPLY_CAP, CORE_TUSD_SUPPLY_CAP],
        ],
      },
      {
        target: CORE_COMPTROLLER_ADDRESS,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[CORE_TUSD_ADDRESS], [CORE_TUSD_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip306;
