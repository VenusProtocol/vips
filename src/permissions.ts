import { ethers } from "hardhat";

export enum AccountType {
  NORMAL_TIMELOCK = "NormalTimelock",
  FAST_TRACK_TIMELOCK = "FastTrackTimelock",
  CRITICAL_TIMELOCK = "CriticalTimelock",
  GUARDIAN = "Guardian",
}

const timelocks = [AccountType.NORMAL_TIMELOCK]
  .concat(AccountType.CRITICAL_TIMELOCK)
  .concat(AccountType.FAST_TRACK_TIMELOCK);

const accounts = timelocks.concat(AccountType.GUARDIAN);

export const getResilientOraclePermissions = (resilientOracle: string): string[][] => {
  return [
    ...accounts.map(account => [resilientOracle, "pause()", account]),
    ...accounts.map(account => [resilientOracle, "unpause()", account]),
    ...accounts.map(account => [resilientOracle, "setTokenConfig(TokenConfig)", account]),
    [resilientOracle, "setOracle(address,address,uint8)", AccountType.NORMAL_TIMELOCK],
    [resilientOracle, "enableOracle(address,uint8,bool)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getChainlinkOraclePermissions = (chainlinkOracle: string): string[][] => {
  return [
    ...accounts.map(account => [chainlinkOracle, "setTokenConfig(TokenConfig)", account]),
    ...accounts.map(account => [chainlinkOracle, "setDirectPrice(address,uint256)", account]),
  ];
};

export const getRedstoneOraclePermissions = (redstoneOracle: string): string[][] => {
  return [
    ...accounts.map(account => [redstoneOracle, "setTokenConfig(TokenConfig)", account]),
    ...accounts.map(account => [redstoneOracle, "setDirectPrice(address,uint256)", account]),
  ];
};

export const getBoundValidatorPermissions = (boundValidator: string): string[][] => {
  return [[boundValidator, "setValidateConfig(ValidateConfig)", AccountType.NORMAL_TIMELOCK]];
};

export const getSFrxETHOraclePermissions = (sFrxETHOracle: string): string[][] => {
  return [...timelocks.map(account => [sFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", account])];
};

export const getBinanceOraclePermissions = (binanceOracle: string): string[][] => {
  return [
    ...accounts.map(account => [binanceOracle, "setMaxStalePeriod(string,uint256)", account]),
    ...accounts.map(account => [binanceOracle, "setSymbolOverride(string,string)", account]),
  ];
};

export const getXVSPermissions = (xvs: string): string[][] => {
  return [
    ...accounts.map(account => [xvs, "migrateMinterTokens(address,address)", account]),
    ...accounts.map(account => [xvs, "setMintCap(address,uint256)", account]),
    ...accounts.map(account => [xvs, "updateBlacklist(address,bool)", account]),
    ...accounts.map(account => [xvs, "pause()", account]),
    ...accounts.map(account => [xvs, "unpause()", account]),
  ];
};

export const getXVSBridgeAdminPermissions = (xvsBridgeAdmin: string): string[][] => {
  return [
    ...timelocks.map(account => [xvsBridgeAdmin, "setSendVersion(uint16)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "setReceiveVersion(uint16)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "forceResumeReceive(uint16,bytes)", account]),
    ...accounts.map(account => [xvsBridgeAdmin, "setMaxSingleTransactionLimit(uint16,uint256)", account]),
    [xvsBridgeAdmin, "setOracle(address)", AccountType.NORMAL_TIMELOCK],
    ...accounts.map(account => [xvsBridgeAdmin, "setMaxDailyLimit(uint16,uint256)", account]),
    ...accounts.map(account => [xvsBridgeAdmin, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", account]),
    ...accounts.map(account => [xvsBridgeAdmin, "setMaxDailyReceiveLimit(uint16,uint256)", account]),
    ...accounts.map(account => [xvsBridgeAdmin, "pause()", account]),
    ...accounts.map(account => [xvsBridgeAdmin, "unpause()", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "removeTrustedRemote(uint16)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "dropFailedMessage(uint16,bytes,uint64)", account]),
    [xvsBridgeAdmin, "setPrecrime(address)", AccountType.NORMAL_TIMELOCK],
    ...timelocks.map(account => [xvsBridgeAdmin, "setMinDstGas(uint16,uint16,uint256)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "setPayloadSizeLimit(uint16,uint256)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "setWhitelist(address,bool)", account]),
    ...timelocks.map(account => [xvsBridgeAdmin, "setConfig(uint16,uint16,uint256,bytes)", account]),
    [xvsBridgeAdmin, "sweepToken(address,address,uint256)", AccountType.NORMAL_TIMELOCK],
    ...timelocks.map(account => [xvsBridgeAdmin, "updateSendAndCallEnabled(bool)", account]),
    [xvsBridgeAdmin, "setTrustedRemoteAddress(uint16,bytes)", AccountType.NORMAL_TIMELOCK],
    [xvsBridgeAdmin, "transferBridgeOwnership(address)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getXVSVaultPermissions = (xvsVault: string): string[][] => {
  return [
    [xvsVault, "pause()", AccountType.CRITICAL_TIMELOCK],
    [xvsVault, "resume()", AccountType.CRITICAL_TIMELOCK],
    [xvsVault, "setRewardAmountPerBlockOrSecond(address,uint256)", AccountType.CRITICAL_TIMELOCK],
    [xvsVault, "pause()", AccountType.FAST_TRACK_TIMELOCK],
    [xvsVault, "resume()", AccountType.FAST_TRACK_TIMELOCK],
    [xvsVault, "setRewardAmountPerBlockOrSecond(address,uint256)", AccountType.FAST_TRACK_TIMELOCK],
    [xvsVault, "pause()", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "resume()", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "add(address,uint256,address,uint256,uint256)", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "set(address,uint256,uint256)", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "setRewardAmountPerBlockOrSecond(address,uint256)", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "setWithdrawalLockingPeriod(address,uint256,uint256)", AccountType.NORMAL_TIMELOCK],
    [xvsVault, "pause()", AccountType.GUARDIAN],
    [xvsVault, "resume()", AccountType.GUARDIAN],
  ];
};

export const getPoolRegistryPermissions = (poolRegistry: string): string[][] => {
  return [
    [poolRegistry, "addPool(string,address,uint256,uint256,uint256)", AccountType.NORMAL_TIMELOCK],
    [poolRegistry, "addMarket(AddMarketInput)", AccountType.NORMAL_TIMELOCK],
    [poolRegistry, "setPoolName(address,string)", AccountType.NORMAL_TIMELOCK],
    [poolRegistry, "updatePoolMetadata(address,VenusPoolMetaData)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getPrimePermissions = (prime: string): string[][] => {
  return [
    ...timelocks.map(account => [prime, "updateAlpha(uint128,uint128)", account]),
    ...timelocks.map(account => [prime, "updateMultipliers(address,uint256,uint256)", account]),
    ...timelocks.map(account => [prime, "setStakedAt(address[],uint256[])", account]),
    ...timelocks.map(account => [prime, "addMarket(address,address,uint256,uint256)", account]),
    ...timelocks.map(account => [prime, "setLimit(uint256,uint256)", account]),
    ...timelocks.map(account => [prime, "setMaxLoopsLimit(uint256)", account]),
    ...timelocks.map(account => [prime, "issue(bool,address[])", account]),
    ...timelocks.map(account => [prime, "burn(address)", account]),
    ...accounts.map(account => [prime, "togglePause()", account]),
  ];
};

export const getPrimeLiquidityProviderPermissions = (primeLiquidityProvider: string): string[][] => {
  return [
    ...timelocks.map(account => [primeLiquidityProvider, "setTokensDistributionSpeed(address[],uint256[])", account]),
    ...timelocks.map(account => [
      primeLiquidityProvider,
      "setMaxTokensDistributionSpeed(address[],uint256[])",
      account,
    ]),
    ...timelocks.map(account => [primeLiquidityProvider, "setMaxLoopsLimit(uint256)", account]),
    ...accounts.map(account => [primeLiquidityProvider, "pauseFundsTransfer()", account]),
    ...accounts.map(account => [primeLiquidityProvider, "resumeFundsTransfer()", account]),
  ];
};

export const getProtocolShareReservePermissions = (protocolShareReserve: string): string[][] => {
  return [
    ...accounts.map(account => [protocolShareReserve, "addOrUpdateDistributionConfigs(DistributionConfig[])", account]),
    ...accounts.map(account => [protocolShareReserve, "removeDistributionConfig(Schema,address)", account]),
  ];
};

export const getConverterNetworkPermissions = (converterNetwork: string): string[][] => {
  return [
    ...timelocks.map(account => [converterNetwork, "addTokenConverter(address)", account]),
    ...timelocks.map(account => [converterNetwork, "removeTokenConverter(address)", account]),
  ];
};

export const getComptrollerPermissions = (): string[][] => {
  return [
    ...accounts.map(account => [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", account]),
    ...accounts.map(account => [ethers.constants.AddressZero, "setMarketBorrowCaps(address[],uint256[])", account]),
    ...accounts.map(account => [ethers.constants.AddressZero, "setMarketSupplyCaps(address[],uint256[])", account]),
    ...accounts.map(account => [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", account]),
    ...timelocks.map(account => [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", account]),
    ...accounts.map(account => [ethers.constants.AddressZero, "unlistMarket(address)", account]),
    [ethers.constants.AddressZero, "setCloseFactor(uint256)", AccountType.NORMAL_TIMELOCK],
    [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", AccountType.NORMAL_TIMELOCK],
    [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getVTokenPermissions = (): string[][] => {
  return [
    ...timelocks.map(account => [ethers.constants.AddressZero, "setReserveFactor(uint256)", account]),
    ...timelocks.map(account => [ethers.constants.AddressZero, "setInterestRateModel(address)", account]),
    ...timelocks.map(account => [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", account]),
    [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getRewardDistributorPermissionsTimebased = (): string[][] => {
  return [
    [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", AccountType.NORMAL_TIMELOCK],
    [
      ethers.constants.AddressZero,
      "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
      AccountType.NORMAL_TIMELOCK,
    ],
  ];
};

export const getRewardDistributorPermissionsBlockbased = (): string[][] => {
  return [
    [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", AccountType.NORMAL_TIMELOCK],
    [ethers.constants.AddressZero, "setLastRewardingBlocks(address[],uint32[],uint32[])", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getIRMPermissions = (): string[][] => {
  return [
    [ethers.constants.AddressZero, "updateJumpRateModel(uint256,uint256,uint256,uint256)", AccountType.NORMAL_TIMELOCK],
  ];
};

export const getConverterPermissions = (): string[][] => {
  return [
    ...accounts.map(account => [ethers.constants.AddressZero, "pauseConversion()", account]),
    ...accounts.map(account => [ethers.constants.AddressZero, "resumeConversion()", account]),
    ...timelocks.map(account => [ethers.constants.AddressZero, "setMinAmountToConvert(uint256)", account]),
    ...timelocks.map(account => [
      ethers.constants.AddressZero,
      "setConversionConfig(address,address,ConversionConfig)",
      account,
    ]),
  ];
};

export const getXVSVaultTreasuryPermissions = (xvsVaultTreasury: string): string[][] => {
  return [...timelocks.map(account => [xvsVaultTreasury, "fundXVSVault(uint256)", account])];
};

export const getOmniChainExecutorOwnerPermissions = (omniChainExecutor: string): string[][] => {
  return [
    [omniChainExecutor, "setSendVersion(uint16)", AccountType.NORMAL_TIMELOCK],
    ...accounts.map(account => [omniChainExecutor, "setReceiveVersion(uint16)", account]),
    [omniChainExecutor, "forceResumeReceive(uint16,bytes)", AccountType.GUARDIAN],
    ...accounts.map(account => [omniChainExecutor, "setMaxDailyReceiveLimit(uint256)", account]),
    ...accounts.map(account => [omniChainExecutor, "pause()", account]),
    [omniChainExecutor, "unpause()", AccountType.GUARDIAN],
    ...accounts.map(account => [omniChainExecutor, "addTimelocks(address[])", account]),
    ...accounts.map(account => [omniChainExecutor, "setConfig(uint16,uint16,uint256,bytes)", account]),
    [omniChainExecutor, "setTrustedRemoteAddress(uint16,bytes)", AccountType.GUARDIAN],
    [omniChainExecutor, "setTrustedRemoteAddress(uint16,bytes)", AccountType.NORMAL_TIMELOCK],
    [omniChainExecutor, "setTimelockPendingAdmin(address,uint8)", AccountType.GUARDIAN],
    [omniChainExecutor, "setTimelockPendingAdmin(address,uint8)", AccountType.NORMAL_TIMELOCK],
    ...accounts.map(account => [omniChainExecutor, "retryMessage(uint16,bytes,uint64,bytes)", account]),
    [omniChainExecutor, "setGuardian(address)", AccountType.NORMAL_TIMELOCK],
    [omniChainExecutor, "setSrcChainId(uint16)", AccountType.GUARDIAN],
    [omniChainExecutor, "setSrcChainId(uint16)", AccountType.NORMAL_TIMELOCK],
    [omniChainExecutor, "transferBridgeOwnership(address)", AccountType.GUARDIAN],
    [omniChainExecutor, "transferBridgeOwnership(address)", AccountType.NORMAL_TIMELOCK],
  ];
};
