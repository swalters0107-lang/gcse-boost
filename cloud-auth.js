/* LevelUp10 V0.23.1.5 — Account Recovery Fix
   Supabase is the signed-in learner's source of truth.
   Local storage remains an offline cache. Existing test-only local progress is not migrated.
*/
(() => {
  "use strict";
  const SUPABASE_URL="https://ztvsjiufbgmbaqggslwe.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY="sb_publishable_CHhugtMm-XG2blQIm01mqA_uxuXEbJA";
  let client=null,currentUser=null,currentProfile=null,currentIdentity=null,currentGcseProfile=null,platformReady=false,loadedUserId=null,cloudLoadState="idle",cloudLoadError="",newLearnerInitialised=false;
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
  async function fetchLevelUp10Identity(){
    currentIdentity=null;if(!currentUser)return;
    const {data,error}=await client.from("levelup10_identities")
      .select("user_id,display_name,avatar,levelup10_id")
      .eq("user_id",currentUser.id).maybeSingle();
    if(error)throw new Error(`LevelUp10 identity read: ${error.message}`);
    if(!data)throw new Error("No LevelUp10 identity exists for this account");
    currentIdentity=data;
  }
  async function ensureLevelUp10Platform(){
    if(!client||!currentUser)return;
    platformReady=false; currentGcseProfile=null;
    // V0.12.0.1: use explicit select/insert/update operations rather than
    // relying on an upsert returning a row. This is more predictable with RLS.
    const openedAt=new Date().toISOString();
    const {data:membership,error:membershipReadError}=await client.from("user_apps")
      .select("user_id,app_id,last_opened_at")
      .eq("user_id",currentUser.id).eq("app_id","gcse").maybeSingle();
    if(membershipReadError)throw new Error(`LevelUp10 membership read: ${membershipReadError.message}`);
    if(!membership){
      const {error:membershipInsertError}=await client.from("user_apps")
        .insert({user_id:currentUser.id,app_id:"gcse",last_opened_at:openedAt});
      if(membershipInsertError)throw new Error(`LevelUp10 membership create: ${membershipInsertError.message}`);
    }else{
      const {error:membershipUpdateError}=await client.from("user_apps")
        .update({last_opened_at:openedAt})
        .eq("user_id",currentUser.id).eq("app_id","gcse");
      if(membershipUpdateError)throw new Error(`LevelUp10 membership update: ${membershipUpdateError.message}`);
    }

    let {data:gcseProfile,error:gcseReadError}=await client.from("gcse_profiles")
      .select("user_id,current_level,maths_tier,science_tier,maths_higher_unlocked,science_higher_unlocked")
      .eq("user_id",currentUser.id).maybeSingle();
    if(gcseReadError)throw new Error(`GCSE profile read: ${gcseReadError.message}`);
    if(!gcseProfile){
      const {error:gcseInsertError}=await client.from("gcse_profiles").insert({user_id:currentUser.id});
      if(gcseInsertError)throw new Error(`GCSE profile create: ${gcseInsertError.message}`);
      const reread=await client.from("gcse_profiles")
        .select("user_id,current_level,maths_tier,science_tier,maths_higher_unlocked,science_higher_unlocked")
        .eq("user_id",currentUser.id).single();
      if(reread.error)throw new Error(`GCSE profile verify: ${reread.error.message}`);
      gcseProfile=reread.data;
    }
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
      const identityName=String(currentIdentity?.display_name||"").trim();
      const resolvedName=identityName||((profileName && profileName!=="Learner") ? profileName : (metadataName||profileName||"Learner"));
      const resolvedAvatar=currentIdentity?.avatar||currentUser.user_metadata?.avatar||"🎓";
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
    if(!currentUser){currentProfile=null;currentIdentity=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;setStatus("Not signed in",false);return}
    await fetchProfile();if(!currentProfile)throw new Error("No LevelUp10 profile exists for this account");await fetchLevelUp10Identity();const role=currentProfile?.role||"student";if(role==="student"||role==="learner"){await ensureLevelUp10Platform();setStatus(currentProfile?.display_name||currentUser.email||"Connected",true);await loadCloudProgress(forceProgress);}else{platformReady=true;loadedUserId=null;setStatus(`${currentProfile?.display_name||currentUser.email} · ${role}`,true);}
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
  async function signUp(email,password,displayName,requestedRole="student"){message(`Creating ${requestedRole} account…`);const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||"Learner",avatar:window.gcseBoostPendingAvatar||"🎓",requested_role:requestedRole}}});if(error)return message(error.message,"error");if(!data.session)return message(`Account created as ${requestedRole}. Check your email to confirm it, then sign in.`,"good");loadedUserId=null;await fetchProfile();if(!currentProfile)return message("Account authentication was created, but the LevelUp10 profile is missing. Please sign out and try again.","error");if(currentProfile.role!==requestedRole){console.error("LevelUp10 role verification failed",{requestedRole,actualRole:currentProfile.role});return message(`Account role setup failed: requested ${requestedRole}, database returned ${currentProfile.role}. Run the V0.23.1.5 Supabase migration before creating accounts.`,"error")}await loadCloudIdentity(true);renderCloudAccount()}
  async function signOut(){message("Signing out…");if(pendingSave)await saveNow();await client.auth.signOut();currentUser=null;currentProfile=null;currentIdentity=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;setStatus("Not signed in",false);renderCloudAccount()}
  async function recoverySignOut(){const btn=document.getElementById("cloudRecoverySignOut");if(btn){btn.disabled=true;btn.textContent="SIGNING OUT…"}try{await client.auth.signOut({scope:"local"})}catch(e){console.warn("Recovery sign out failed",e);try{await client.auth.signOut()}catch(_){}}pendingSave=false;clearTimeout(saveTimer);currentUser=null;currentProfile=null;currentIdentity=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;cloudLoadState="idle";cloudLoadError="";setStatus("Not signed in",false);renderCloudAccount()}

  async function generateParentCode(){
    const btn=document.getElementById("cloudGenerateParentCode"); if(btn)btn.disabled=true;
    message("Generating secure code…");
    const {data,error}=await client.rpc("generate_parent_link_code");
    if(btn)btn.disabled=false;
    if(error)return message(error.message,"error");
    const out=document.getElementById("cloudParentCode");
    if(out)out.innerHTML=`<div class="cloud-link-code">${esc(data)}</div><p class="cloud-small">Give this code to your parent/carer. It expires in 24 hours and can only be used once.</p>`;
    message("Parent connection code ready ✓","good");
  }
  async function redeemParentCode(){
    const input=document.getElementById("cloudRedeemCode"),code=input?.value?.trim();
    if(!code||code.length<6)return message("Enter the connection code from the student.","error");
    message("Linking student…");
    const {error}=await client.rpc("redeem_parent_link_code",{entered_code:code});
    if(error)return message(error.message,"error");
    if(input)input.value=""; message("Student linked ✓","good"); await renderParentDashboard();
  }
  function summariseState(state,xp){
    if(typeof window.gcseBoostSummariseStudentProgress==="function")return window.gcseBoostSummariseStudentProgress(state,xp);
    const s=state&&typeof state==="object"?state:{};
    return {level:Math.max(1,Math.floor((Number(xp)||Number(s.xp)||0)/250)+1),masteryAvg:null};
  }
  async function renderParentDashboard(){
    const host=document.getElementById("cloudParentStudents");if(!host)return;
    host.innerHTML='<p class="cloud-small">Loading linked students…</p>';
    const {data,error}=await client.rpc("get_parent_student_summaries");
    if(error){host.innerHTML=`<div class="cloud-message error">${esc(error.message)}</div><p class="cloud-small">Run the V0.23.1 parent dashboard SQL supplied with this build.</p>`;return}
    const rows=Array.isArray(data)?data:[];
    if(!rows.length){host.innerHTML='<div class="cloud-empty">No students linked yet. Ask the student to generate a Parent/Carer code, then enter it below.</div>';return}
    window.gcseParentRows=rows;
    host.innerHTML=rows.map((r,i)=>{
      const x=summariseState(r.state,r.xp);
      const active=(x.subjects||[]).filter(s=>s.attempts>0);
      const preview=active.slice(0,4).map(s=>`<div class="cloud-subject-row"><span><b>${esc(s.subject)}</b><small>${s.attempts} answers · ${s.accuracy}% recent accuracy</small></span><strong>${esc(s.level)} · ${s.progress}%</strong></div>`).join("");
      return `<div class="cloud-student-card"><div><b>${esc(r.display_name||"Student")}</b><span>${esc(r.avatar||"🎓")}</span></div><div class="cloud-stat-grid"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div>${preview?`<div class="cloud-subject-preview">${preview}</div>`:""}<button class="cloud-secondary cloud-progress-btn" type="button" data-parent-row="${i}">VIEW FULL PROGRESS</button><p class="cloud-small">Read-only progress · Last updated ${r.updated_at?new Date(r.updated_at).toLocaleString():"—"}</p></div>`;
    }).join("");
    host.querySelectorAll("[data-parent-row]").forEach(btn=>btn.onclick=()=>showParentProgress(Number(btn.dataset.parentRow)));
  }
  function showParentProgress(index){
    const r=(window.gcseParentRows||[])[index]; if(!r)return;
    const x=summariseState(r.state,r.xp), subjects=(x.subjects||[]);
    const rows=subjects.map(s=>`<div class="cloud-progress-subject ${s.attempts?"has-evidence":""}"><div><b>${esc(s.subject)}</b><strong>${esc(s.level)}${s.attempts?" · "+s.progress+"%":""}</strong></div><div class="cloud-progress-bar"><i style="width:${Math.max(0,Math.min(100,s.progress||0))}%"></i></div><small>${s.attempts?s.attempts+" answers recorded · "+s.accuracy+"% recent accuracy":"No learning evidence yet"}</small></div>`).join("");
    const host=document.getElementById("cloudParentStudents"); if(!host)return;
    host.innerHTML=`<div class="cloud-progress-head"><button id="cloudBackParent" class="cloud-secondary" type="button">← BACK TO PARENT DASHBOARD</button><h3>${esc(r.display_name||"Student")} · Full Progress</h3><p class="cloud-small">Read-only view of the same learning evidence used by the student app.</p></div><div class="cloud-stat-grid cloud-progress-summary"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div><div class="cloud-progress-list">${rows}</div>`;
    document.getElementById("cloudBackParent").onclick=renderParentDashboard;
    host.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function renderCloudAccount(){
    const body=document.getElementById("cloudAccountBody");if(!body)return;
    if(currentUser){
      const role=currentProfile?.role||"student";
      if(role==="parent"){
        body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Parent dashboard</h3><p><b>${esc(currentProfile?.display_name||"Parent")}</b></p><p class="cloud-small">${esc(currentUser.email||"")}</p><div id="cloudParentStudents"></div><div class="cloud-link-box"><h4>Link a student</h4><p class="cloud-small">Enter the one-time code shown on the student's LevelUp10 account.</p><input id="cloudRedeemCode" class="cloud-code-input" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="AB12CD34"><button id="cloudRedeemParentCode" class="cloud-primary" type="button">LINK STUDENT</button></div><div id="cloudMessage" class="cloud-message"></div><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;
        document.getElementById("cloudRedeemParentCode").onclick=redeemParentCode;document.getElementById("cloudSignOut").onclick=signOut;renderParentDashboard();return;
      }
      if(role==="teacher"){
        body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Teacher account</h3><p><b>${esc(currentProfile?.display_name||"Teacher")}</b></p><p class="cloud-small">Teacher classes arrive in V0.23.2. This account will not create student progress.</p><div id="cloudMessage" class="cloud-message"></div><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;document.getElementById("cloudSignOut").onclick=signOut;return;
      }
      body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Student cloud account</h3><p><b>${esc(currentProfile?.display_name||"Student")}</b></p><p class="cloud-small">${esc(currentUser.email||"")}</p><p class="cloud-small"><b>LevelUp10 ID:</b> ${esc(currentIdentity?.levelup10_id||"—")}</p><div class="cloud-link-box"><h4>Connect Parent/Carer</h4><p class="cloud-small">Generate a private one-time code for your parent/carer.</p><button id="cloudGenerateParentCode" class="cloud-primary" type="button">GENERATE PARENT CODE</button><div id="cloudParentCode"></div></div><div class="cloud-safe-note">Progress is saved to this student account. Parent/carer access is read-only.</div><div id="cloudMessage" class="cloud-message ${cloudLoadState==="loaded"?"good":cloudLoadState==="failed"?"error":""}">${!navigator.onLine?"Offline copy active":cloudLoadState==="loaded"?"Cloud progress loaded ✓":cloudLoadState==="failed"?`Cloud load failed: ${esc(cloudLoadError)}`:"Checking cloud progress…"}</div><button id="cloudSaveNow" class="cloud-primary" type="button">SAVE NOW</button><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;
      document.getElementById("cloudGenerateParentCode").onclick=generateParentCode;document.getElementById("cloudSaveNow").onclick=async()=>{message("Saving…");await saveNow();message("Cloud save complete ✓","good")};document.getElementById("cloudSignOut").onclick=signOut;return;
    }
    body.innerHTML=`<div class="cloud-tabs"><button id="cloudTabSignIn" class="active" type="button">Sign in</button><button id="cloudTabCreate" type="button">Create account</button></div><div id="cloudForm"></div>`;showSignInForm();document.getElementById("cloudTabSignIn").onclick=showSignInForm;document.getElementById("cloudTabCreate").onclick=showCreateForm;
  }
  function activateTab(create){document.getElementById("cloudTabSignIn")?.classList.toggle("active",!create);document.getElementById("cloudTabCreate")?.classList.toggle("active",create)}
  function showSignInForm(){activateTab(false);const f=document.getElementById("cloudForm");if(!f)return;f.innerHTML='<label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="current-password" minlength="8"></label><button id="cloudSignIn" class="cloud-primary" type="button">SIGN IN</button><div id="cloudMessage" class="cloud-message"></div>';document.getElementById("cloudSignIn").onclick=()=>{const e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value;if(!e||p.length<8)return message("Enter your email and password (8+ characters).","error");signIn(e,p)}}
  function showCreateForm(){activateTab(true);const f=document.getElementById("cloudForm");if(!f)return;const n=document.getElementById("profileName")?.textContent?.trim()||"Learner";window.gcseBoostPendingAvatar="🎓";const avatars=["🎓","🚀","⭐","🦊","🐼","🦁"];f.innerHTML=`<label class="cloud-label">Account type<select id="cloudRole" class="cloud-role-select"><option value="student">Student</option><option value="parent">Parent</option><option value="teacher">Teacher</option></select></label><label class="cloud-label"><span id="cloudNameLabel">Learner name</span><input id="cloudDisplayName" type="text" maxlength="24" value="${esc(n)}" autocomplete="nickname"></label><div id="cloudAvatarBlock" class="cloud-label">Choose an avatar<div class="cloud-avatar-picks">${avatars.map((a,i)=>`<button type="button" class="cloud-avatar-pick ${i===0?"selected":""}" data-avatar="${a}">${a}</button>`).join("")}</div></div><label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="new-password" minlength="8"></label><button id="cloudCreate" class="cloud-primary" type="button">CREATE STUDENT ACCOUNT</button><div id="cloudMessage" class="cloud-message"></div><p id="cloudRoleHelp" class="cloud-small">Learner progress follows this account across devices.</p>`;f.querySelectorAll(".cloud-avatar-pick").forEach(b=>b.onclick=()=>{f.querySelectorAll(".cloud-avatar-pick").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");window.gcseBoostPendingAvatar=b.dataset.avatar});const roleEl=document.getElementById("cloudRole"),btn=document.getElementById("cloudCreate"),label=document.getElementById("cloudNameLabel"),help=document.getElementById("cloudRoleHelp"),avatar=document.getElementById("cloudAvatarBlock");const refreshRole=()=>{const r=roleEl.value;label.textContent=r==="student"?"Student name":r==="parent"?"Parent name":"Teacher name";btn.textContent=`CREATE ${r.toUpperCase()} ACCOUNT`;help.textContent=r==="student"?"Student progress follows this account across devices.":r==="parent"?"Parent accounts will link to learner accounts without creating a second copy of progress.":"Teacher accounts will manage test classes and read-only learner progress.";avatar.style.display=r==="student"?"block":"none"};roleEl.onchange=refreshRole;refreshRole();btn.onclick=()=>{const n=document.getElementById("cloudDisplayName").value.trim(),e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value,r=roleEl.value;if(!n||!e||p.length<8)return message("Enter a name, email and password of at least 8 characters.","error");signUp(e,p,n,r)}}
  async function showCloudAccount(){closeCloudAccount();const o=document.createElement("div");o.id="cloudAccountOverlay";o.className="cloud-overlay";o.innerHTML='<div class="cloud-panel" role="dialog" aria-modal="true" aria-label="Cloud account"><div class="cloud-head"><div><b>☁️ Cloud Account</b><small>V0.23.1.5</small></div><button id="cloudClose" type="button" aria-label="Close">×</button></div><div id="cloudAccountBody"><p>Checking connection…</p></div></div>';document.body.appendChild(o);document.getElementById("cloudClose").onclick=closeCloudAccount;o.addEventListener("click",e=>{if(e.target===o)closeCloudAccount()});try{await loadCloudIdentity();renderCloudAccount()}catch(e){console.warn("LevelUp10 platform check failed",e);cloudLoadState="failed";cloudLoadError=e?.message||String(e);const body=document.getElementById("cloudAccountBody");if(body)body.innerHTML=`<div class="cloud-connected-card"><h3>Platform connection needs attention</h3><p class="cloud-small">Your existing GCSE progress on this device is still safe.</p><div class="cloud-message error">${esc(cloudLoadError)}</div><button id="cloudRetry" class="cloud-primary" type="button">TRY AGAIN</button><button id="cloudRecoverySignOut" class="cloud-secondary" type="button">SIGN OUT / USE ANOTHER ACCOUNT</button><p class="cloud-small">Use Sign Out if this account was deleted, was created with the wrong account type, or you need to switch accounts.</p></div>`;document.getElementById("cloudRetry")?.addEventListener("click",showCloudAccount);document.getElementById("cloudRecoverySignOut")?.addEventListener("click",recoverySignOut)}}
  async function init(){ensureUi();if(!window.supabase?.createClient){setStatus("Offline / cloud unavailable",false);return}client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{const next=session?.user?.id||null;if(next!==currentUser?.id)loadedUserId=null;await loadCloudIdentity(true)},0)});window.addEventListener("online",()=>{if(currentUser){loadCloudIdentity(true).then(()=>{if(pendingSave)saveNow()})}});try{await loadCloudIdentity(true)}catch(e){console.warn("Cloud account check failed",e)}}
  window.showCloudAccount=showCloudAccount;window.addEventListener("DOMContentLoaded",init);
})();
