import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import btnCreateToken from '../../public/img/createTokenBtn.png';

const ModalOverlay = React.memo(({ children, onClose }) => (
  <div 
    className="modal fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999] modal-overlay tokenModalSOL"
    onClick={onClose}
  >
    {children}
  </div>
));

const ModalHeader = React.memo(({ onClose }) => (
  <>
    <button 
      onClick={onClose}
      className="absolute right-2 top-1 hover:text-white"
    >
      <X size={22} />
    </button>

    <h2 style={{fontSize: '18px'}} className="modalTokenHeaderAdap text-xl text-center  text-white">
      $SOL are tokens of the Solana minter project, which in the future you will be able to mint on your wallet or spend on promotion in Solana memepad.
    </h2>

    <div className="flex justify-center mb-2">
      <img 
        src="/img/modal-circle.png" 
        alt="Modal Circle" 
        className="w-24 h-24 pulse"
        style={{ margin: '-10px 0' }} 
      />
    </div>
  </>
));

const SearchSection = React.memo(() => (
  <div className="flex justify-center items-center gap-2 mb-5">
    <div className="relative w-[180px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" size={16} />
      <input
        type="text"
        placeholder="Search for token"
        disabled
        className="w-full bg-transparent border border-white rounded-lg py-1.5 pl-9 pr-3 text-white cursor-not-allowed text-sm"
      />
    </div>
    <div className="border border-white text-white px-3 py-1.5 rounded-lg text-sm cursor-not-allowed bg-transparent">
      search
    </div>
  </div>
));

const CoinDisplay = React.memo(({ coin, isTransitioning }) => (
  <div style={{padding: '0 20px'}} className="relative z-10 flex justify-between items-center h-full coin-container overflow-visible">
    <div>
      <h3 
        style={{fontSize: '25px'}} 
        className={`text-white coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[25px] text-[17px]`}
      >
        {coin?.name || 'Unnamed'}
      </h3>
      <p 
        style={{marginBottom: '-7px'}}
        className={`text-white coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[19px] text-[14px]`}
      >
        created by {coin?.creator || 'Unknown'}
      </p>
      <p 
        className={`coin-transition ${isTransitioning ? 'coin-exit' : ''} sm:text-[19px] text-[14px]`}
      >
        <span className="text-white">market cap: </span>
        <span style={{ color: '#00FF0D' }}>{coin?.marketCap || ''}</span>
      </p>
    </div>
    <img 
      src={coin?.image || ''}
      alt={coin?.name || 'Unnamed'}
      className={`w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-xl object-cover coin-transition ${isTransitioning ? 'coin-exit' : ''}`}
      style={{ border: '1px solid white' }}
    />
  </div>
));

const MainModal = ({ isOpen, onClose, coins }) => {
  if (!isOpen) return null;

  const [direction, setDirection] = useState('next');
  const [currentCoinIndex, setCurrentCoinIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentCoinIndex((prevIndex) => (prevIndex + 1) % coins.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 1000);
      
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, coins.length]);
  
  useEffect(() => {
    return startTransition();
  }, [startTransition]);

  const currentCoin = coins[currentCoinIndex];

  return 
};

export default MainModal;