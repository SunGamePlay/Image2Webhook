import React from 'react';
import { UploadCloud, Layers, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

interface NavRailProps {
  activePane: 'upload' | 'gallery';
  onSelectPane: (pane: 'upload' | 'gallery') => void;
  onSignOff?: () => void;
}

export const NavRail: React.FC<NavRailProps> = ({ activePane, onSelectPane, onSignOff }) => {
  const { user, logout } = useAuthStore();

  const handleSignOff = () => {
    if (window.confirm('确定要退出登录吗？')) {
      if (onSignOff) {
        onSignOff();
      } else {
        logout();
      }
    }
  };

  return (
    <aside className="w-[72px] h-full bg-[#1F1C1A] flex flex-col items-center py-4 border-r border-[#333] shrink-0 z-30 nav-rail">
      <div className="w-10 h-10 rounded-xl bg-[#E25C1D] text-white flex items-center justify-center text-xl mb-6 shadow-md select-none">
        🦷
      </div>

      <nav className="flex flex-col gap-3 w-full px-2">
        <button
          type="button"
          onClick={() => onSelectPane('upload')}
          title="上传图片"
          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all
            ${activePane === 'upload' ? 'bg-[#E25C1D] text-white shadow' : 'text-[#A39E97] hover:bg-[#2C2926] hover:text-white'}`}
        >
          <UploadCloud size={22} />
        </button>

        <button
          type="button"
          onClick={() => onSelectPane('gallery')}
          title="图片与表单比对编辑器"
          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all
            ${activePane === 'gallery' ? 'bg-[#E25C1D] text-white shadow' : 'text-[#A39E97] hover:bg-[#2C2926] hover:text-white'}`}
        >
          <Layers size={22} />
        </button>
      </nav>

      <div className="mt-auto w-full px-2">
        <button
          type="button"
          onClick={handleSignOff}
          title={user?.username ? `退出登录 (${user.username})` : '退出登录'}
          aria-label="退出登录"
          className="w-full aspect-square rounded-xl flex items-center justify-center transition-all text-[#A39E97] hover:bg-[#2C2926] hover:text-red-400"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};
