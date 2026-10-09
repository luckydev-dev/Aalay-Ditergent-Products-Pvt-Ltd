import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const SubHeader: React.FC<SubHeaderProps> = ({ title, onBack, rightAction }) => {
  const { setSubScreen } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setSubScreen('none');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0047B3] text-white h-14 px-4 flex items-center justify-between shadow-md">
      <button
        onClick={handleBack}
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white"
        aria-label="Go Back"
      >
        <ArrowLeft size={22} className="stroke-[2.5px]" />
      </button>

      <h1 className="text-lg font-bold tracking-tight text-white text-center flex-1 pr-2 truncate">
        {title}
      </h1>

      <div className="w-10 flex items-center justify-end">
        {rightAction || <div className="w-6" />}
      </div>
    </header>
  );
};
