"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import confetti from "canvas-confetti";

const AppContext = createContext();

/** Normalize DB curated_stories row to app story shape */
function normalizeCuratedVideo(row) {
  if (!row) return row;
  const checkpoints = row.checkpoints || row.quiz_questions || [];
  return {
    ...row,
    youtubeId: row.youtubeId || row.youtube_id || "",
    thumbnailUrl: row.thumbnailUrl || row.thumbnail_url || (row.youtube_id ? `https://img.youtube.com/vi/${row.youtube_id}/hqdefault.jpg` : ""),
    desc: row.desc || row.description || "",
    checkpoints: Array.isArray(checkpoints) ? checkpoints : [],
    quiz_questions: checkpoints,
  };
}

// ── Default curated Superbook stories with map coordinates ──
const DEFAULT_STORIES = [
  {
    id: "christmas",
    title: "Superbook: The First Christmas",
    desc: "Experience the wonderful story of the birth of baby Jesus in Bethlehem!",
    category: "HERO STORIES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNakkhLF2rxpTBkS9LSrWyDrCN6QhcGnchfnkSqlchzyislYOIZjIi-Mc3PLdCYC8IKQYi3Ocpm8Bqk5RMinZdHIuzj6SmgOFNnSLOpaBNwP9UDohjz7E1SQnSow_VD5DT_eVJ9CX3DInveN_TXAgPpffPo2SXkAAFqXSvbvoAtrW7f7MvznHyIsD9pNDfxZ9ZNfX1BIbCCwcBoJC-fa6GKr711rdNZiYbhj9m2Rz4oFc3E-z9mF3OuA",
    progress: 40, locked: false,
    verse: "Isaiah 9:6", translationClassic: "For to us a child is born, to us a son is given; and the government shall be upon his shoulder. (Isaiah 9:6 ESV)",
    translationKids: "A child will be born to us. God will give a son to us. (Isaiah 9:6 ICB)",
    xPercent: 18, yPercent: 75, stars: 3, era: "Gospels (Ep 8)", mapIcon: "child_care",
    youtubeId: "8m9gSjV6o2Y", durationSeconds: 150,
    checkpoints: [
      { id: "cp-xm-1", timeSeconds: 25, title: "Bethlehem Stable", verseSnippet: "She wrapped him in cloths and placed him in a manger. (Luke 2:7)", question: { prompt: "Where was baby Jesus laid when He was born?", options: ["In a wooden manger in Bethlehem", "On a velvet throne", "In a fast chariot", "In a glass house"], correctAnswer: "In a wooden manger in Bethlehem", explanation: "Jesus was born in Bethlehem and laid humbly in a manger!" } },
      { id: "cp-xm-2", timeSeconds: 65, title: "The Star of Bethlehem", verseSnippet: "We saw his star when it rose and have come to worship him. (Matthew 2:2)", question: { prompt: "What guided the Wise Men to find the baby king?", options: ["A bright glowing Star in the east", "A paper map", "A lighthouse", "A golden bird"], correctAnswer: "A bright glowing Star in the east", explanation: "God placed a magnificent star in the sky to guide the Magi!" } }
    ]
  },
  {
    id: "miracles",
    title: "Superbook: Miracles of Jesus",
    desc: "Watch Jesus perform physical healings and demonstrate power over nature!",
    category: "HERO STORIES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB--6VfkMDzT31Ya1o3_xozlYpmEdOXaURp0GupHNqB6m33aIm83zQ0JCvbUqABt42EJyCONhy_A7CdMPfUbujkT3Th2S3HH5s4zePfawh8KZH5QCaULQlQSHZJ-OKyxyZtvnO395ffZ7X7ulNXrpu8egQKhxJsS4Ma4HO7b_vbCENTA5ab5eW6DBWyRHI9jn2dt7pXP8LU4kFXfSSMcxHmSKpCzMnUG-02he0N4sCL84jhzKMavTq2-A",
    progress: 0, locked: false,
    verse: "Mark 4:41", translationClassic: "And they said to one another, 'Who then is this, that even wind and sea obey him?' (Mark 4:41 ESV)",
    translationKids: "They said to each other, 'Even the wind and the waves obey him!' (Mark 4:41 ICB)",
    xPercent: 32, yPercent: 45, stars: 2, era: "Gospels (Ep 9)", mapIcon: "water",
    youtubeId: "l54IvPzqXJM", durationSeconds: 180,
    checkpoints: [
      { id: "cp-m-1", timeSeconds: 30, title: "Calming the Storm", verseSnippet: "He got up, rebuked the wind and said, 'Quiet! Be still!' (Mark 4:39)", question: { prompt: "What words did Jesus speak to stop the storm?", options: ["Quiet! Be still!", "Rain come back later!", "Blow harder!", "Fly away!"], correctAnswer: "Quiet! Be still!", explanation: "Jesus commanded the wind and sea, and immediate calm followed!" } },
      { id: "cp-m-2", timeSeconds: 85, title: "Feeding the 5,000", verseSnippet: "Taking the five loaves and the two fish and looking up to heaven, he gave thanks. (Luke 9:16)", question: { prompt: "How many loaves and fish fed five thousand people?", options: ["5 loaves and 2 fish", "100 apples", "1 loaf of bread", "20 grapes"], correctAnswer: "5 loaves and 2 fish", explanation: "Jesus blessed a boy's small lunch to feed thousands!" } }
    ]
  },
  {
    id: "lastsupper",
    title: "Superbook: The Last Supper",
    desc: "Discover Jesus' lesson on humility, washing feet, and serving others.",
    category: "HERO STORIES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIJbRKW94auo1xY2FSVM1YzrqbXpY4Xkl8Fmq9LDOVMGelUh6MtsWtCQpgbdNOIXwSx1LZ8DXof09t13-uDsI__0UQysEZEdlgnhAaMCJ-EpNlIn45s6drTbEdPA3lWc6mpBSyScvGwAcL8NBePkVKu4qW-lr6PGn2RU3IKdAYduoQPCESFvp4yfo2DGKbPCfXFJ7Wn-nhoj0lbkdmXw9hk61NAG6h5INtBDMHw_lDX1_Ivvkp9RZw",
    progress: 0, locked: false,
    verse: "Luke 22:19", translationClassic: "And he took bread, gave thanks, broke it and gave it to them. (Luke 22:19 ESV)",
    translationKids: "Jesus took bread, gave thanks, broke it and said: 'Do this to remember me.' (Luke 22:19 ICB)",
    xPercent: 50, yPercent: 68, stars: 1, era: "Gospels (Ep 10)", mapIcon: "restaurant",
    youtubeId: "0o8NQBuneJM", durationSeconds: 170,
    checkpoints: [
      { id: "cp-ls-1", timeSeconds: 35, title: "Washing Disciples' Feet", verseSnippet: "I have set you an example that you should do as I have done for you. (John 13:15)", question: { prompt: "What humble act did Jesus do before eating supper?", options: ["Washed His disciples' feet", "Cooked a giant cake", "Bought golden shoes", "Slept on a couch"], correctAnswer: "Washed His disciples' feet", explanation: "Jesus showed that true leaders are humble servants!" } }
    ]
  },
  {
    id: "heisrisen",
    title: "Superbook: He Is Risen!",
    desc: "Track the glorious resurrection of Christ and His victory over death!",
    category: "HERO STORIES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLfBs-xL1o_TxK76ymbAleKCW7cL_nGSd5tr8VnRXsTIQPWL_P632eYlAlf52K23BGxGTpyK5HKzDQ3srQ4lEmzalNgRQNf3c5r0didOqJGhkRo6hRSNRiubJbyglh1X4exMcZ6OYxVXOjuObAfyzks15w0Vypi7vQfeGRxm84OxOC4xZK2f31HvLMO2aH4y7I_NiNej9M-KZXpTZjQZGHGZsQoPX2-oXDWuGIm4jxh3mENwY5YxETZw",
    progress: 0, locked: false,
    verse: "Matthew 28:6", translationClassic: "He is not here, for he has risen, as he said. Come, see the place where he lay. (Matthew 28:6 ESV)",
    translationKids: "Jesus is not here! He has risen from death, just as he promised! (Matthew 28:6 ICB)",
    xPercent: 68, yPercent: 35, stars: 1, era: "Gospels (Ep 11)", mapIcon: "wb_sunny",
    youtubeId: "J2Xod4D5UwQ", durationSeconds: 190,
    checkpoints: [
      { id: "cp-hr-1", timeSeconds: 40, title: "The Rolled Stone", verseSnippet: "He is not here; he has risen! (Luke 24:6)", question: { prompt: "What did Mary find when she arrived at the tomb?", options: ["The heavy stone was rolled away!", "The entrance was bricked shut", "A iron gate", "A sleeping lion"], correctAnswer: "The heavy stone was rolled away!", explanation: "God's power rolled away the massive stone!" } }
    ]
  },
  {
    id: "david",
    title: "Superbook: David and Goliath",
    desc: "A little shepherd boy faces a giant using faith and five smooth stones!",
    category: "HERO STORIES",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDkrjLF76DxLGFtdmP2YKtIIrOTj_don_NgujVlC15PwjFJmB5uBD33f7XDLZLN9FnHuxw2jZHsAl9xDFzywjRXMjwACHtycX-ChReIldhyFGRkWgImdbr7-OqEyCUvThorkp4BMvZiycWMdn1lBxiYGsS2_SFMRdZnkDiR-6w7GzuyKAnF_3EHsBiEmzx-Z74yhnuYSTfyHIkyyN8oI8Z-r-TJQSlx8y5d6I2VsXAILmPreBs3c9-ig",
    progress: 0, locked: true, requiredBadges: 4,
    verse: "Psalm 28:7", translationClassic: "The LORD is my strength and my shield; in him my heart trusts. (Psalm 28:7 ESV)",
    translationKids: "The Lord gives me strength and protects me like a shield. (Psalm 28:7 ICB)",
    xPercent: 82, yPercent: 60, stars: 0, era: "Old Testament", mapIcon: "shield",
    youtubeId: "RG9_g772vK0", durationSeconds: 160,
    checkpoints: [
      { id: "cp-d-1", timeSeconds: 30, title: "Five Smooth Stones", verseSnippet: "David said to the Philistine, 'You come against me with sword and spear, but I come against you in the name of the Lord.' (1 Samuel 17:45)", question: { prompt: "What weapon did David trust God with?", options: ["A sling and 5 smooth stones", "A heavy iron sword", "A golden spear", "A wooden bow"], correctAnswer: "A sling and 5 smooth stones", explanation: "David defeated Goliath with faith in God!" } }
    ]
  }
];

