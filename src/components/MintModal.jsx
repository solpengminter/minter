
import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createMintToInstruction } from '@solana/spl-token';
import { X } from 'lucide-react';

const MintModal = ({
  isOpen,
  onClose,
  tokenSymbol = 'SPL',
  account,
  tokenAddress,
  setNotification,
  setIsWalletModalOpen,
  setTokenAddress,
  handleUpdateTokenInfo
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleMint = async () => {
    if (!account || !tokenAddress || Number(amount) <= 0) {
      setNotification({ message: 'Invalid input or wallet not connected', color: '#FF4444' });
      return;
    }

    try {
      setLoading(true);
      setIsWalletModalOpen(true);
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const mint = new PublicKey(tokenAddress);
      const owner = new PublicKey(account);
      const ata = await getAssociatedTokenAddress(mint, owner);

      const ix = createMintToInstruction(mint, ata, owner, Number(amount) * 10 ** 9);
      const tx = new Transaction().add(ix);

      tx.feePayer = owner;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await window.solana.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);

      setNotification({ message: `${amount} ${tokenSymbol} minted successfully!`, color: '#00C851' });
      handleUpdateTokenInfo();
      setTokenAddress(tokenAddress);
    } catch (err) {
      console.error('Mint error:', err);
      setNotification({ message: 'Minting failed!', color: '#FF4444' });
    } finally {
      setIsWalletModalOpen(false);
      setLoading(false);
      onClose();
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[99]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-black rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Mint {tokenSymbol}</h2>
        <input
          type="text"
          placeholder={`Enter amount`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-full py-2.5 px-4 text-white mb-6"
        />
        <button onClick={handleMint} disabled={loading} className="w-full bg-[#543926] text-white py-2 rounded-full">
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default MintModal;
