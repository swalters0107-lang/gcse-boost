/* LevelUp10 V0.25.0 — Friend Battles MVP
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
      window.gcseBoostCloudStudentReady=true;
      cloudLoadState="loaded";
      setStatus(currentProfile?.display_name||currentUser.email||"Synced",true);
      setTimeout(()=>window.gcseBoostStartBaselineIfNeeded?.(),80);
      setTimeout(renderStudentClassesHome,120);
    }catch(e){cloudLoadState="failed";cloudLoadError=e?.message||String(e);console.warn("Cloud load failed",e);setStatus("Cloud load failed",false)}finally{syncing=false}
    if(newLearnerInitialised){newLearnerInitialised=false;setTimeout(saveNow,100)}
  }
  async function loadCloudIdentity(forceProgress=false){
    if(!client)return;const {data:{session}}=await client.auth.getSession();currentUser=session?.user||null;
    if(!currentUser){currentProfile=null;currentIdentity=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;setStatus("Not signed in",false);return}
    await fetchProfile();if(!currentProfile)throw new Error("No LevelUp10 profile exists for this account");await fetchLevelUp10Identity();const role=currentProfile?.role||"student";if(role==="student"||role==="learner"){await ensureLevelUp10Platform();setStatus(currentProfile?.display_name||currentUser.email||"Connected",true);await loadCloudProgress(forceProgress);}else{platformReady=true;loadedUserId=null;setStatus(`${currentProfile?.display_name||currentUser.email} · ${role}`,true);}routeAccountShell();
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
  window.gcseCloudSaveNow=saveNow;

  async function signIn(email,password){message("Signing in…");const {error}=await client.auth.signInWithPassword({email,password});if(error)return message(error.message,"error");loadedUserId=null;await loadCloudIdentity(true);renderCloudAccount()}
  async function signUp(email,password,displayName,requestedRole="student"){message(`Creating ${requestedRole} account…`);const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||"Learner",avatar:window.gcseBoostPendingAvatar||"🎓",requested_role:requestedRole}}});if(error)return message(error.message,"error");if(!data.session)return message(`Account created as ${requestedRole}. Check your email to confirm it, then sign in.`,"good");loadedUserId=null;await fetchProfile();if(!currentProfile)return message("Account authentication was created, but the LevelUp10 profile is missing. Please sign out and try again.","error");if(currentProfile.role!==requestedRole){console.error("LevelUp10 role verification failed",{requestedRole,actualRole:currentProfile.role});return message(`Account role setup failed: requested ${requestedRole}, database returned ${currentProfile.role}. Run the V0.23.2.1 Supabase migration before creating accounts.`,"error")}await loadCloudIdentity(true);renderCloudAccount()}
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

  function closeSocialHub(){document.getElementById("socialHubOverlay")?.remove()}
  function socialMessage(text,type=""){const el=document.getElementById("socialHubMessage");if(el){el.textContent=text||"";el.className=`social-message ${type}`}}
  async function socialRpc(name,args={}){const {data,error}=await client.rpc(name,args);if(error)throw error;return data}
  function socialPerson(row,actions=""){return `<div class="social-person"><span class="social-avatar">${esc(row.avatar||"🎓")}</span><span class="social-person-copy"><b>${esc(row.display_name||"Student")}</b></span>${actions}</div>`}
  function battleTime(seconds){const n=Math.max(0,Number(seconds)||0),m=Math.floor(n/60),s=n%60;return m?`${m}m ${s}s`:`${s}s`}
  function battleDashboardHTML(data,friends){
    const incoming=Array.isArray(data?.incoming)?data.incoming:[],outgoing=Array.isArray(data?.outgoing)?data.outgoing:[],active=Array.isArray(data?.active)?data.active:[],completed=Array.isArray(data?.completed)?data.completed:[],options=window.gcseGetBattleOptions?.()||{};
    const subjects=Object.keys(options),friendOptions=friends.map((r,i)=>`<option value="${i}">${esc(r.avatar||"🎓")} ${esc(r.display_name||"Friend")}</option>`).join(""),subjectOptions=subjects.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("");
    return `<section class="social-card battle-card"><div class="social-title"><div><small>FRIEND BATTLES</small><h2>⚔️ Head-to-Head</h2></div><span class="battle-live">LIVE</span></div><p>Challenge a friend to the same 8 curriculum-safe questions. Highest score wins; fastest time breaks a tie.</p>
      ${friends.length&&subjects.length?`<div class="battle-create"><label>FRIEND<select id="battleFriend">${friendOptions}</select></label><label>SUBJECT<select id="battleSubject">${subjectOptions}</select></label><label>TOPIC<select id="battleCategory"></select></label><button id="battleCreate" type="button">SEND CHALLENGE</button></div>`:'<p class="social-muted">Add an accepted friend before creating a battle.</p>'}
      ${incoming.length?`<div class="battle-section"><b>CHALLENGES FOR YOU</b>${incoming.map((r,i)=>`<div class="battle-row"><span>${esc(r.avatar||"🎓")}</span><div><strong>${esc(r.display_name||"Friend")}</strong><small>${esc(r.subject)} · ${esc(r.category)}</small></div><div class="battle-actions"><button data-battle-accept="${i}">ACCEPT</button><button class="secondary" data-battle-decline="${i}">DECLINE</button></div></div>`).join("")}</div>`:""}
      ${active.length?`<div class="battle-section"><b>ACTIVE BATTLES</b>${active.map((r,i)=>`<div class="battle-row"><span>${esc(r.avatar||"🎓")}</span><div><strong>${esc(r.display_name||"Friend")}</strong><small>${esc(r.subject)} · ${esc(r.category)}${r.my_submitted?` · Your score ${Number(r.my_score)||0}/8`:""}</small></div>${r.my_submitted?'<span class="social-waiting">WAITING</span>':`<button data-battle-start="${i}">PLAY →</button>`}</div>`).join("")}</div>`:""}
      ${outgoing.length?`<div class="battle-section"><b>WAITING FOR ACCEPTANCE</b>${outgoing.map((r,i)=>`<div class="battle-row"><span>${esc(r.avatar||"🎓")}</span><div><strong>${esc(r.display_name||"Friend")}</strong><small>${esc(r.subject)} · ${esc(r.category)}</small></div><button class="secondary" data-battle-cancel="${i}">CANCEL</button></div>`).join("")}</div>`:""}
      ${completed.length?`<div class="battle-section"><b>RECENT RESULTS</b>${completed.map((r,i)=>`<div class="battle-result ${esc(r.outcome||"")}"><span>${r.outcome==="won"?"🏆":r.outcome==="draw"?"🤝":"⚔️"}</span><div><strong>${esc(r.display_name||"Friend")} · ${r.outcome==="won"?"Won":r.outcome==="draw"?"Draw":"Lost"}</strong><small>You ${Number(r.my_score)||0}/8 in ${battleTime(r.my_seconds)} · Friend ${Number(r.opponent_score)||0}/8 in ${battleTime(r.opponent_seconds)}</small></div><button class="secondary" data-battle-rematch="${i}">REMATCH</button></div>`).join("")}</div>`:""}
    </section>`;
  }
  async function renderSocialHub(){
    const host=document.getElementById("socialHubBody");if(!host)return;
    host.innerHTML='<div class="social-loading">Loading your private Friends space…</div>';
    let data;
    try{data=await socialRpc("get_my_social_dashboard")}catch(e){host.innerHTML=`<div class="social-empty"><h2>Social setup required</h2><p>${esc(e.message||String(e))}</p><p>Run the V0.24.0 Social Foundations SQL supplied with this build.</p></div>`;return}
    if(typeof data==="string"){try{data=JSON.parse(data)}catch(_){data={}}}data=data||{};window.gcseSocialDashboard=data;
    const incoming=Array.isArray(data.incoming)?data.incoming:[],outgoing=Array.isArray(data.outgoing)?data.outgoing:[],friends=Array.isArray(data.friends)?data.friends:[],blocked=Array.isArray(data.blocked)?data.blocked:[],leaders=Array.isArray(data.leaderboard)?data.leaderboard:[];
    if(!data.social_enabled){host.innerHTML=`<div class="social-empty social-locked"><div>🔒</div><h2>Friends is currently locked</h2><p>${data.parent_controlled?"A linked parent/carer can enable Friends from their Parent Dashboard.":"Connect a parent/carer to enable safeguarded social features."}</p><p>Your profile, email and learning data remain private.</p></div>`;return}
    let battles=null,battleError="";try{battles=await socialRpc("get_my_battle_dashboard");if(typeof battles==="string")battles=JSON.parse(battles)}catch(e){battleError=e.message||String(e)}
    host.innerHTML=`<div id="socialHubMessage" class="social-message"></div>
      <section class="social-safety"><b>🛡️ Private Friends</b><span>Invite codes only · no public search · no messaging</span></section>
      <section class="social-card"><div class="social-title"><div><small>ADD A FRIEND</small><h2>Private invite code</h2></div><button id="socialGenerateCode" type="button">CREATE CODE</button></div><p>Share a one-time code with someone you know. It expires after 24 hours.</p><div id="socialCodeResult"></div><div class="social-code-entry"><input id="socialFriendCode" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="FRIEND CODE"><button id="socialRedeemCode" type="button">SEND REQUEST</button></div></section>
      ${incoming.length?`<section class="social-card"><small>FRIEND REQUESTS</small><h2>Waiting for you</h2>${incoming.map((r,i)=>socialPerson(r,`<div class="social-actions"><button data-social-accept="${i}">ACCEPT</button><button class="secondary" data-social-decline="${i}">DECLINE</button></div>`)).join("")}</section>`:""}
      <section class="social-card"><small>MY FRIENDS</small><h2>${friends.length} friend${friends.length===1?"":"s"}</h2>${friends.length?friends.map((r,i)=>socialPerson(r,`<div class="social-actions"><button class="secondary" data-social-remove="${i}">REMOVE</button><button class="danger" data-social-block="${i}">BLOCK</button></div>`)).join(""):'<p class="social-muted">No friends connected yet.</p>'}${outgoing.length?`<div class="social-pending"><b>Sent requests</b>${outgoing.map(r=>socialPerson(r,'<span class="social-waiting">WAITING</span>')).join("")}</div>`:""}</section>
      <section class="social-card"><div class="social-title"><div><small>WEEKLY LEADERBOARD</small><h2>Friends only</h2></div>${data.leaderboard_allowed?`<button id="socialLeaderboardToggle" type="button" class="${data.leaderboard_opt_in?"active":""}">${data.leaderboard_opt_in?"OPTED IN ✓":"OPT IN"}</button>`:'<span class="social-waiting">PARENT LOCKED</span>'}</div><p>10 activity points for each question answered this week. Only opted-in friends appear.</p>${data.leaderboard_opt_in?(leaders.length?`<div class="social-leaderboard">${leaders.map((r,i)=>`<div class="social-rank ${r.is_me?"is-me":""}"><strong>${i+1}</strong><span>${esc(r.avatar||"🎓")}</span><b>${esc(r.display_name||"Student")}${r.is_me?" · You":""}</b><em>${Number(r.weekly_points)||0} pts</em></div>`).join("")}</div>`:'<p class="social-muted">No opted-in friends yet.</p>'):'<p class="social-muted">Opt in to join your private friends leaderboard.</p>'}</section>
      ${battles?battleDashboardHTML(battles,friends):`<section class="social-card social-battles-locked"><small>DATABASE UPDATE REQUIRED</small><h2>⚔️ Head-to-Head Battles</h2><p>${esc(battleError||"Run the V0.25.0 Friend Battles SQL supplied with this build.")}</p></section>`}
      ${blocked.length?`<details class="social-card"><summary>Blocked students (${blocked.length})</summary>${blocked.map((r,i)=>socialPerson(r,`<button class="secondary" data-social-unblock="${i}">UNBLOCK</button>`)).join("")}</details>`:""}`;
    document.getElementById("socialGenerateCode").onclick=async()=>{try{const code=await socialRpc("generate_friend_code");document.getElementById("socialCodeResult").innerHTML=`<div class="social-code">${esc(code)}</div><small>Expires in 24 hours · one use only</small>`}catch(e){socialMessage(e.message,"error")}};
    document.getElementById("socialRedeemCode").onclick=async()=>{const input=document.getElementById("socialFriendCode"),code=(input.value||"").trim().toUpperCase();if(code.length!==8)return socialMessage("Enter the 8-character friend code.","error");try{await socialRpc("redeem_friend_code",{entered_code:code});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}};
    host.querySelectorAll("[data-social-accept]").forEach(b=>b.onclick=async()=>{try{await socialRpc("respond_friend_invite",{target_invite_id:incoming[Number(b.dataset.socialAccept)].invite_id,accept_invite:true});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
    host.querySelectorAll("[data-social-decline]").forEach(b=>b.onclick=async()=>{try{await socialRpc("respond_friend_invite",{target_invite_id:incoming[Number(b.dataset.socialDecline)].invite_id,accept_invite:false});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
    host.querySelectorAll("[data-social-remove]").forEach(b=>b.onclick=async()=>{const r=friends[Number(b.dataset.socialRemove)];if(!confirm(`Remove ${r.display_name||"this friend"}?`))return;try{await socialRpc("remove_friend",{target_student_id:r.student_id});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
    host.querySelectorAll("[data-social-block]").forEach(b=>b.onclick=async()=>{const r=friends[Number(b.dataset.socialBlock)];if(!confirm(`Block ${r.display_name||"this student"}? They will be removed from your Friends list.`))return;try{await socialRpc("block_student",{target_student_id:r.student_id});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
    host.querySelectorAll("[data-social-unblock]").forEach(b=>b.onclick=async()=>{const r=blocked[Number(b.dataset.socialUnblock)];try{await socialRpc("unblock_student",{target_student_id:r.student_id});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
    const toggle=document.getElementById("socialLeaderboardToggle");if(toggle)toggle.onclick=async()=>{try{await socialRpc("set_my_leaderboard_opt_in",{enabled:!data.leaderboard_opt_in});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}};
    if(battles){
      const battleIncoming=Array.isArray(battles.incoming)?battles.incoming:[],battleOutgoing=Array.isArray(battles.outgoing)?battles.outgoing:[],battleActive=Array.isArray(battles.active)?battles.active:[],battleCompleted=Array.isArray(battles.completed)?battles.completed:[],battleOptions=window.gcseGetBattleOptions?.()||{};
      const subjectSelect=document.getElementById("battleSubject"),categorySelect=document.getElementById("battleCategory"),fillBattleCategories=()=>{if(!subjectSelect||!categorySelect)return;categorySelect.innerHTML=(battleOptions[subjectSelect.value]||[]).map(x=>`<option value="${esc(x.value)}">${esc(x.label)} · ${Number(x.count)||0} questions</option>`).join("")};
      if(subjectSelect){subjectSelect.onchange=fillBattleCategories;fillBattleCategories()}
      const sendBattle=async(friend,subject,category)=>{if(!friend)throw Error("Choose a friend");if(typeof window.gcseCreateBattleQuestionSet!=="function")throw Error("Update the LevelUp10 app before creating a battle");const keys=window.gcseCreateBattleQuestionSet(subject,category);await socialRpc("create_friend_battle",{target_student_id:friend.student_id,battle_subject:subject,battle_category:category,battle_question_keys:keys})};
      const createButton=document.getElementById("battleCreate");if(createButton)createButton.onclick=async()=>{const friend=friends[Number(document.getElementById("battleFriend")?.value||0)],subject=subjectSelect?.value,category=categorySelect?.value||"All";createButton.disabled=true;try{await sendBattle(friend,subject,category);await renderSocialHub()}catch(e){socialMessage(e.message,"error");createButton.disabled=false}};
      host.querySelectorAll("[data-battle-accept]").forEach(b=>b.onclick=async()=>{try{await socialRpc("respond_friend_battle",{target_battle_id:battleIncoming[Number(b.dataset.battleAccept)].battle_id,accept_battle:true});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
      host.querySelectorAll("[data-battle-decline]").forEach(b=>b.onclick=async()=>{try{await socialRpc("respond_friend_battle",{target_battle_id:battleIncoming[Number(b.dataset.battleDecline)].battle_id,accept_battle:false});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
      host.querySelectorAll("[data-battle-cancel]").forEach(b=>b.onclick=async()=>{try{await socialRpc("cancel_friend_battle",{target_battle_id:battleOutgoing[Number(b.dataset.battleCancel)].battle_id});await renderSocialHub()}catch(e){socialMessage(e.message,"error")}});
      host.querySelectorAll("[data-battle-start]").forEach(b=>b.onclick=async()=>{b.disabled=true;try{let battle=await socialRpc("start_friend_battle",{target_battle_id:battleActive[Number(b.dataset.battleStart)].battle_id});if(typeof battle==="string")battle=JSON.parse(battle);closeSocialHub();window.gcseStartFriendBattle?.(battle)}catch(e){socialMessage(e.message,"error");b.disabled=false}});
      host.querySelectorAll("[data-battle-rematch]").forEach(b=>b.onclick=async()=>{const row=battleCompleted[Number(b.dataset.battleRematch)],friend={student_id:row.student_id};b.disabled=true;try{await sendBattle(friend,row.subject,row.category);await renderSocialHub()}catch(e){socialMessage(e.message,"error");b.disabled=false}});
    }
  }
  async function showSocialHub(){
    if(!client||!currentUser||!currentProfile||!(["student","learner"].includes(currentProfile.role))){if(typeof window.showCloudAccount==="function")window.showCloudAccount();return}
    closeSocialHub();const o=document.createElement("div");o.id="socialHubOverlay";o.className="social-overlay";o.innerHTML=`<main class="social-page"><header class="social-head"><div><small>LEVELUP10 SOCIAL</small><h1>👥 Friends</h1><p>Private connections and weekly learning.</p></div><button id="socialClose" type="button">← PROFILE</button></header><div id="socialHubBody"></div></main>`;document.body.appendChild(o);document.getElementById("socialClose").onclick=closeSocialHub;await renderSocialHub();window.scrollTo(0,0)
  }
  window.showSocialHub=showSocialHub;
  window.gcseCompleteFriendBattle=async function(battleId,answers){let result=await socialRpc("complete_friend_battle",{target_battle_id:battleId,submitted_results:answers});if(typeof result==="string")result=JSON.parse(result);return result||{}};
  async function renderStudentClassesHome(){
    const host=document.getElementById("studentClassesHomeBody");
    if(!host)return;
    if(!client||!currentUser||!currentProfile||!(["student","learner"].includes(currentProfile.role))){
      host.innerHTML='<p class="student-classes-empty">Sign in to your student account to see your classes.</p>';return;
    }
    host.innerHTML='<p class="student-classes-loading">Loading your classes…</p>';
    let {data,error}=await client.rpc("get_student_class_lessons");
    if(error){({data,error}=await client.rpc("get_student_classes"));}
    if(error){host.innerHTML=`<p class="student-classes-empty">Classes are unavailable until the database update is installed.</p>`;return}
    const rows=Array.isArray(data)?data:[];
    window.gcseStudentClassRows=rows;
    const cards=rows.map((r,i)=>`<button type="button" class="student-class-card student-class-open" data-student-class="${i}"><span class="student-class-icon">🏫</span><span><b>${esc(r.class_name||"Class")}</b><small>${r.subject?esc(r.subject):"GCSE Boost class"}${r.teacher_name?" · "+esc(r.teacher_name):""}</small>${r.lesson_title?`<small class="student-class-lesson">Lesson: ${esc(r.lesson_title)}</small>`:""}</span><strong>${r.lesson_title?"OPEN →":"JOINED ✓"}</strong></button>`).join("");
    host.innerHTML=(cards||'<p class="student-classes-empty">You have not joined a class yet.</p>')+`<div class="student-class-join"><input id="homeClassJoinCode" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="Class code"><button id="homeJoinClass" type="button">JOIN A CLASS</button><div id="homeClassJoinResult"></div></div>`;
    host.querySelectorAll("[data-student-class]").forEach(b=>b.onclick=()=>showStudentClassPage(Number(b.dataset.studentClass)));
    const btn=document.getElementById("homeJoinClass");
    if(btn)btn.onclick=async()=>{
      const input=document.getElementById("homeClassJoinCode"),code=(input?.value||"").trim().toUpperCase(),out=document.getElementById("homeClassJoinResult");
      if(!code||code.length<6){if(out)out.textContent="Enter the class code from your teacher.";return}
      btn.disabled=true;btn.textContent="JOINING…";
      const res=await client.rpc("join_class_with_code",{entered_code:code});
      btn.disabled=false;btn.textContent="JOIN A CLASS";
      if(res.error){if(out)out.textContent=res.error.message;return}
      await renderStudentClassesHome();
    };
  }
  window.gcseRenderStudentClassesHome=renderStudentClassesHome;


  function showStudentClassPage(index){
    const r=(window.gcseStudentClassRows||[])[index];if(!r)return;
    const overlay=document.createElement("div");overlay.className="student-class-overlay";
    overlay.innerHTML=`<div class="student-class-page"><button class="cloud-secondary" id="studentClassClose" type="button">← BACK HOME</button><small>MY CLASS</small><h2>🏫 ${esc(r.class_name||"Class")}</h2><p>${r.subject?esc(r.subject):"GCSE Boost"} · ${esc(r.teacher_name||"Teacher")}</p>${r.lesson_title?`<section class="student-current-lesson"><small>CURRENT LESSON</small><h3>${esc(r.lesson_title)}</h3><p>${esc(r.lesson_topic||"Adaptive practice")} · 8 questions · about 10 minutes</p><button id="studentStartClassLesson" type="button">START LESSON</button></section>`:`<section class="student-current-lesson"><h3>No lesson set yet</h3><p>Your teacher has not set a class lesson yet.</p></section>`}</div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#studentClassClose").onclick=()=>overlay.remove();
    const startBtn=overlay.querySelector("#studentStartClassLesson");if(startBtn)startBtn.onclick=()=>{overlay.remove();if(typeof window.gcseStartClassLesson==="function")window.gcseStartClassLesson(r.subject||"Maths",r.lesson_topic||"All",r.lesson_title||r.lesson_topic||"Adaptive practice",r.class_name||"Class",r.class_id||null,r.lesson_id||null)};
  }
  async function joinClassWithCode(){
    const input=document.getElementById("cloudClassJoinCode");
    const btn=document.getElementById("cloudJoinClass");
    const code=(input?.value||"").trim().toUpperCase();
    if(!code||code.length<6)return message("Enter the class code from your teacher.","error");
    if(btn){btn.disabled=true;btn.textContent="JOINING…"}
    message("Joining class…");
    const {data,error}=await client.rpc("join_class_with_code",{entered_code:code});
    if(btn){btn.disabled=false;btn.textContent="JOIN CLASS"}
    if(error)return message(error.message,"error");
    if(input)input.value="";
    const out=document.getElementById("cloudClassJoinResult");
    if(out)out.innerHTML='<div class="cloud-safe-note cloud-class-joined">Class joined ✓</div>';
    message("Class joined ✓","good");
    renderStudentClassesHome();
    return data;
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
    const rows=subjects.map(s=>`<div class="cloud-progress-subject ${s.attempts?"has-evidence":""}"><div><b>${esc(s.subject)}</b><strong>${esc(s.level)}${s.attempts?" · "+s.progress+"%":""}</strong></div><div class="cloud-progress-bar"><i style="width:${Math.max(0,Math.min(100,s.progress||0))}%"></i></div><small>${s.attempts?s.attempts+" answers recorded · "+s.accuracy+"% recent accuracy · Estimate "+s.gradeLabel:"No learning evidence yet"}</small></div>`).join("");
    const host=document.getElementById("cloudParentStudents"); if(!host)return;
    host.innerHTML=`<div class="cloud-progress-head"><button id="cloudBackParent" class="cloud-secondary" type="button">← BACK TO PARENT DASHBOARD</button><h3>${esc(r.display_name||"Student")} · Full Progress</h3><p class="cloud-small">Read-only view of the same learning evidence used by the student app.</p></div><div class="cloud-stat-grid cloud-progress-summary"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div><div class="cloud-progress-list">${rows}</div>`;
    document.getElementById("cloudBackParent").onclick=renderParentDashboard;
    host.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function closeRoleShell(){document.getElementById("levelup10RoleShell")?.remove()}
  function showRoleShell(){
    if(!currentUser||!currentProfile)return closeRoleShell();
    const role=currentProfile.role||"student";
    if(role==="student"||role==="learner")return closeRoleShell();

    let shell=document.getElementById("levelup10RoleShell");
    if(!shell){
      shell=document.createElement("div");
      shell.id="levelup10RoleShell";
      shell.className="levelup10-role-shell";
      document.body.appendChild(shell);
    }

    // Role shell deliberately has no close button. Parent/teacher accounts do not
    // enter the learner Home/Profile/Shop/Mission UI.
    if(role==="parent"){
      shell.innerHTML=`<main class="role-shell-page"><header class="role-shell-head"><div><small>LEVELUP10</small><h1>Parent Dashboard</h1><p>${esc(currentProfile.display_name||"Parent")} · Read-only learner progress</p></div><button id="roleShellSignOut" type="button">SIGN OUT</button></header><section id="roleParentStudents" class="role-shell-content"><p>Loading linked students…</p></section><section class="role-shell-link"><h2>Link a student</h2><p>Enter the one-time Parent/Carer code shown on the student's LevelUp10 account.</p><input id="roleRedeemCode" class="cloud-code-input" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="AB12CD34"><button id="roleRedeemParentCode" class="cloud-primary" type="button">LINK STUDENT</button><div id="cloudMessage" class="cloud-message"></div></section></main>`;
      document.getElementById("roleShellSignOut").onclick=signOutFromRoleShell;
      document.getElementById("roleRedeemParentCode").onclick=async()=>{
        const input=document.getElementById("roleRedeemCode"),code=input?.value?.trim();
        if(!code||code.length<6)return message("Enter the connection code from the student.","error");
        message("Linking student…");
        const {error}=await client.rpc("redeem_parent_link_code",{entered_code:code});
        if(error)return message(error.message,"error");
        if(input)input.value="";message("Student linked ✓","good");await renderRoleParentDashboard();
      };
      renderRoleParentDashboard();
    }else{
      shell.innerHTML=`<main class="role-shell-page"><header class="role-shell-head"><div><small>LEVELUP10</small><h1>Teacher Dashboard</h1><p>${esc(currentProfile.display_name||"Teacher")} · Classes & read-only progress</p></div><button id="roleShellSignOut" type="button">SIGN OUT</button></header><section id="roleTeacherDashboard" class="role-shell-content"><p>Loading classes…</p></section></main>`;
      document.getElementById("roleShellSignOut").onclick=signOutFromRoleShell;
      renderRoleTeacherDashboard();
    }
  }

  async function renderRoleParentDashboard(){
    const host=document.getElementById("roleParentStudents");if(!host)return;
    host.innerHTML='<p class="cloud-small">Loading linked students…</p>';
    const [{data,error},{data:socialData,error:socialError}]=await Promise.all([client.rpc("get_parent_student_summaries"),client.rpc("get_parent_social_preferences")]);
    if(error){host.innerHTML=`<div class="cloud-message error">${esc(error.message)}</div>`;return}
    const rows=Array.isArray(data)?data:[];
    const socialRows=Array.isArray(socialData)?socialData:[],socialById=new Map(socialRows.map(x=>[x.student_id,x]));
    window.gcseParentRows=rows;
    if(!rows.length){host.innerHTML='<div class="role-shell-empty"><h2>No students linked yet</h2><p>Ask the student to generate a Parent/Carer code, then enter it below.</p></div>';return}
    host.innerHTML=(socialError?`<div class="cloud-message error">Social controls require the V0.24.0 SQL update.</div>`:"")+rows.map((r,i)=>{
      const x=summariseState(r.state,r.xp);
      const social=socialById.get(r.student_id)||{student_id:r.student_id,social_enabled:false,leaderboard_allowed:false,leaderboard_opt_in:false};r.social=social;
      const active=(x.subjects||[]).filter(s=>s.attempts>0);
      const preview=active.slice(0,5).map(s=>`<div class="cloud-subject-row"><span><b>${esc(s.subject)}</b><small>${s.attempts} answers · ${s.accuracy}% recent accuracy</small></span><strong>${esc(s.level)} · ${s.progress}%</strong></div>`).join("");
      return `<article class="cloud-student-card role-student-card"><div><b>${esc(r.display_name||"Student")}</b><span>${esc(r.avatar||"🎓")}</span></div><div class="cloud-stat-grid"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div>${preview?`<div class="cloud-subject-preview">${preview}</div>`:""}${!socialError?`<section class="parent-social-controls"><div><small>SOCIAL SAFETY</small><h3>Friends & Leaderboard</h3><p>Private codes only. No public search or messaging.</p></div><button type="button" class="${social.social_enabled?"enabled":""}" data-parent-social="${i}">${social.social_enabled?"FRIENDS ON ✓":"ENABLE FRIENDS"}</button><button type="button" class="${social.leaderboard_allowed?"enabled":""}" data-parent-leaderboard="${i}" ${social.social_enabled?"":"disabled"}>${social.leaderboard_allowed?"LEADERBOARD ALLOWED ✓":"ALLOW LEADERBOARD"}</button><small>${social.leaderboard_opt_in?"Student has opted into their friends-only leaderboard.":"Student is not currently visible on the leaderboard."}</small></section>`:""}<button class="cloud-secondary cloud-progress-btn" type="button" data-role-parent-row="${i}">VIEW FULL PROGRESS</button><p class="cloud-small">Read-only progress · Last updated ${r.updated_at?new Date(r.updated_at).toLocaleString():"—"}</p></article>`;
    }).join("");
    host.querySelectorAll("[data-role-parent-row]").forEach(btn=>btn.onclick=()=>showRoleParentProgress(Number(btn.dataset.roleParentRow)));
    host.querySelectorAll("[data-parent-social]").forEach(btn=>btn.onclick=async()=>{const r=rows[Number(btn.dataset.parentSocial)],s=r.social||{};btn.disabled=true;const {error}=await client.rpc("set_child_social_preferences",{target_student_id:r.student_id,allow_social:!s.social_enabled,allow_leaderboard:!s.social_enabled?s.leaderboard_allowed:false});if(error){message(error.message,"error");btn.disabled=false;return}await renderRoleParentDashboard()});
    host.querySelectorAll("[data-parent-leaderboard]").forEach(btn=>btn.onclick=async()=>{const r=rows[Number(btn.dataset.parentLeaderboard)],s=r.social||{};btn.disabled=true;const {error}=await client.rpc("set_child_social_preferences",{target_student_id:r.student_id,allow_social:true,allow_leaderboard:!s.leaderboard_allowed});if(error){message(error.message,"error");btn.disabled=false;return}await renderRoleParentDashboard()});
  }

  function showRoleParentProgress(index){
    const r=(window.gcseParentRows||[])[index];if(!r)return;
    const x=summariseState(r.state,r.xp),subjects=(x.subjects||[]);
    const host=document.getElementById("roleParentStudents");if(!host)return;
    const rows=subjects.map(s=>`<div class="cloud-progress-subject ${s.attempts?"has-evidence":""}"><div><b>${esc(s.subject)}</b><strong>${esc(s.level)}${s.attempts?" · "+s.progress+"%":""}</strong></div><div class="cloud-progress-bar"><i style="width:${Math.max(0,Math.min(100,s.progress||0))}%"></i></div><small>${s.attempts?s.attempts+" answers recorded · "+s.accuracy+"% recent accuracy · Estimate "+s.gradeLabel:"No learning evidence yet"}</small></div>`).join("");
    host.innerHTML=`<div class="cloud-progress-head"><button id="roleBackParent" class="cloud-secondary" type="button">← BACK TO PARENT DASHBOARD</button><h2>${esc(r.display_name||"Student")} · Full Progress</h2><p class="cloud-small">Read-only learning progress.</p></div><div class="cloud-stat-grid cloud-progress-summary"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div><div class="cloud-progress-list">${rows}</div>`;
    document.getElementById("roleBackParent").onclick=renderRoleParentDashboard;
    window.scrollTo(0,0);
  }


  async function renderRoleTeacherDashboard(){
    const host=document.getElementById("roleTeacherDashboard");if(!host)return;
    host.innerHTML='<p class="cloud-small">Loading classes…</p>';
    const {data,error}=await client.rpc("get_teacher_classes");
    if(error){host.innerHTML=`<div class="cloud-message error">${esc(error.message)}</div>`;return}
    const classes=Array.isArray(data)?data:[];
    window.gcseTeacherClasses=classes;
    host.innerHTML=`<div class="teacher-toolbar"><div><h2>My classes</h2><p class="cloud-small">Create a class, share its join code, then view student progress.</p></div><button id="teacherCreateClass" class="cloud-primary" type="button">+ CREATE CLASS</button></div>
      <div id="teacherClassList">${classes.length?classes.map((x,i)=>`<button class="teacher-class-card" type="button" data-teacher-class="${i}"><span><b>${esc(x.class_name||"Class")}</b><small>${x.subject?esc(x.subject)+" · ":""}${Number(x.student_count)||0} student${Number(x.student_count)===1?"":"s"}</small></span><strong>OPEN →</strong></button>`).join(""):'<div class="role-shell-empty"><h2>No classes yet</h2><p>Create your first class and LevelUp10 will generate a join code for your students.</p></div>'}</div>`;
    document.getElementById("teacherCreateClass").onclick=showTeacherCreateClass;
    host.querySelectorAll("[data-teacher-class]").forEach(b=>b.onclick=()=>showTeacherClass(Number(b.dataset.teacherClass)));
  }

  function showTeacherCreateClass(){
    const host=document.getElementById("roleTeacherDashboard");if(!host)return;
    host.innerHTML=`<button id="teacherBackClasses" class="cloud-secondary" type="button">← BACK</button><div class="teacher-form"><h2>Create a class</h2><label>Class name</label><input id="teacherClassName" class="cloud-code-input teacher-name-input" maxlength="80" placeholder="Year 11 Maths"><label>Subject</label><select id="teacherClassSubject" class="cloud-code-input teacher-name-input"><option value="">General / Mixed</option><option>Maths</option><option>English</option><option>Science</option><option>History</option><option>Geography</option><option>German</option><option>Drama</option><option>Citizenship</option><option>Sport Science</option><option>Catering</option><option>Spanish</option><option>RE</option></select><button id="teacherSaveClass" class="cloud-primary" type="button">CREATE CLASS</button><div id="teacherMessage" class="cloud-message"></div></div>`;
    document.getElementById("teacherBackClasses").onclick=renderRoleTeacherDashboard;
    document.getElementById("teacherSaveClass").onclick=async()=>{
      const name=document.getElementById("teacherClassName")?.value?.trim();
      const subject=document.getElementById("teacherClassSubject")?.value?.trim()||null;
      const msg=document.getElementById("teacherMessage");
      if(!name){if(msg){msg.textContent="Enter a class name.";msg.className="cloud-message error"}return}
      if(msg){msg.textContent="Creating class…";msg.className="cloud-message"}
      const {data,error}=await client.rpc("create_teacher_class",{class_name:name,class_subject:subject});
      if(error){if(msg){msg.textContent=error.message;msg.className="cloud-message error"}return}
      await renderRoleTeacherDashboard();
      const rows=window.gcseTeacherClasses||[],idx=rows.findIndex(x=>x.id===data);
      if(idx>=0)showTeacherClass(idx);
    };
  }

  function teacherClassOverview(rows){
    const now=Date.now(), day=86400000;
    const enriched=rows.map((r,i)=>{
      const x=summariseState(r.state,r.xp), active=(x.subjects||[]).filter(s=>Number(s.attempts)>0);
      const sorted=[...active].sort((a,b)=>(Number(b.progress)||0)-(Number(a.progress)||0));
      const strongest=sorted[0]||null, weakest=sorted.length>1?sorted[sorted.length-1]:(sorted[0]||null);
      const updated=r.updated_at?new Date(r.updated_at).getTime():0;
      const days=updated?Math.max(0,Math.floor((now-updated)/day)):null;
      const lowEvidence=active.length===0;
      const inactive=days==null||days>=14;
      const lowAccuracy=active.find(s=>Number(s.attempts)>=3&&Number(s.accuracy)<50)||null;
      let attention="";
      if(lowEvidence)attention="No learning evidence yet";
      else if(inactive)attention=days==null?"No recent activity recorded":`No activity for ${days} days`;
      else if(lowAccuracy)attention=`${lowAccuracy.subject}: ${Number(lowAccuracy.accuracy)||0}% recent accuracy`;
      return {r,i,x,active,strongest,weakest,updated,days,attention};
    });
    const mastery=enriched.map(e=>e.x.masteryAvg).filter(v=>v!=null&&Number.isFinite(Number(v))).map(Number);
    const avg=mastery.length?Math.round(mastery.reduce((a,b)=>a+b,0)/mastery.length):null;
    const recent=enriched.filter(e=>e.days!=null&&e.days<7).length;
    const attention=enriched.filter(e=>e.attention).length;
    const subjectMap={};
    enriched.forEach(e=>e.active.forEach(s=>{const k=s.subject||"Subject";(subjectMap[k]??=[]).push(Number(s.progress)||0)}));
    const subjectAverages=Object.entries(subjectMap).map(([subject,vals])=>({subject,avg:Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)})).sort((a,b)=>b.avg-a.avg);
    return {enriched,avg,recent,attention,strongest:subjectAverages[0]||null,weakest:subjectAverages.length>1?subjectAverages[subjectAverages.length-1]:(subjectAverages[0]||null)};
  }

  async function showTeacherClass(index){
    const cls=(window.gcseTeacherClasses||[])[index];if(!cls)return;
    const host=document.getElementById("roleTeacherDashboard");if(!host)return;
    host.innerHTML='<p class="cloud-small">Loading class…</p>';
    const [{data:students,error:se},{data:code,error:ce},{data:lessonRows,error:le}]=await Promise.all([
      client.rpc("get_teacher_class_students",{target_class_id:cls.id}),
      client.rpc("get_or_create_class_join_code",{target_class_id:cls.id}),
      client.rpc("get_teacher_class_lesson",{target_class_id:cls.id})
    ]);
    if(se||ce||le){host.innerHTML=`<button id="teacherBackClasses" class="cloud-secondary" type="button">← BACK</button><div class="cloud-message error">${esc((se||ce||le).message)}</div>`;document.getElementById("teacherBackClasses").onclick=renderRoleTeacherDashboard;return}
    const rows=Array.isArray(students)?students:[];
    window.gcseTeacherStudents=rows;window.gcseActiveTeacherClass=cls;
    const ov=teacherClassOverview(rows);
    const overview=rows.length?`<section class="teacher-overview"><div class="teacher-overview-title"><div><small>CLASS OVERVIEW</small><h3>At a glance</h3></div><span>Read-only learning evidence</span></div><div class="teacher-overview-grid"><div><strong>${ov.avg==null?"—":ov.avg+"%"}</strong><small>Overall mastery</small></div><div><strong>${ov.recent}/${rows.length}</strong><small>Active in 7 days</small></div><div><strong>${ov.strongest?esc(ov.strongest.subject):"—"}</strong><small>Strongest subject${ov.strongest?" · "+ov.strongest.avg+"%":""}</small></div><div><strong>${ov.weakest?esc(ov.weakest.subject):"—"}</strong><small>Developing subject${ov.weakest?" · "+ov.weakest.avg+"%":""}</small></div></div>${ov.attention?`<div class="teacher-attention-summary"><b>${ov.attention} student${ov.attention===1?"":"s"} to review</b><span>Based on recent activity or learning evidence.</span></div>`:`<div class="teacher-attention-summary clear"><b>No students currently flagged for review</b><span>Based on recent activity and learning evidence.</span></div>`}</section>`:"";
    const roster=ov.enriched.map(e=>`<article class="teacher-student-card"><button class="teacher-student-main" type="button" data-teacher-student="${e.i}"><span class="teacher-avatar">${esc(e.r.avatar||"🎓")}</span><span class="teacher-student-copy"><b>${esc(e.r.display_name||"Student")}</b><small>${Number(e.r.xp)||0} XP · ${Number(e.r.streak)||0} day streak · ${e.x.masteryAvg==null?"Mastery —":"Mastery "+e.x.masteryAvg+"%"}</small><small>${e.strongest?"Strongest: "+esc(e.strongest.subject)+" "+e.strongest.progress+"%":"No subject evidence yet"}${e.weakest&&e.weakest!==e.strongest?" · Developing: "+esc(e.weakest.subject)+" "+e.weakest.progress+"%":""}</small><small>Last activity: ${e.r.updated_at?new Date(e.r.updated_at).toLocaleDateString():"—"}</small></span><strong>PROGRESS →</strong></button>${e.attention?`<div class="teacher-attention"><b>NEEDS ATTENTION</b><span>${esc(e.attention)}</span></div>`:""}</article>`).join("");
    const currentLesson=Array.isArray(lessonRows)?lessonRows[0]:null;
    const classSubject=(cls.subject||"Maths").trim(),curriculum=(typeof window.gcseGetClassLessonCurriculum==="function"?window.gcseGetClassLessonCurriculum(classSubject):null)||{["All "+classSubject]:["Adaptive mixed "+classSubject]},topicKeys=Object.keys(curriculum),savedTopic=currentLesson?String(currentLesson.lesson_topic||""):"",savedFocus=currentLesson?String(currentLesson.lesson_title||""):"",initialTopic=topicKeys.includes(savedTopic)?savedTopic:topicKeys[0];
    const topicOptions=topicKeys.map(t=>`<option value="${esc(t)}"${t===initialTopic?" selected":""}>${esc(t)}</option>`).join(""),focusOptions=(curriculum[initialTopic]||[]).map(f=>`<option value="${esc(f)}"${f===savedFocus?" selected":""}>${esc(f)}</option>`).join("");
    const lessonPanel=`<section class="teacher-lesson-panel"><small>CLASS LESSON</small><h3>${currentLesson?esc(currentLesson.lesson_title):"Set a lesson"}</h3><p>${currentLesson?"Current topic: "+esc(currentLesson.lesson_topic||"All"):"Choose from the "+esc(classSubject)+" curriculum."}</p><label class="teacher-lesson-label">SUBJECT</label><div class="teacher-lesson-fixed">${esc(classSubject)}</div><label class="teacher-lesson-label">TOPIC</label><select id="teacherLessonTopic" class="cloud-code-input">${topicOptions}</select><label class="teacher-lesson-label">LESSON FOCUS</label><select id="teacherLessonFocus" class="cloud-code-input">${focusOptions}</select><button id="teacherSetLesson" class="cloud-primary" type="button">${currentLesson?"UPDATE LESSON":"SET LESSON"}</button><div id="teacherLessonMessage" class="cloud-message"></div></section>`;
    host.innerHTML=`<button id="teacherBackClasses" class="cloud-secondary" type="button">← ALL CLASSES</button><div class="teacher-class-head"><div><h2>${esc(cls.class_name||"Class")}</h2><p class="cloud-small">${cls.subject?esc(cls.subject)+" · ":""}${rows.length} student${rows.length===1?"":"s"}</p></div><div class="teacher-code"><small>STUDENT JOIN CODE</small><strong>${esc(code||"—")}</strong><span>Students enter this from their LevelUp10 account.</span></div></div>${lessonPanel}${overview}<div class="teacher-roster">${rows.length?roster:'<div class="role-shell-empty"><h2>Waiting for students</h2><p>Share the join code above. Students can join this class without exposing their account details.</p></div>'}</div>`;
    document.getElementById("teacherBackClasses").onclick=renderRoleTeacherDashboard;
    const topicSelect=document.getElementById("teacherLessonTopic"),focusSelect=document.getElementById("teacherLessonFocus");topicSelect.onchange=()=>{focusSelect.innerHTML=(curriculum[topicSelect.value]||[topicSelect.value]).map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join("")};
    document.getElementById("teacherSetLesson").onclick=async()=>{const topic=topicSelect.value,title=focusSelect.value||topic,msg=document.getElementById("teacherLessonMessage");msg.textContent="Saving lesson…";const {error}=await client.rpc("set_teacher_class_lesson",{target_class_id:cls.id,lesson_title:title,lesson_topic:topic});if(error){msg.textContent=error.message;msg.className="cloud-message error";return}msg.textContent="Lesson set ✓";msg.className="cloud-message good";setTimeout(()=>showTeacherClass(index),350)};
    host.querySelectorAll("[data-teacher-student]").forEach(b=>b.onclick=()=>showTeacherStudentProgress(Number(b.dataset.teacherStudent)));
  }

  function showTeacherStudentProgress(index){
    const r=(window.gcseTeacherStudents||[])[index];if(!r)return;
    const x=summariseState(r.state,r.xp),subjects=x.subjects||[];
    const host=document.getElementById("roleTeacherDashboard");if(!host)return;
    const rows=subjects.map(s=>`<div class="cloud-progress-subject ${s.attempts?"has-evidence":""}"><div><b>${esc(s.subject)}</b><strong>${esc(s.level)}${s.attempts?" · "+s.progress+"%":""}</strong></div><div class="cloud-progress-bar"><i style="width:${Math.max(0,Math.min(100,s.progress||0))}%"></i></div><small>${s.attempts?s.attempts+" answers recorded · "+s.accuracy+"% recent accuracy · Estimate "+s.gradeLabel:"No learning evidence yet"}</small></div>`).join("");
    const raw=(r.state&&typeof r.state==="object")?r.state:{},nested=[raw,raw.state,raw.learning_state,raw.learningState].find(v=>Array.isArray(v?.classLessonHistory)),activeClass=window.gcseActiveTeacherClass;
    const classHistory=(nested?.classLessonHistory||[]).filter(v=>!activeClass?.id||!v.class_id||v.class_id===activeClass.id).slice(-8).reverse();
    const classActivity=`<section class="teacher-lesson-activity"><small>CLASS LESSON ACTIVITY</small><h3>Recent completions</h3>${classHistory.length?classHistory.map(v=>`<div class="teacher-lesson-result"><span><b>${esc(v.focus||v.topic||"Class lesson")}</b><small>${esc(v.subject||activeClass?.subject||"Subject")} · ${v.completed_at?new Date(v.completed_at).toLocaleDateString():"Completed"}</small></span><strong>${Number(v.score)||0}/${Number(v.total)||8} · ${Number(v.percent)||0}%</strong></div>`).join(""):'<p class="cloud-small">No completed class lessons recorded yet.</p>'}</section>`;
    host.innerHTML=`<button id="teacherBackRoster" class="cloud-secondary" type="button">← BACK TO CLASS</button><div class="cloud-progress-head"><h2>${esc(r.display_name||"Student")} · Progress</h2><p class="cloud-small">Teacher read-only learning progress.</p></div><div class="cloud-stat-grid cloud-progress-summary"><div><strong>${Number(r.xp)||0}</strong><small>XP</small></div><div><strong>${Number(r.streak)||0}</strong><small>Streak</small></div><div><strong>${x.level||"—"}</strong><small>Level</small></div><div><strong>${x.masteryAvg==null?"—":x.masteryAvg+"%"}</strong><small>Mastery</small></div></div>${classActivity}<div class="cloud-progress-list">${rows}</div>`;
    document.getElementById("teacherBackRoster").onclick=()=>{const cls=window.gcseActiveTeacherClass,all=window.gcseTeacherClasses||[],i=all.findIndex(x=>x.id===cls?.id);showTeacherClass(Math.max(0,i))};
    window.scrollTo(0,0);
  }

  async function signOutFromRoleShell(){
    try{await client.auth.signOut()}catch(e){console.warn("Sign out failed",e)}
    currentUser=null;currentProfile=null;currentIdentity=null;currentGcseProfile=null;platformReady=false;loadedUserId=null;
    closeRoleShell();setStatus("Not signed in",false);
    try{sessionStorage.removeItem("lu10_refresh_view")}catch(_){}
    if(typeof window.goHome==="function")window.goHome();
    else location.reload();
  }

  function routeAccountShell(){
    if(!currentUser||!currentProfile)return closeRoleShell();
    const role=currentProfile.role||"student";
    if(role==="parent"||role==="teacher")showRoleShell();else closeRoleShell();
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
        body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Teacher account</h3><p><b>${esc(currentProfile?.display_name||"Teacher")}</b></p><p class="cloud-small">Teacher dashboard active. Classes, join codes and student progress are read-only for teachers.</p><div id="cloudMessage" class="cloud-message"></div><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;document.getElementById("cloudSignOut").onclick=signOut;return;
      }
      body.innerHTML=`<div class="cloud-connected-card"><div class="cloud-check">✓</div><h3>Student cloud account</h3><p><b>${esc(currentProfile?.display_name||"Student")}</b></p><p class="cloud-small">${esc(currentUser.email||"")}</p><p class="cloud-small"><b>LevelUp10 ID:</b> ${esc(currentIdentity?.levelup10_id||"—")}</p><div class="cloud-link-box"><h4>Connect Parent/Carer</h4><p class="cloud-small">Generate a private one-time code for your parent/carer.</p><button id="cloudGenerateParentCode" class="cloud-primary" type="button">GENERATE PARENT CODE</button><div id="cloudParentCode"></div></div><div class="cloud-link-box"><h4>Join a Class</h4><p class="cloud-small">Enter the class code provided by your teacher.</p><input id="cloudClassJoinCode" class="cloud-code-input" maxlength="8" autocomplete="off" autocapitalize="characters" placeholder="AB12CD34"><button id="cloudJoinClass" class="cloud-primary" type="button">JOIN CLASS</button><div id="cloudClassJoinResult"></div></div><div class="cloud-safe-note">Progress is saved to this student account. Parent/carer and teacher access is read-only.</div><div id="cloudMessage" class="cloud-message ${cloudLoadState==="loaded"?"good":cloudLoadState==="failed"?"error":""}">${!navigator.onLine?"Offline copy active":cloudLoadState==="loaded"?"Cloud progress loaded ✓":cloudLoadState==="failed"?`Cloud load failed: ${esc(cloudLoadError)}`:"Checking cloud progress…"}</div><button id="cloudSaveNow" class="cloud-primary" type="button">SAVE NOW</button><button id="cloudSignOut" class="cloud-secondary" type="button">SIGN OUT</button></div>`;
      document.getElementById("cloudGenerateParentCode").onclick=generateParentCode;document.getElementById("cloudJoinClass").onclick=joinClassWithCode;document.getElementById("cloudClassJoinCode").addEventListener("keydown",e=>{if(e.key==="Enter")joinClassWithCode()});document.getElementById("cloudSaveNow").onclick=async()=>{message("Saving…");await saveNow();message("Cloud save complete ✓","good")};document.getElementById("cloudSignOut").onclick=signOut;return;
    }
    body.innerHTML=`<div class="cloud-tabs"><button id="cloudTabSignIn" class="active" type="button">Sign in</button><button id="cloudTabCreate" type="button">Create account</button></div><div id="cloudForm"></div>`;showSignInForm();document.getElementById("cloudTabSignIn").onclick=showSignInForm;document.getElementById("cloudTabCreate").onclick=showCreateForm;
  }
  function activateTab(create){document.getElementById("cloudTabSignIn")?.classList.toggle("active",!create);document.getElementById("cloudTabCreate")?.classList.toggle("active",create)}
  function showSignInForm(){activateTab(false);const f=document.getElementById("cloudForm");if(!f)return;f.innerHTML='<label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="current-password" minlength="8"></label><button id="cloudSignIn" class="cloud-primary" type="button">SIGN IN</button><div id="cloudMessage" class="cloud-message"></div>';document.getElementById("cloudSignIn").onclick=()=>{const e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value;if(!e||p.length<8)return message("Enter your email and password (8+ characters).","error");signIn(e,p)}}
  function showCreateForm(){activateTab(true);const f=document.getElementById("cloudForm");if(!f)return;const n=document.getElementById("profileName")?.textContent?.trim()||"Learner";window.gcseBoostPendingAvatar="🎓";const avatars=["🎓","🚀","⭐","🦊","🐼","🦁"];f.innerHTML=`<label class="cloud-label">Account type<select id="cloudRole" class="cloud-role-select"><option value="student">Student</option><option value="parent">Parent</option><option value="teacher">Teacher</option></select></label><label class="cloud-label"><span id="cloudNameLabel">Learner name</span><input id="cloudDisplayName" type="text" maxlength="24" value="${esc(n)}" autocomplete="nickname"></label><div id="cloudAvatarBlock" class="cloud-label">Choose an avatar<div class="cloud-avatar-picks">${avatars.map((a,i)=>`<button type="button" class="cloud-avatar-pick ${i===0?"selected":""}" data-avatar="${a}">${a}</button>`).join("")}</div></div><label class="cloud-label">Email<input id="cloudEmail" type="email" autocomplete="email" inputmode="email"></label><label class="cloud-label">Password<input id="cloudPassword" type="password" autocomplete="new-password" minlength="8"></label><button id="cloudCreate" class="cloud-primary" type="button">CREATE STUDENT ACCOUNT</button><div id="cloudMessage" class="cloud-message"></div><p id="cloudRoleHelp" class="cloud-small">Learner progress follows this account across devices.</p>`;f.querySelectorAll(".cloud-avatar-pick").forEach(b=>b.onclick=()=>{f.querySelectorAll(".cloud-avatar-pick").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");window.gcseBoostPendingAvatar=b.dataset.avatar});const roleEl=document.getElementById("cloudRole"),btn=document.getElementById("cloudCreate"),label=document.getElementById("cloudNameLabel"),help=document.getElementById("cloudRoleHelp"),avatar=document.getElementById("cloudAvatarBlock");const refreshRole=()=>{const r=roleEl.value;label.textContent=r==="student"?"Student name":r==="parent"?"Parent name":"Teacher name";btn.textContent=`CREATE ${r.toUpperCase()} ACCOUNT`;help.textContent=r==="student"?"Student progress follows this account across devices.":r==="parent"?"Parent accounts will link to learner accounts without creating a second copy of progress.":"Teacher accounts will manage test classes and read-only learner progress.";avatar.style.display=r==="student"?"block":"none"};roleEl.onchange=refreshRole;refreshRole();btn.onclick=()=>{const n=document.getElementById("cloudDisplayName").value.trim(),e=document.getElementById("cloudEmail").value.trim(),p=document.getElementById("cloudPassword").value,r=roleEl.value;if(!n||!e||p.length<8)return message("Enter a name, email and password of at least 8 characters.","error");signUp(e,p,n,r)}}
  async function showCloudAccount(){closeCloudAccount();const o=document.createElement("div");o.id="cloudAccountOverlay";o.className="cloud-overlay";o.innerHTML='<div class="cloud-panel" role="dialog" aria-modal="true" aria-label="Cloud account"><div class="cloud-head"><div><b>☁️ Cloud Account</b><small>V0.25.0</small></div><button id="cloudClose" type="button" aria-label="Close">×</button></div><div id="cloudAccountBody"><p>Checking connection…</p></div></div>';document.body.appendChild(o);document.getElementById("cloudClose").onclick=closeCloudAccount;o.addEventListener("click",e=>{if(e.target===o)closeCloudAccount()});try{await loadCloudIdentity();renderCloudAccount()}catch(e){console.warn("LevelUp10 platform check failed",e);cloudLoadState="failed";cloudLoadError=e?.message||String(e);const body=document.getElementById("cloudAccountBody");if(body)body.innerHTML=`<div class="cloud-connected-card"><h3>Platform connection needs attention</h3><p class="cloud-small">Your existing GCSE progress on this device is still safe.</p><div class="cloud-message error">${esc(cloudLoadError)}</div><button id="cloudRetry" class="cloud-primary" type="button">TRY AGAIN</button><button id="cloudRecoverySignOut" class="cloud-secondary" type="button">SIGN OUT / USE ANOTHER ACCOUNT</button><p class="cloud-small">Use Sign Out if this account was deleted, was created with the wrong account type, or you need to switch accounts.</p></div>`;document.getElementById("cloudRetry")?.addEventListener("click",showCloudAccount);document.getElementById("cloudRecoverySignOut")?.addEventListener("click",recoverySignOut)}}
  async function init(){ensureUi();if(!window.supabase?.createClient){setStatus("Offline / cloud unavailable",false);return}client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{const next=session?.user?.id||null;if(next!==currentUser?.id)loadedUserId=null;await loadCloudIdentity(true)},0)});window.addEventListener("online",()=>{if(currentUser){loadCloudIdentity(true).then(()=>{if(pendingSave)saveNow()})}});try{await loadCloudIdentity(true)}catch(e){console.warn("Cloud account check failed",e)}}
  window.showCloudAccount=showCloudAccount;window.addEventListener("DOMContentLoaded",init);
})();
