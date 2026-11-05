import React from 'react';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { JobProgress } from './JobProgress';

interface UploadPaneProps {
  onGoToStudio: () => void;
}

export const UploadPane: React.FC<UploadPaneProps> = ({ onGoToStudio }) => {
  return (
    <div className="h-full overflow-y-auto px-8 py-10 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#262320]">上传图片</h1>
        <p className="text-xs text-[#7C7670] mt-1">批量拖入技工单图片，系统会识别英文内容并翻译为中文结果。</p>
      </header>

      <div className="bg-[#FFF6E0] border border-[#FFE7A8] rounded-2xl px-4 py-2.5 text-xs text-[#9A6700] mb-6">
        请勿上传敏感资料。本系统仅供研发使用。
      </div>

      <Dropzone />
      <FileList />
      <JobProgress onGoToStudio={onGoToStudio} />
    </div>
  );
};
