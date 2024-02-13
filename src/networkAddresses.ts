import gov_bscmainnet_contracts from "@venusprotocol/governance-contracts/deployments/bscmainnet.json";
import gov_bsctestnet_contracts from "@venusprotocol/governance-contracts/deployments/bsctestnet.json";
import il_bscmainnet_deployed_contracts from "@venusprotocol/isolated-pools/deployments/bscmainnet_addresses.json";
import il_bsctestnet_deployed_contracts from "@venusprotocol/isolated-pools/deployments/bsctestnet_addresses.json";
import il_ethereum_deployed_contracts from "@venusprotocol/isolated-pools/deployments/ethereum_addresses.json";
import il_sepolia_deployed_contracts from "@venusprotocol/isolated-pools/deployments/sepolia_addresses.json";
import oracle_bscmainnet_contracts from "@venusprotocol/oracle/deployments/bscmainnet.json";
import oracle_bsctestnet_contracts from "@venusprotocol/oracle/deployments/bsctestnet.json";
import oracle_ethereum_contracts from "@venusprotocol/oracle/deployments/ethereum.json";
import oracle_sepolia_contracts from "@venusprotocol/oracle/deployments/sepolia.json";
import token_bridge_ethereum_contracts from "@venusprotocol/token-bridge/deployments/ethereum.json";
import token_bridge_opbnbmainnet_contracts from "@venusprotocol/token-bridge/deployments/opbnbmainnet.json";
import token_bridge_opbnbtestnet_contracts from "@venusprotocol/token-bridge/deployments/opbnbtestnet.json";
import token_bridge_sepolia_contracts from "@venusprotocol/token-bridge/deployments/sepolia.json";
import bscmainnet_deployed_contracts from "@venusprotocol/venus-protocol/deployments/bscmainnet.json";
import bsctestnet_deployed_contracts from "@venusprotocol/venus-protocol/deployments/bsctestnet.json";
import ethereum_deployed_contracts from "@venusprotocol/venus-protocol/deployments/ethereum.json";
import opbnbmainnet_deployed_contracts from "@venusprotocol/venus-protocol/deployments/opbnbmainnet.json";
import opbnbtestnet_deployed_contracts from "@venusprotocol/venus-protocol/deployments/opbnbtestnet.json";
import sepolia_deployed_contracts from "@venusprotocol/venus-protocol/deployments/sepolia.json";
import { ethers } from "ethers";

