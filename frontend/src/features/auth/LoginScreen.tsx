import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export const LoginScreen: React.FC = () => {
  const { login, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || submitting) return;
    setSubmitting(true);
    await login(username, password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-[#EAE6DF] rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#E25C1D] text-white flex items-center justify-center text-2xl shadow">
            🦷
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#262320]">技工单识别</h1>
            <p className="text-xs text-[#7C7670]">Image2Webhook · 研发环境</p>
          </div>
        </div>

        <div className="bg-[#FFF6E0] border border-[#FFE7A8] rounded-2xl p-4 text-xs text-[#9A6700] mb-6 leading-relaxed">
          <h2 className="font-bold mb-1">数据使用说明</h2>
          请勿上传敏感资料。所有上传的图片、识别结果仅用于研发用途，不应用于临床诊疗。上传前请确认图片中不含患者隐私或其他敏感信息。
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#262320] mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-sm outline-none focus:border-[#E25C1D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262320] mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-sm outline-none focus:border-[#E25C1D]"
              required
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#7C7670] cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-[#E25C1D] focus:ring-[#E25C1D]"
            />
            <span>我已阅读并同意上述说明</span>
          </label>

          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

          <button
            type="submit"
            disabled={!accepted || submitting}
            className="w-full py-3 bg-[#E25C1D] hover:bg-[#C74E13] disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition shadow mt-2"
          >
            {submitting ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
    </div>
  );
};
