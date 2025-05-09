
import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { setAuthority, AuthorityType } from '@solana/spl-token';
import { X } from 'lucide-react';

const RevokeModal = ({
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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRevokeOwnership = async () => {
    if (!account || !tokenAddress) {
      setNotification({ message: 'Wallet or token address missing', color: '#FF4444' });
      return;
    }

    try {
      setLoading(true);
      setIsWalletModalOpen(true);
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const mint = new PublicKey(tokenAddress);
      const owner = new PublicKey(account);

      const revokeIx = setAuthority(
        mint,
        owner,
        null,
        AuthorityType.MintTokens,
        owner,
        []
      );

      const tx = new Transaction().add(revokeIx);
      tx.feePayer = owner;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await window.solana.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);

      setNotification({ message: 'Mint authority revoked', color: '#00C851' });
      handleUpdateTokenInfo();
      setTokenAddress(tokenAddress);
    } catch (err) {
      console.error('Revoke error:', err);
      setNotification({ message: 'Revoke failed', color: '#FF4444' });
    } finally {
      setIsWalletModalOpen(false);
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[99]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-black rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-white hover:text-gray-300">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Revoke Authority</h2>
        <p className="text-gray-400 mb-6">
          This will remove your minting authority for token {tokenSymbol}.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-[#543926] text-white hover:bg-[#111]"
          >
            Cancel
          </button>
          <button
            onClick={handleRevokeOwnership}
            className="px-6 py-2 rounded-full bg-[#543926] hover:bg-[#5d3a22] text-white"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Revoke'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeModal;
