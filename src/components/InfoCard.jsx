
import React, { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';

const InfoCard = ({ onOpenModal, onOpenHelpModal, owner }) => {
  const [score, setScore] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectPhantom = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const { publicKey } = await window.solana.connect({ onlyIfTrusted: true });
          setAccount(publicKey.toString());
        } catch (err) {
          console.warn("Phantom not connected:", err.message);
        }
      }
    };
    connectPhantom();
  }, []);

  useEffect(() => {
    if (!account) return;

    console.log("Wallet Address:", account);

    const fetchScore = async () => {
      try {
        const response = await fetch('/api/check_wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wallet_address: account.toLowerCase() }),
        });

        const data = await response.json();
        console.log(data);
        if (data.score !== undefined) {
          setScore(data.score);
        }
      } catch (error) {
        console.error('Ошибка при запросе:', error);
      }
    };

    fetchScore();
  }, [account]);

  return (
    <div className="glass-card rounded-3xl p-6 relative bg-gradient-to-b from-[#1A1A1A] to-black">
      <h2 className="text-[1.35rem] font-semibold mb-4">This is an open source tool</h2>
      <div className="h-[1px] w-full bg-gradient-to-r from-white to-transparent mb-5"></div>
      <p className="text-[#999] mb-6 text-[0.925rem] leading-relaxed">
        SPL Token is the fungible token standard for Solana Blockchain. This free educational tool allows you to deploy your own token to mainnet in one click. You will need at least 0.01 SOL for deployment fees.
      </p>
      <p className="text-[#999] mb-6 text-[0.925rem] leading-relaxed">
        For each coin created you get <span className="text-white font-medium">100 $SOL</span> points, as well as for each created 10 coins you get <span className="text-white font-medium">10,000 $SOL</span> points, in the future these points will be converted into tokens and all active users will receive airdrop, below you can see your statistics:
      </p>
      <button 
        onClick={onOpenModal}
        style={{ border: 'solid 3px #543926', margin: `${owner ? '100px' : '40px'} auto`, display: 'block' }} 
        className="rounded-full px-5 py-2.5 text-white text-[0.925rem] font-medium"
      >
        {score || 0}{" $SOL"}
      </button>
      <button 
        onClick={onOpenHelpModal} 
        className="absolute bottom-4 right-4 text-[#666] hover:text-white transition-colors"
      >
        <HelpCircle size={22} />
      </button>
    </div>
  );
};

export default InfoCard;
