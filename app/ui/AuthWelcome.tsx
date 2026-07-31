"use client";

import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

export function AuthWelcome({ onContinue }: { onContinue: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const isLogin = mode === "login";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue();
  }

  return (
    <main className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-overlay" aria-hidden="true" />

      <section className="auth-layout">
        <div className="auth-story">
          <div className="auth-brand">
            <span className="auth-brand-mark">AI</span>
            <span>
              <strong>AI Thực Chiến</strong>
              <small>Trợ lý tìm hiểu chương trình</small>
            </span>
          </div>

          <div className="auth-story-copy">
            <p className="auth-kicker">Khởi đầu hành trình của bạn</p>
            <h1>Hiểu đúng chương trình. Chuẩn bị đúng hướng.</h1>
            <p>
              Một không gian hỏi đáp dành cho sinh viên đang tìm hiểu, chuẩn bị
              dự tuyển hoặc sắp tham gia AI Thực Chiến.
            </p>
            <div className="auth-benefits" aria-label="Điểm nổi bật">
              <span>Tra cứu tài liệu chương trình</span>
              <span>Gợi ý lộ trình cá nhân hóa</span>
              <span>Đối chiếu nguồn chính thức</span>
            </div>
          </div>

          <p className="auth-image-credit">
            Trợ lý AI hỗ trợ định hướng, không thay thế thông báo của Ban Tổ chức.
          </p>
        </div>

        <div className="auth-panel-wrap">
          <section className="auth-panel" aria-labelledby="auth-title">
            <div className="auth-panel-heading">
              <span className="auth-mobile-mark">AI</span>
              <p>Chào mừng bạn</p>
              <h2 id="auth-title">
                {isLogin ? "Đăng nhập để tiếp tục" : "Tạo tài khoản mới"}
              </h2>
              <span>
                {isLogin
                  ? "Khám phá chương trình theo nhu cầu của riêng bạn."
                  : "Bắt đầu tìm hiểu AI Thực Chiến chỉ trong vài giây."}
              </span>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Tài khoản">
              <button
                aria-selected={isLogin}
                className={isLogin ? "active" : ""}
                onClick={() => setMode("login")}
                role="tab"
                type="button"
              >
                Đăng nhập
              </button>
              <button
                aria-selected={!isLogin}
                className={!isLogin ? "active" : ""}
                onClick={() => setMode("register")}
                role="tab"
                type="button"
              >
                Đăng ký
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <label>
                  Họ và tên
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder="Nguyễn Văn An"
                    type="text"
                  />
                </label>
              )}
              <label>
                Email
                <input
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                  placeholder="ban@email.com"
                  type="email"
                />
              </label>
              <label>
                Mật khẩu
                <input
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  name="password"
                  placeholder="Tối thiểu 8 ký tự"
                  type="password"
                />
              </label>

              {isLogin && (
                <div className="auth-form-options">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    <span>Ghi nhớ tôi</span>
                  </label>
                  <button className="auth-text-button" type="button">
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button className="auth-submit" type="submit">
                {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="auth-demo-note">
              <span aria-hidden="true">i</span>
              <p>
                Đây là giao diện minh họa. Thông tin bạn nhập không được gửi,
                xác thực hoặc lưu trên máy chủ.
              </p>
            </div>

            <p className="auth-switch">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              <button
                onClick={() => setMode(isLogin ? "register" : "login")}
                type="button"
              >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