export const AppProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);            // Supabase auth user
  const [parent, setParent] = useState(null);         // Parent profile
  const [kidsProfiles, setKidsProfiles] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [curatedVideos, setCuratedVideos] = useState([]);
  const [stories, setStories] = useState(DEFAULT_STORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [verseOfDay, setVerseOfDay] = useState(null); // YouVersion Verse of Day

  // ── Fetch YouVersion Verse of the Day ──
  const fetchVerseOfDay = useCallback(async () => {
    try {
      const res = await fetch("/api/youversion/verse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        const data = await res.json();
        setVerseOfDay(data);
      }
    } catch (e) { /* silent */ }
  }, []);

  // ── Load user profile from Supabase or localStorage ──
  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) {
      // Try localStorage fallback
      try {
        const local = localStorage.getItem("btb_parent");
        if (local) {
          const p = JSON.parse(local);
          setParent(p);
          const kids = JSON.parse(localStorage.getItem(`btb_kids_${p.id}`) || "[]");
          setKidsProfiles(kids);
          const activeId = localStorage.getItem(`btb_active_child_${p.id}`);
          if (activeId) setActiveChildId(activeId);
          else if (kids.length > 0) setActiveChildId(kids[0].id);
          const videos = JSON.parse(localStorage.getItem(`btb_curated_${p.id}`) || "[]");
          setCuratedVideos(videos.map(normalizeCuratedVideo));
        }
      } catch (e) { /* silent */ }
      return;
    }

    setUser(authUser);

    // Load parent profile including YouVersion link status
    let parentProfile = {
      email: authUser.email,
      id: authUser.id,
      displayName: authUser.user_metadata?.full_name,
      youversionLinked: false,
    };

    if (supabase) {
      const { data: profile } = await supabase
        .from("parent_profiles")
        .select("display_name, youversion_user_id, email, is_admin")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        parentProfile = {
          ...parentProfile,
          email: profile.email || parentProfile.email,
          displayName: profile.display_name || parentProfile.displayName,
          youversionLinked: !!profile.youversion_user_id,
          youversionUserId: profile.youversion_user_id,
          isAdmin: !!profile.is_admin,
        };
      }
    }

    setParent(parentProfile);
    localStorage.setItem("btb_parent", JSON.stringify(parentProfile));

    if (!supabase) return;

    // Fetch child profiles with realtime
    const { data: profiles } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("parent_id", authUser.id)
      .order("created_at");

    if (profiles?.length > 0) {
      setKidsProfiles(profiles);
      const savedId = localStorage.getItem(`btb_active_child_${authUser.id}`);
      setActiveChildId(savedId || profiles[0].id);
    }

    // Fetch curated stories
    const { data: videos } = await supabase
      .from("curated_stories")
      .select("*")
      .eq("parent_id", authUser.id)
      .order("created_at", { ascending: false });
    if (videos) setCuratedVideos(videos.map(normalizeCuratedVideo));

    // Subscribe to realtime child profile updates
    const channel = supabase
      .channel(`child-updates-${authUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "child_profiles", filter: `parent_id=eq.${authUser.id}` },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setKidsProfiles(prev => prev.map(k => k.id === payload.new.id ? { ...k, ...payload.new } : k));
          } else if (payload.eventType === "INSERT") {
            setKidsProfiles(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── Bootstrap: listen to Supabase auth state ──
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      fetchVerseOfDay();

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        await loadUserData(session?.user || null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          await loadUserData(session?.user || null);
        });

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } else {
        await loadUserData(null);
        setIsLoading(false);
      }
    };
    init();
  }, [loadUserData, fetchVerseOfDay]);

  // ── Auth: Sign Up with email/password ──
  const handleSignUp = async (email, password) => {
    setIsLoading(true);
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding/child` }
      });
      setIsLoading(false);
      if (error) throw error;
      // Profile created via auth state change listener
      return data.user;
    } else {
      // LocalStorage fallback
      const p = { email, id: "parent_" + Date.now() };
      setParent(p);
      localStorage.setItem("btb_parent", JSON.stringify(p));
      setIsLoading(false);
      return p;
    }
  };

  // ── Auth: Sign In with email/password ──
  const handleSignIn = async (email, password) => {
    setIsLoading(true);
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      if (error) throw error;
      return data.user;
    } else {
      const p = { email, id: "parent_123" };
      setParent(p);
      localStorage.setItem("btb_parent", JSON.stringify(p));
      setIsLoading(false);
    }
  };

  // ── Auth: Sign In with YouVersion (OAuth PKCE) ──
  const handleYouVersionSignIn = () => {
    const base =
      (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    window.location.href = `${base}/api/youversion/login?next=/onboarding/child`;
  };

  // ── Auth: Sign In with Google ──
  const handleGoogleSignIn = async () => {
    if (!supabase) {
      alert("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/parent`,
        queryParams: { access_type: "offline", prompt: "consent" }
      }
    });
    if (error) throw error;
  };

  // ── Auth: Sign Out ──
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setParent(null);
    setKidsProfiles([]);
    setActiveChildId(null);
    setCuratedVideos([]);
    localStorage.removeItem("btb_parent");
    router.push("/");
  };

  // ── Add Child Profile ──
  const addChildProfile = async (name, age, avatarUrl) => {
    if (!parent) throw new Error("Not logged in");
    setIsLoading(true);

    const newProfileData = {
      parent_id: parent.id,
      name,
      age_group: age,
      avatar_url: avatarUrl,
      streak: 0,
      seeds: 0,
      badges: [],
      virtues: { love: 0, faith: 0, kindness: 0 }
    };

    if (supabase && user) {
      const { data, error } = await supabase.from("child_profiles").insert(newProfileData).select().single();
      if (error) { setIsLoading(false); throw error; }
      const profile = { ...newProfileData, id: data.id, ...data };
      setKidsProfiles(prev => [...prev, profile]);
      setActiveChildId(profile.id);
      localStorage.setItem(`btb_active_child_${parent.id}`, profile.id);
      setIsLoading(false);
      return profile;
    } else {
      const profile = { ...newProfileData, id: "child_" + Date.now() };
      const updated = [...kidsProfiles, profile];
      setKidsProfiles(updated);
      setActiveChildId(profile.id);
      localStorage.setItem(`btb_kids_${parent.id}`, JSON.stringify(updated));
      localStorage.setItem(`btb_active_child_${parent.id}`, profile.id);
      setIsLoading(false);
      return profile;
    }
  };

  const selectActiveChild = (id) => {
    setActiveChildId(id);
    if (parent) localStorage.setItem(`btb_active_child_${parent.id}`, id);
  };

  const getActiveChild = () => kidsProfiles.find(k => k.id === activeChildId) || null;

  // ── Add Seeds (XP) to active child ──
  const addSeeds = async (amount) => {
    const active = getActiveChild();
    if (!active) return;

    const newSeeds = (active.seeds || 0) + amount;
    setKidsProfiles(prev => prev.map(k => k.id === active.id ? { ...k, seeds: newSeeds } : k));

    if (supabase && user) {
      await supabase.from("child_profiles").update({ seeds: newSeeds }).eq("id", active.id);
      // Log daily activity
      await supabase.from("daily_activity").upsert({ child_id: active.id, activity_date: new Date().toISOString().split("T")[0], seeds_earned: amount }, { onConflict: "child_id,activity_date", ignoreDuplicates: false });
    } else {
      localStorage.setItem(`btb_kids_${parent?.id}`, JSON.stringify(kidsProfiles.map(k => k.id === active.id ? { ...k, seeds: newSeeds } : k)));
    }
  };

  // ── Earn Badge ──
  const addBadge = async (badgeName) => {
    const active = getActiveChild();
    if (!active) return;
    const currentBadges = active.badges || [];
    if (currentBadges.includes(badgeName)) return;

    const newBadges = [...currentBadges, badgeName];
    const newSeeds = (active.seeds || 0) + 50;

    setKidsProfiles(prev => prev.map(k => k.id === active.id ? { ...k, badges: newBadges, seeds: newSeeds } : k));

    if (supabase && user) {
      await supabase.from("child_profiles").update({ badges: newBadges, seeds: newSeeds }).eq("id", active.id);
      await supabase.from("badges_earned").insert({ child_id: active.id, badge_name: badgeName });
    }

    confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ["#ffd700", "#ffffff", "#0c6780"] });
  };

  // ── Log Checkpoint Completion ──
  const logCheckpoint = async (storyId, checkpointId, isCorrect, seedsEarned) => {
    const active = getActiveChild();
    if (!active || !supabase || !user) return;

    await supabase.from("checkpoint_completions").insert({
      child_id: active.id,
      story_id: storyId,
      checkpoint_id: checkpointId,
      is_correct: isCorrect,
      seeds_earned: seedsEarned
    });
  };

  // ── Log Verse Completion ──
  const logVerseCompletion = async (verseRef, translation, accuracyPercent, passed, seedsEarned) => {
    const active = getActiveChild();
    if (!active || !supabase || !user) return;

    await supabase.from("verse_completions").insert({
      child_id: active.id,
      verse_reference: verseRef,
      translation,
      accuracy_percent: accuracyPercent,
      passed,
      seeds_earned: seedsEarned
    });
  };

  // ── Curate Video via Gemini + Gloo ──
  const addCuratedVideo = async (url) => {
    if (!parent) throw new Error("Not logged in");

    const res = await fetch("/api/curate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl: url })
    });

    if (!res.ok) throw new Error("Failed to process curated video");
    const data = await res.json();
    const story = data.story || data;

    const videoRecord = {
      parent_id: parent.id,
      title: story.title || "Bible Story",
      youtube_url: url,
      youtube_id: story.youtubeId || "",
      thumbnail_url: story.thumbnailUrl || (story.youtubeId ? `https://img.youtube.com/vi/${story.youtubeId}/hqdefault.jpg` : ""),
      description: story.desc || "",
      gemini_topic: story.topic || "",
      quiz_questions: story.checkpoints || [],
      age_group: "all",
      approved: true
    };

    if (supabase && user) {
      const { data: inserted, error } = await supabase.from("curated_stories").insert(videoRecord).select().single();
      if (error) throw error;
      setCuratedVideos(prev => [normalizeCuratedVideo({ ...videoRecord, id: inserted.id, ...story }), ...prev]);
      return inserted;
    } else {
      const vid = normalizeCuratedVideo({ ...videoRecord, ...story, id: "vid_" + Date.now() });
      setCuratedVideos(prev => [vid, ...prev]);
      localStorage.setItem(`btb_curated_${parent.id}`, JSON.stringify([vid, ...curatedVideos]));
      return vid;
    }
  };

  // ── Audio ──
  const playSquishSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach(freq => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now); osc.type = "sine";
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.start(); osc.stop(now + 1.2);
      });
    } catch (e) {}
  };

  return (
    <AppContext.Provider value={{
      // Auth state
      user, parent, isLoading,
      // Child data
      kidsProfiles, activeChildId, activeChild: getActiveChild(),
      // Content
      curatedVideos, stories, verseOfDay,
      // Auth actions
      signUp: handleSignUp,
      signIn: handleSignIn,
      signInWithGoogle: handleGoogleSignIn,
      signInWithYouVersion: handleYouVersionSignIn,
      signOut: handleSignOut,
      // Child actions
      addChild: addChildProfile,
      selectChild: selectActiveChild,
      // Content actions
      addCuratedVideo,
      addSeeds,
      addBadge,
      logCheckpoint,
      logVerseCompletion,
      // UI
      playSquish: playSquishSound,
      playSuccess: playSuccessSound
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
