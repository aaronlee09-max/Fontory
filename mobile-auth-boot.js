(() => {
  // Mobile boot guard: if the central /me check is temporarily unavailable,
  // let auth.js fall back to its normal login screen. Credential/MFA/passkey
  // requests are left untouched.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input?.url || "");
    const isAuthMe = url.includes("fontory-api.fontory.workers.dev/api/auth/me");
    if (!isAuthMe) return nativeFetch(input, init);
    try {
      const response = await nativeFetch(input, init);
      if (response.status >= 500) {
        return new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } });
      }
      return response;
    } catch (error) {
      console.warn("[Fontory Mobile] /api/auth/me check failed; showing login.", error);
      return new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } });
    }
  };
})();