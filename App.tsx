
import React from 'react';
import { GameUI } from './components/GameUI';

const App: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden bg-[#f0f2f5]">
      <GameUI />
    </div>
  );
};

export default App;
