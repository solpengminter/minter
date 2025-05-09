
import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createBurnInstruction
} from '@solana/spl-token';
import { X } from 'lucide-react';

const BurnModal = ({
  isOpen,
  onClose,
  tokenSymbol = 'SPL',
  account,
  tokenAddress,
  setIsWalletModalOpen,
  setNotification,
  setTokenAddress,
  handleUpdateTokenInfo
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBurn = async () => {
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

      const ix = createBurnInstruction(ata, mint, owner, Number(amount) * 10 ** 9);
      const tx = new Transaction().add(ix);

      tx.feePayer = owner;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await window.solana.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);

      setNotification({ message: `${amount} ${tokenSymbol} burned successfully!`, color: '#00C851' });
      handleUpdateTokenInfo();
      setTokenAddress(tokenAddress);
    } catch (err) {
      console.error('Burn error:', err);
      setNotification({ message: 'Burning failed!', color: '#FF4444' });
    } finally {
      setIsWalletModalOpen(false);
      setLoading(false);
      onClose();
      setAmount('');
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setAmount(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[99]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-black rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Burn {tokenSymbol}</h2>
        <input
          type="text"
          placeholder={`Enter amount`}
          value={amount}
          onChange={handleAmountChange}
          className="w-full bg-[#111] border border-[#333] rounded-full py-2.5 px-4 text-white mb-6"
        />
        <button onClick={handleBurn} disabled={loading} className="w-full bg-[#543926] text-white py-2 rounded-full">
          {loading ? 'Processing...' : 'Burn'}
        </button>
      </div>
    </div>
  );
};

export default BurnModal;
