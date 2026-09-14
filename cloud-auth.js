/* LevelUp10 V0.12.0 — Platform Foundation
   Supabase is the signed-in learner's source of truth.
   Local storage remains an offline cache. Existing test-only local progress is not migrated.
*/
(() => {
  "use strict";
  const SUPABASE_URL="https://ztvsjiufbgmbaqggslwe.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY="sb_publishable_CHhugtMm-XG2blQIm01mqA_uxuXEbJA";
  let client=null,currentUser=null,currentProfile=null,currentGcseProfile=null,platformReady=false,loadedUserId=null,cloudLoadState="idle",cloudLoadError="",newLearnerInitialised=false;
  let saveTimer=null,syncing=false,pendingSave=false,lastSavedAt=null;
  const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

  function ensureUi(){
    // V0.11B.5.3: cloud account controls live inside Profile, not on Home.
  }
  function setStatus(text,connected=false){const el=document.getElementById("cloudAccountStatus");if(el)el.textContent=text;document.getElementById("cloudAccountBtn")?.classList.toggle("cloud-connected",connected)}
  function closeCloudAccount(){document.getElementById("cloudAccountOverlay")?.remove()}
  function message(text,kind=""){const el=document.getElementById("cloudMessage");if(!el)return;el.textContent=text;el.className=`cloud-message ${kind}`.trim()}

  async function fetchProfile(){
    currentProfile=null;if(!currentUser)return;
    const {data,error}=await client.from("profiles").select("id,role,display_name").eq("id",currentUser.id).single();
    if(!error)currentProfile=data;
  }
  async function ensureLevelUp10Platform(){
    if(!client||!currentUser)return;
    platformReady=false; currentGcseProfile=null;
    // V0.12.0: the authenticated person is the LevelUp10 identity. GCSE is an app membership.
    const {error:membershipError}=await client.from("user_apps").upsert(
      {user_id:currentUser.id,app_id:"gcse",last_opened_at:new Date().toISOString()},
      {onConflict:"user_id,app_id"}
    );
    if(membershipError)throw new Error(`LevelUp10 app membership: ${membershipError.message}`);
    const {data:gcseProfile,error:gcseProfileError}=await client.from("gcse_profiles").upsert(
      {user_id:currentUser.id},
      {onConflict:"user_id",ignoreDuplicates:true}
    ).select("user_id,current_level,maths_tier,science_tier,maths_higher_unlocked,science_higher_unlocked").single();
    if(gcseProfileError)throw new Error(`GCSE profile: ${gcseProfileError.message}`);
    currentGcseProfile=gcseProfile; platformReady=true;
  }

  async function loadCloudProgress(force=false){
    if(!client||!currentUser||syncing)return;
    if(!force&&loadedUserId===currentUser.id)return;
    syncing=true;setStatus("Loading cloud…",true);
    try{
      cloudLoadState="loading"; cloudLoadError="";
      // Select the row without naming optional scalar columns. This makes startup
      // tolerant of older student_data schemas while state JSON remains canonical.
      const {data,error}=await client.from("student_data").select("*").eq("student_id",currentUser.id).maybeSingle();
      if(error)throw error;
      if(!data)throw new Error("No student progress row exists for this account");
      if(typeof window.gcseBoostApplyCloudState!=="function")throw new Error("Learning engine is not ready");
      const cloudState=data.state||{};
      window.gcseBoostApplyCloudState(cloudState,data);
      const metadataName=String(currentUser.user_metadata?.display_name||"").trim();
      const profileName=String(currentProfile?.display_name||"").trim();
      const resolvedName=(profileName && profileName!=="Learner") ? profileName : (metadataName||profileName||"Learner");
      const resolvedAvatar=currentUser.user_metadata?.avatar||"🎓";
      const isFreshCloudLearner=!cloudState || Object.keys(cloudState).filter(k=>k!=="cloudSchemaVersion").length===0;
      if(isFreshCloudLearner && typeof window.gcseBoostConfigureCloudLearner==="function"){
        window.gcseBoostConfigureCloudLearner({userId:currentUser.id,name:resolvedName,avatar:resolvedAvatar});
        newLearnerInitialised=true;
      }else if(typeof window.gcseBoostApplyCloudProfileIdentity==="function"){
        window.gcseBoostApplyCloudProfileIdentity({userId:currentUser.id,name:resolvedName,avatar:resolvedAvatar});
      }
      // Repair early beta profiles whose database display name was created as the default.
      if(metadataName && (!profileName || profileName==="Learner") && metadataName!==profileName){
        const {error:profileUpdateError}=await client.from("profiles").update({display_name:metadataName}).eq("id",currentUser.id);
        if(!profileUpdateError){currentProfile={...(currentProfile||{}),id:currentUser.id,role:currentProfile?.role||"student",display_name:metadataName};}
      }
      loadedUserId=currentUser.id;lastSavedAt=data.updated_at||null;
      cloudLoadState="loaded";
      setStatus(currentProfile?.display_name||currentUser.email||"Synced",true);
    }catch(e){cloudLoadState="failed";cloudLoadError=e?.message||String(e);console.warn("Cloud load failed",e);setStatus("Cloud load failed",false)}finally{syncing=false}
    if(newLearnerInitialised){newLearnerInitialised=false;setTimeout(saveNow,100)}
  }
  async function loadCloudIdentity(forceProgress=false){
    if(!client)return;const {data:{session}}=await client.auth.getSession();currentUser=session?.user||null;
    if(!currentUser){currentProfile=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;setStatus("Not signed in",false);return}
    await fetchProfile();await ensureLevelUp10Platform();setStatus(currentProfile?.display_name||currentUser.email||"Connected",true);await loadCloudProgress(forceProgress);
  }

  function payloadFromApp(){
    const st=window.gcseBoostGetState?.();if(!st)return null;
    return {xp:Number(st.xp)||0,coins:Number(st.coins)||0,streak:Number(st.streak)||0,lives:Number.isFinite(Number(st.lives))?Number(st.lives):3,missions:Number(st.missions)||0,boss_wins:Number(st.bossWins)||0,state:{...st,cloudSchemaVersion:2}};
  }
  async function saveNow(){
    if(!client||!currentUser||loadedUserId!==currentUser.id||syncing){pendingSave=true;return}
    const payload=payloadFromApp();if(!payload)return;
    syncing=true;pendingSave=false;setStatus("Saving…",true);
    try{
      const {data,error}=await client.from("student_data").update(payload).eq("student_id",currentUser.id).select("updated_at").single();
      if(error)throw error;lastSavedAt=data?.updated_at||new Date().toISOString();setStatus(currentProfile?.display_name||"Synced ✓",true);
    }catch(e){console.warn("Cloud save failed",e);pendingSave=true;setStatus("Saved on device",false)}finally{
      syncing=false;if(pendingSave&&navigator.onLine)setTimeout(saveNow,600);
    }
  }
  function queueSave(){
    if(!currentUser||loadedUserId!==currentUser.id)return;pendingSave=true;clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,700);
  }
  window.gcseCloudQueueSave=queueSave;

  async function signIn(email,password){message("Signing in…");const {error}=await client.auth.signInWithPassword({email,password});if(error)return message(error.message,"error");loadedUserId=null;await loadCloudIdentity(true);renderCloudAccount()}
  async function signUp(email,password,displayName){message("Creating account…");const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||"Learner",avatar:window.gcseBoostPendingAvatar||"🎓"}}});if(error)return message(error.message,"error");if(!data.session)return message("Account created. Check your email to confirm it, then sign in.","good");loadedUserId=null;await loadCloudIdentity(true);renderCloudAccount()}
  async function signOut(){message("Signing out…");if(pendingSave)await saveNow();await client.auth.signOut();currentUser=null;currentProfile=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;setStatus("Not signed in",false);renderCloudAccount()}

  function renderCloudAccount(){
    const body=document.getElementById("cloudAccountBody");if(!body)return;
    if(currentUser){
      body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Cloud sync active</h3><p><b>${esc(currentProfile?.display_name||"Learner")}</b></p><p class="cloud-small">${esc(currentUser.email||"")}</p><p class="cloud-small">Role: ${esc(currentProfile?.role||"student")}</p><p class="cloud-small"><b>LevelUp10 app:</b> ${platformReady?"GCSE ✓":"Connecting…"}</p><p class="cloud-small"><b>Learner ID:</b> ${esc(window.gcseBoostCloudLearnerId?.()||"—")}</p><div class="cloud-safe-note">Progress is now saved to this cloud account. This device keeps an offline copy and catches up when the connection returns.</div><div id="cloudMessage" class="cloud-message ${cloudLoadState==="loaded"?"good":cloudLoadState==="failed"?"error":""}">${!navigator.onLine?"Offline copy active":cloudLoadState==="loaded"?"Cloud progress loaded ✓":cloudLoadState==="failed"?`Cloud load failed: ${esc(cloudLoadError)}`:"Checking cloud progress…"}</div><button id="cloudSaveNow" class="cloud-primary" type="button">SAVE NOW</button><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;
      document.getElementById("cloudSaveNow").onclick=async()=>{message("Saving…");await saveNow();message("Cloud save complete ✓","good")};document.getElementById("cloudSignOut").onclick=signOut;return;
    }
    body.innerHTML=`<div class="cloud-tabs"><button id="cloudTabSignIn" class="active" type="button">Sign in</button><button id="cloudTabCreate" type="button">Create account</button></div><div id="cloudForm"></div>`;showSignInForm();document.getElementById("cloudTabSignIn").onclick=showSignInForm;document.getElementById("cloudTabCreate").onclick=showCreateForm;
  }
  function activateTab(create){document.getElementById("cloudTabSignIn")?.classList.toggle("active",!create);document.getElementById("cloudTabCreate")?.classList.toggle("active",create)}
  function showSignInForm(){activateTab(false);const f=document.getElementById("cloudForm");if(!f)return;f.innerHTML='<label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="current-password" minlength="8"></label><button id="cloudSignIn" class="cloud-primary" type="button">SIGN IN</button><div id="cloudMessage" class="cloud-message"></div>';document.getElementById("cloudSignIn").onclick=()=>{const e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value;if(!e||p.length<8)return message("Enter your email and password (8+ characters).","error");signIn(e,p)}}
  function showCreateForm(){activateTab(true);const f=document.getElementById("cloudForm");if(!f)return;const n=document.getElementById("profileName")?.textContent?.trim()||"Learner";window.gcseBoostPendingAvatar="🎓";const avatars=["🎓","🚀","⭐","🦊","🐼","🦁"];f.innerHTML=`<label class="cloud-label">Learner name<input id="cloudDisplayName" type="text" maxlength="24" value="${esc(n)}" autocomplete="nickname"></label><div class="cloud-label">Choose an avatar<div class="cloud-avatar-picks">${avatars.map((a,i)=>`<button type="button" class="cloud-avatar-pick ${i===0?"selected":""}" data-avatar="${a}">${a}</button>`).join("")}</div></div><label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="new-password" minlength="8"></label><button id="cloudCreate" class="cloud-primary" type="button">CREATE LEARNER ACCOUNT</button><div id="cloudMessage" class="cloud-message"></div><p class="cloud-small">Starts fresh at Level 1. Progress, timetable, rewards and settings then follow this account across devices.</p>`;f.querySelectorAll(".cloud-avatar-pick").forEach(b=>b.onclick=()=>{f.querySelectorAll(".cloud-avatar-pick").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");window.gcseBoostPendingAvatar=b.dataset.avatar});document.getElementById("cloudCreate").onclick=()=>{const n=document.getElementById("cloudDisplayName").value.trim(),e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value;if(!n||!e||p.length<8)return message("Enter a learner name, email and password of at least 8 characters.","error");signUp(e,p,n)}}
  async function showCloudAccount(){closeCloudAccount();const o=document.createElement("div");o.id="cloudAccountOverlay";o.className="cloud-overlay";o.innerHTML='<div class="cloud-panel" role="dialog" aria-modal="true" aria-label="Cloud account"><div class="cloud-head"><div><b>☁️ Cloud Account</b><small>V0.12.0</small></div><button id="cloudClose" type="button" aria-label="Close">×</button></div><div id="cloudAccountBody"><p>Checking connection…</p></div></div>';document.body.appendChild(o);document.getElementById("cloudClose").onclick=closeCloudAccount;o.addEventListener("click",e=>{if(e.target===o)closeCloudAccount()});await loadCloudIdentity();renderCloudAccount()}
  async function init(){ensureUi();if(!window.supabase?.createClient){setStatus("Offline / cloud unavailable",false);return}client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{const next=session?.user?.id||null;if(next!==currentUser?.id)loadedUserId=null;await loadCloudIdentity(true)},0)});window.addEventListener("online",()=>{if(currentUser){loadCloudIdentity(true).then(()=>{if(pendingSave)saveNow()})}});try{await loadCloudIdentity(true)}catch(e){console.warn("Cloud account check failed",e)}}
  window.showCloudAccount=showCloudAccount;window.addEventListener("DOMContentLoaded",init);
})();
