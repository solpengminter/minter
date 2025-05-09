import React, { useState, useEffect, forwardRef } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount } from '@solana/spl-token';

const EXAMPLE_ADDRESS = 'So11111111111111111111111111111111111111112'; // Example SPL token (SOL wrapped)

const AddressInput = forwardRef(({
  addressInputRef,
  tokenAddress,
  setTokenAddress,
  tokenSymbol,
  setTokenSymbol,
  owner,
  setOwner,
  totalSupply,
  setTotalSupply,
  balance,
  setBalance,
  showAddressHistory,
  setShowAddressHistory,
  addressHistory,
  handleAddressSelect,
  onAddressSubmit,
  onRemoveAddress,
  setTokenName,
}, ref) => {
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  useEffect(() => {
    if (tokenAddress && tokenAddress.length >= 32) {
      fetchTokenData();
    } else {
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  }, [tokenAddress]);

  const fetchTokenData = async () => {
    try {
      const mintPubkey = new PublicKey(tokenAddress);
      const mintInfo = await getMint(connection, mintPubkey);
      setTotalSupply(Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals));
      setTokenSymbol(`Decimals: ${mintInfo.decimals}`);
      setTokenName('SPL Token');
      setOwner(mintInfo.mintAuthority?.toBase58() || 'Unknown');

      if (window.solana && window.solana.isPhantom) {
        const resp = await window.solana.connect();
        const userPublicKey = resp.publicKey;

        const tokenAccounts = await connection.getTokenAccountsByOwner(userPublicKey, {
          mint: mintPubkey
        });

        if (tokenAccounts.value.length > 0) {
          const acc = await getAccount(connection, tokenAccounts.value[0].pubkey);
          setBalance(Number(acc.amount) / Math.pow(10, mintInfo.decimals));
        } else {
          setBalance(0);
        }
      }
    } catch (error) {
      console.error('Ошибка при получении данных токена:', error);
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tokenAddress.trim()) {
      handleAddressSubmit(tokenAddress);
      setShowAddressHistory(false);
    }
  };

  const handleHistoryClick = (address) => {
    setTokenAddress(address);
    handleAddressSubmit(address);
    setShowAddressHistory(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (tokenAddress.trim()) {
        handleAddressSubmit(tokenAddress);
      }
      setShowAddressHistory(false);
    }, 200);
  };

  const handleAddressSubmit = (address) => {
    if (!address.trim()) return;
    onAddressSubmit(address);
  };

  const handleChangeAddress = (e) => {
    if (e.target.value === '') {
      setTokenAddress('');
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    } else {
      setTokenAddress(e.target.value);
    }
  };

  return (
    <div className="relative mb-5.5" ref={addressInputRef}>
      <Search style={{ top: '23px' }} className="absolute left-4 transform -translate-y-1/2 text-gray-400" size={19} />
      <input
        type="text"
        placeholder="SPL Token Address"
        value={tokenAddress}
        onChange={handleChangeAddress}
        onClick={() => setShowAddressHistory(true)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => setShowAddressHistory(true)}
        className="w-full bg-[#1A1A1A] border border-[#333] rounded-full py-2.75 pl-11 pr-4 text-white placeholder-gray-400 text-[0.925rem]"
      />
      <p className="text-[0.725rem] text-gray-400 mt-1.75 ml-4">
        Enter an SPL token address.{' '}
        <button onClick={() => setTokenAddress(EXAMPLE_ADDRESS)} className="font-bold hover:text-white">
          Use example
        </button>
      </p>

      {showAddressHistory && addressHistory.length > 0 && (
        <div className="absolute w-full bg-[#1A1A1A] border border-[#333] rounded-2xl top-[calc(100%-15px)] z-[999] overflow-hidden">
          {addressHistory.map((address, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2.5 cursor-pointer text-white text-[0.925rem] transition-colors hover:bg-[#333]"
              onClick={() => handleHistoryClick(address)}
            >
              <RotateCcw size={16} className="mr-2" />
              <span className="truncate">{address}</span>
              <button 
                className="ml-auto text-white hover:text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAddress(address);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AddressInput;