export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const NETWORK_ADDRESSES = {
  bscmainnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x97a32D4506F6A35De68e0680859cDF41D077a9a9",
    GOVERNOR_PROXY: gov_bscmainnet_contracts.contracts.GovernorBravoDelegator.address,
    NORMAL_TIMELOCK: gov_bscmainnet_contracts.contracts.NormalTimelock.address,
    ETH_CHAINLINK_FEED: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    USDT_CHAINLINK_FEED: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    CHAINLINK_ORACLE: oracle_bscmainnet_contracts.contracts.ChainlinkOracle.address,
    COMPTROLLER_LENS: bscmainnet_deployed_contracts.contracts.ComptrollerLens.address,
    GENERIC_TEST_USER_ACCOUNT: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    XVS_VAULT_PROXY: bscmainnet_deployed_contracts.contracts.XVSVaultProxy.address,
    XVS: bscmainnet_deployed_contracts.contracts.XVS.address,
    VAI_UNITROLLER: bscmainnet_deployed_contracts.contracts.VaiUnitroller.address,
    VAI_MINT_USER_ACCOUNT: "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc",
    UNITROLLER: bscmainnet_deployed_contracts.contracts.Unitroller.address,
    VAI: bscmainnet_deployed_contracts.contracts.VAI.address,
    VTREASURY: bscmainnet_deployed_contracts.contracts.VTreasury.address,
    POOL_REGISTRY: il_bscmainnet_deployed_contracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracle_bscmainnet_contracts.contracts.BinanceOracle.address,
    RESILIENT_ORACLE: oracle_bscmainnet_contracts.contracts.ResilientOracle.address,
  },
  bsctestnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GOVERNOR_PROXY: gov_bsctestnet_contracts.contracts.GovernorBravoDelegator.address,
    NORMAL_TIMELOCK: gov_bsctestnet_contracts.contracts.NormalTimelock.address,
    ETH_CHAINLINK_FEED: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
    USDT_CHAINLINK_FEED: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
    CHAINLINK_ORACLE: oracle_bsctestnet_contracts.contracts.ChainlinkOracle.address,
    COMPTROLLER_LENS: bsctestnet_deployed_contracts.contracts.ComptrollerLens.address,
    GENERIC_TEST_USER_ACCOUNT: "0x80dd0cB9c1EB88356bA5dd39161E391ACcF3FbCa",
    XVS_VAULT_PROXY: bsctestnet_deployed_contracts.contracts.XVSVaultProxy.address,
    XVS: bsctestnet_deployed_contracts.contracts.XVS.address,
    VAI_UNITROLLER: bsctestnet_deployed_contracts.contracts.VaiUnitroller.address,
    VAI_MINT_USER_ACCOUNT: "0x6eACe20E1F89D0B24e5B295Af1802dfBc730B37D",
    UNITROLLER: bsctestnet_deployed_contracts.contracts.Unitroller.address,
    VAI: bsctestnet_deployed_contracts.contracts.VAI.address,
    VTREASURY: bsctestnet_deployed_contracts.contracts.VTreasury.address,
    POOL_REGISTRY: il_bsctestnet_deployed_contracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracle_bsctestnet_contracts.contracts.BinanceOracle.address,
    RESILIENT_ORACLE: oracle_bsctestnet_contracts.contracts.ResilientOracle.address,
  },
  ethereum: {
    NORMAL_TIMELOCK: "0x285960C5B22fD66A736C7136967A3eB15e93CC67", // Ethereum Multisig
    GUARDIAN: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    VTREASURY: ethereum_deployed_contracts.contracts.VTreasuryV8.address,
    POOL_REGISTRY: il_ethereum_deployed_contracts.addresses.PoolRegistry,
    RESILIENT_ORACLE: oracle_ethereum_contracts.contracts.ResilientOracle.address,
    XVS: token_bridge_ethereum_contracts.contracts.XVS.address,
    XVS_VAULT_PROXY: ethereum_deployed_contracts.contracts.XVSVaultProxy.address,
    GENERIC_TEST_USER_ACCOUNT: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  },
  sepolia: {
    NORMAL_TIMELOCK: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB", // Sepolia Multisig
    GUARDIAN: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB",
    CHAINLINK_ORACLE: oracle_sepolia_contracts.contracts.ChainlinkOracle.address,
    RESILIENT_ORACLE: oracle_sepolia_contracts.contracts.ResilientOracle.address,
    XVS: token_bridge_sepolia_contracts.contracts.XVS.address,
    POOL_REGISTRY: il_sepolia_deployed_contracts.addresses.PoolRegistry,
    VTREASURY: sepolia_deployed_contracts.contracts.VTreasuryV8.address,
    XVS_VAULT_PROXY: sepolia_deployed_contracts.contracts.XVSVaultProxy.address,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
  },
  opbnbtestnet: {
    NORMAL_TIMELOCK: "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf",
    GUARDIAN: "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf",
    XVS: token_bridge_opbnbtestnet_contracts.contracts.XVS.address,
    XVS_VAULT_PROXY: opbnbtestnet_deployed_contracts.contracts.XVSVaultProxy.address,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
  },
  opbnbmainnet: {
    NORMAL_TIMELOCK: "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207",
    GUARDIAN: "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207",
    XVS: token_bridge_opbnbmainnet_contracts.contracts.XVS.address,
    XVS_VAULT_PROXY: opbnbmainnet_deployed_contracts.contracts.XVSVaultProxy.address,
    GENERIC_TEST_USER_ACCOUNT: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  },
};
