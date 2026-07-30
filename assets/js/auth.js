(function () {
  "use strict";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getUsers() {
    return window.AIStorage.read(window.MOCK_DATA.storageKeys.users, []);
  }

  function getAllUsers() {
    return [window.MOCK_DATA.demoUser, ...getUsers()];
  }

  function createSession(user) {
    const session = {
      userId: user.id,
      name: user.name,
      email: normalizeEmail(user.email),
      loginAt: new Date().toISOString(),
    };
    window.AIStorage.write(window.MOCK_DATA.storageKeys.session, session);
    return session;
  }

  function validateRegistration(input) {
    const name = String(input.name || "").trim();
    const email = normalizeEmail(input.email);
    const password = String(input.password || "");
    const confirmPassword = String(input.confirmPassword || "");

    if (!name) {
      return { valid: false, field: "name", message: "Vui lòng nhập họ và tên." };
    }
    if (!emailPattern.test(email)) {
      return { valid: false, field: "email", message: "Email chưa đúng định dạng." };
    }
    if (password.length < 6) {
      return {
        valid: false,
        field: "password",
        message: "Mật khẩu cần có ít nhất 6 ký tự.",
      };
    }
    if (password !== confirmPassword) {
      return {
        valid: false,
        field: "confirmPassword",
        message: "Mật khẩu xác nhận chưa khớp.",
      };
    }
    if (getAllUsers().some((user) => normalizeEmail(user.email) === email)) {
      return { valid: false, field: "email", message: "Email này đã được sử dụng." };
    }

    return { valid: true, value: { name, email, password } };
  }

  function login(emailInput, passwordInput) {
    const email = normalizeEmail(emailInput);
    const password = String(passwordInput || "");
    const user = getAllUsers().find(
      (candidate) =>
        normalizeEmail(candidate.email) === email && candidate.password === password,
    );

    if (!user) {
      return { ok: false, message: "Email hoặc mật khẩu không chính xác." };
    }

    return { ok: true, session: createSession(user) };
  }

  function register(input) {
    const validation = validateRegistration(input);
    if (!validation.valid) {
      return { ok: false, ...validation };
    }

    const user = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...validation.value,
    };
    window.AIStorage.write(window.MOCK_DATA.storageKeys.users, [...getUsers(), user]);
    return { ok: true, session: createSession(user) };
  }

  function getSession() {
    return window.AIStorage.read(window.MOCK_DATA.storageKeys.session, null);
  }

  function logout() {
    window.AIStorage.remove(window.MOCK_DATA.storageKeys.session);
  }

  window.AuthService = Object.freeze({
    getSession,
    login,
    logout,
    normalizeEmail,
    register,
    validateRegistration,
  });

  if (typeof document === "undefined") return;

  function setActiveTab(tabName) {
    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      const isActive = tab.dataset.authTab === tabName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== tabName;
    });
    clearAlert();
  }

  function clearAlert() {
    const alert = document.querySelector("#auth-alert");
    if (!alert) return;
    alert.textContent = "";
    alert.className = "form-alert";
  }

  function showAlert(message, type = "error") {
    const alert = document.querySelector("#auth-alert");
    if (!alert) return;
    alert.textContent = message;
    alert.className = `form-alert form-alert--${type}`;
  }

  function setSubmitting(form, submitting) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = submitting;
    button.textContent = submitting ? "Đang xử lý..." : button.dataset.defaultLabel;
  }

  function redirectToChat() {
    window.location.href = "chat.html";
  }

  function initializeAuthPage() {
    if (getSession()) {
      redirectToChat();
      return;
    }

    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      tab.addEventListener("click", () => setActiveTab(tab.dataset.authTab));
    });
    document.querySelectorAll("[data-switch-auth]").forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.switchAuth));
    });

    const loginForm = document.querySelector("#login-form");
    const registerForm = document.querySelector("#register-form");

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearAlert();
      setSubmitting(loginForm, true);
      const result = login(loginForm.email.value, loginForm.password.value);
      if (!result.ok) {
        showAlert(result.message);
        setSubmitting(loginForm, false);
        loginForm.email.focus();
        return;
      }
      redirectToChat();
    });

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearAlert();
      setSubmitting(registerForm, true);
      const result = register({
        name: registerForm.fullName.value,
        email: registerForm.email.value,
        password: registerForm.password.value,
        confirmPassword: registerForm.confirmPassword.value,
      });
      if (!result.ok) {
        showAlert(result.message);
        setSubmitting(registerForm, false);
        registerForm.elements[result.field]?.focus();
        return;
      }
      redirectToChat();
    });
  }

  document.addEventListener("DOMContentLoaded", initializeAuthPage);
})();
