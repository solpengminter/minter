
import React, { useState, useRef, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

import Header from './components/Header';
import WalletModal from './components/WalletModal';
import useScrollLock from './hooks/useScrollLock';
import HelpModal from './components/HelpModal';
import MainModal from './components/MainModal';
import AddressInput from './components/AddressInput';
import TokenForm from './components/TokenForm';
import InfoCard from './components/InfoCard';
import Footer from './components/Footer';
import SocialIcons from './components/SocialIcons';
import Notification from './components/Notification';

const STORAGE_KEY = 'address-history';

function App() {
  const [owner, setOwner] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [balance, setBalance] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokensToMint, setTokensToMint] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: null, color: '#C58D00' });
  const [localNotification, setLocalNotification] = useState({ message: null, color: '#C58D00' });
  const [showAddressHistory, setShowAddressHistory] = useState(false);
  const [account, setAccount] = useState(null);
  const [addressHistory, setAddressHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const addressInputRef = useRef(null);
  const { lockScroll, unlockScroll } = useScrollLock();

  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true })
        .then(({ publicKey }) => setAccount(publicKey.toString()))
        .catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const { publicKey } = await window.solana.connect();
        setAccount(publicKey.toString());
        setNotification({ message: "Phantom Wallet connected!", color: '#00C851' });
      } else {
        setNotification({ message: "Phantom Wallet not found", color: '#FF4444' });
      }
    } catch (error) {
      console.error("Phantom connection error:", error);
      setNotification({ message: "Connection failed", color: '#FF4444' });
    }
  };

  const disconnectWallet = () => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.disconnect();
      setAccount(null);
      setNotification({ message: "Wallet disconnected", color: '#C58D00' });
    }
  };

  useEffect(() => {
    if (isModalOpen || isHelpModalOpen || isWalletModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isModalOpen, isHelpModalOpen, isWalletModalOpen]);

  const handleAddressSubmit = (address) => {
    if (!address.trim()) return;
    const newHistory = [address, ...addressHistory.filter(a => a !== address)].slice(0, 10);
    setAddressHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setShowAddressHistory(false);
  };

  const handleRemoveAddress = (addressToRemove) => {
    if (tokenAddress === addressToRemove) {
      setTokenAddress('');
    }
    const newHistory = addressHistory.filter(address => address !== addressToRemove);
    setTimeout(() => {
      setAddressHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }, 10);
  };

  const handleAddressSelect = (address) => {
    setTokenAddress(address);
    setShowAddressHistory(false);
  };

  const fetchTokenData = async () => {
    if (!account || !tokenAddress) return;
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const mintPubkey = new PublicKey(tokenAddress);
      const mintInfo = await getMint(connection, mintPubkey);
      const ata = await getAssociatedTokenAddress(mintPubkey, new PublicKey(account));

      const userTokenAccount = await getAccount(connection, ata);

      setTokenName('SPL Token');
      setTokenSymbol(`Decimals: ${mintInfo.decimals}`);
      setOwner(mintInfo.mintAuthority?.toBase58() || '');
      setTotalSupply(Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals));
      setBalance(Number(userTokenAccount.amount) / Math.pow(10, mintInfo.decimals));
    } catch (err) {
      console.error("Failed to fetch token info", err);
      setTokenName('');
      setTokenSymbol('');
      setOwner(null);
      setTotalSupply(null);
      setBalance(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="background-element" />
      <div className="fixed bottom-0 left-0 z-[999]">
        {(notification.message || localNotification.message) && (
          <Notification 
            notification={notification.message ? notification : localNotification}
            onClose={() => {
              setNotification({ message: null, color: '#C58D00' });
              setLocalNotification({ message: null, color: '#C58D00' });
            }} 
          />
        )}
      </div>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <MainModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coins={[]} />

      <Header 
        onOpenModal={() => setIsModalOpen(true)}
        addressInputRef={addressInputRef}
        tokenAddress={tokenAddress}
        setTokenAddress={setTokenAddress}
        tokenSymbol={tokenSymbol}
        setTokenSymbol={setTokenSymbol}
        owner={owner}
        setOwner={setOwner}
        totalSupply={totalSupply}
        setTotalSupply={setTotalSupply}
        balance={balance}
        setBalance={setBalance}
        showAddressHistory={showAddressHistory}
        setShowAddressHistory={setShowAddressHistory}
        addressHistory={addressHistory}
        handleAddressSelect={handleAddressSelect}
        onAddressSubmit={handleAddressSubmit}
        onRemoveAddress={handleRemoveAddress}
        account={account}
        localNotification={localNotification}
        setLocalNotification={setLocalNotification}
        setNotification={setNotification}
        setAccount={setAccount}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        setTokenName={setTokenName}
        setTokensToMint={setTokensToMint}
      />

      <main className="flex-grow bg-black py-2.5">
        <div className="max-w-[1150px] mx-auto px-4 sm:px-5.5">
          <h1 className="text-2xl sm:text-[2rem] mt-6 sm:mt-10 font-bold mb-4 sm:mb-5.5">Mint your token</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-6 sm:gap-10 lg:gap-20 mb-10 sm:mb-20">
            <TokenForm
              tokenName={tokenName}
              setTokenName={setTokenName}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokensToMint={tokensToMint}
              setTokensToMint={setTokensToMint}
              setNotification={setNotification}
              owner={owner}
              account={account}
              onConnectWallet={() => setIsWalletModalOpen(true)}
              balance={balance}
              totalSupply={totalSupply}
              tokenAddress={tokenAddress}
              setTokenAddress={setTokenAddress}
              setIsWalletModalOpen={setIsWalletModalOpen}
              connectWallet={connectWallet}
              setOwner={setOwner}
              setTotalSupply={setTotalSupply}
              setBalance={setBalance}
              fetchTokenData={fetchTokenData}
            />
            <InfoCard
              onOpenModal={() => setIsModalOpen(true)}
              onOpenHelpModal={() => setIsHelpModalOpen(true)}
              userAddress={owner}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
