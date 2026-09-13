/* GCSE Boost V0.11B.0 — Supabase Cloud Sign-In Foundation
   Stage 1 only: authentication + cloud profile recognition.
   Existing local learner data remains the source of truth; no progress sync yet.
*/
(() => {
  "use strict";

  const SUPABASE_URL = "https://ztvsjiufbgmbaqggslwe.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CHhugtMm-XG2blQIm01mqA_uxuXEbJA";
  let client = null;
  let currentUser = null;
  let currentProfile = null;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

  function ensureUi() {
    if (document.getElementById("cloudAccountBtn")) return;
    const localBtn = document.querySelector(".account-home-btn");
    if (!localBtn) return;
    const btn = document.createElement("button");
    btn.id = "cloudAccountBtn";
    btn.className = "cloud-account-btn";
    btn.type = "button";
    btn.innerHTML = "☁️ <b>Cloud account</b><span id=\"cloudAccountStatus\">Not signed in</span>";
    btn.addEventListener("click", showCloudAccount);
    localBtn.insertAdjacentElement("afterend", btn);
  }

  function setStatus(text, connected=false) {
    const el = document.getElementById("cloudAccountStatus");
    if (el) el.textContent = text;
    const btn = document.getElementById("cloudAccountBtn");
    if (btn) btn.classList.toggle("cloud-connected", connected);
  }

  function closeCloudAccount() {
    document.getElementById("cloudAccountOverlay")?.remove();
  }

  function message(text, kind="") {
    const el = document.getElementById("cloudMessage");
    if (!el) return;
    el.textContent = text;
    el.className = `cloud-message ${kind}`.trim();
  }

  async function loadCloudIdentity() {
    if (!client) return;
    const { data: { session } } = await client.auth.getSession();
    currentUser = session?.user || null;
    currentProfile = null;
    if (currentUser) {
      const { data, error } = await client.from("profiles")
        .select("id,role,display_name")
        .eq("id", currentUser.id)
        .single();
      if (!error) currentProfile = data;
      setStatus(currentProfile?.display_name || currentUser.email || "Connected", true);
    } else {
      setStatus("Not signed in", false);
    }
  }

  async function signIn(email, password) {
    message("Signing in…");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) { message(error.message, "error"); return; }
    await loadCloudIdentity();
    renderCloudAccount();
  }

  async function signUp(email, password, displayName) {
    message("Creating account…");
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || "Learner" } }
    });
    if (error) { message(error.message, "error"); return; }
    if (!data.session) {
      message("Account created. Check your email to confirm it, then sign in.", "good");
      return;
    }
    await loadCloudIdentity();
    renderCloudAccount();
  }

  async function signOut() {
    message("Signing out…");
    await client.auth.signOut();
    currentUser = null;
    currentProfile = null;
    setStatus("Not signed in", false);
    renderCloudAccount();
  }

  function renderCloudAccount() {
    const body = document.getElementById("cloudAccountBody");
    if (!body) return;
    if (currentUser) {
      body.innerHTML = `
        <div class="cloud-connected-card">
          <div class="cloud-check">✓</div>
          <h3>Cloud connected</h3>
          <p><b>${esc(currentProfile?.display_name || "Learner")}</b></p>
          <p class="cloud-small">${esc(currentUser.email || "")}</p>
          <p class="cloud-small">Role: ${esc(currentProfile?.role || "student")}</p>
          <div class="cloud-safe-note">Your existing GCSE Boost progress is still stored locally. V0.11B.0 does not upload or overwrite it.</div>
          <button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button>
        </div>`;
      document.getElementById("cloudSignOut").onclick = signOut;
      return;
    }
    body.innerHTML = `
      <div class="cloud-tabs">
        <button id="cloudTabSignIn" class="active" type="button">Sign in</button>
        <button id="cloudTabCreate" type="button">Create account</button>
      </div>
      <div id="cloudForm"></div>`;
    showSignInForm();
    document.getElementById("cloudTabSignIn").onclick = showSignInForm;
    document.getElementById("cloudTabCreate").onclick = showCreateForm;
  }

  function activateTab(create) {
    document.getElementById("cloudTabSignIn")?.classList.toggle("active", !create);
    document.getElementById("cloudTabCreate")?.classList.toggle("active", create);
  }

  function showSignInForm() {
    activateTab(false);
    const form = document.getElementById("cloudForm");
    if (!form) return;
    form.innerHTML = `
      <label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label>
      <label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="current-password" minlength="8"></label>
      <button id="cloudSignIn" class="cloud-primary" type="button">SIGN IN</button>
      <div id="cloudMessage" class="cloud-message"></div>`;
    document.getElementById("cloudSignIn").onclick = () => {
      const email = document.getElementById("cloudEmail").value.trim();
      const password = document.getElementById("cloudPassword").value;
      if (!email || password.length < 8) return message("Enter your email and password (8+ characters).", "error");
      signIn(email, password);
    };
  }

  function showCreateForm() {
    activateTab(true);
    const form = document.getElementById("cloudForm");
    if (!form) return;
    const localName = document.getElementById("profileName")?.textContent?.trim() || "Learner";
    form.innerHTML = `
      <label class="cloud-label">Display name<input id="cloudDisplayName" type="text" maxlength="40" value="${esc(localName)}" autocomplete="nickname"></label>
      <label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label>
      <label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="new-password" minlength="8"></label>
      <button id="cloudCreate" class="cloud-primary" type="button">CREATE STUDENT ACCOUNT</button>
      <div id="cloudMessage" class="cloud-message"></div>
      <p class="cloud-small">Cloud accounts are currently in beta. Progress sync is not enabled yet.</p>`;
    document.getElementById("cloudCreate").onclick = () => {
      const name = document.getElementById("cloudDisplayName").value.trim();
      const email = document.getElementById("cloudEmail").value.trim();
      const password = document.getElementById("cloudPassword").value;
      if (!name || !email || password.length < 8) return message("Enter a name, email and password of at least 8 characters.", "error");
      signUp(email, password, name);
    };
  }

  async function showCloudAccount() {
    closeCloudAccount();
    const overlay = document.createElement("div");
    overlay.id = "cloudAccountOverlay";
    overlay.className = "cloud-overlay";
    overlay.innerHTML = `
      <div class="cloud-panel" role="dialog" aria-modal="true" aria-label="Cloud account">
        <div class="cloud-head"><div><b>☁️ Cloud Account</b><small>V0.11B.0</small></div><button id="cloudClose" type="button" aria-label="Close">×</button></div>
        <div id="cloudAccountBody"><p>Checking connection…</p></div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById("cloudClose").onclick = closeCloudAccount;
    overlay.addEventListener("click", e => { if (e.target === overlay) closeCloudAccount(); });
    await loadCloudIdentity();
    renderCloudAccount();
  }

  async function init() {
    ensureUi();
    if (!window.supabase?.createClient) {
      setStatus("Offline / cloud unavailable", false);
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    client.auth.onAuthStateChange(() => setTimeout(loadCloudIdentity, 0));
    try { await loadCloudIdentity(); } catch (e) { console.warn("Cloud account check failed", e); }
  }

  window.showCloudAccount = showCloudAccount;
  window.addEventListener("DOMContentLoaded", init);
})();
