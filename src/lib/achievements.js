/** Achievement copy for UI, shares, and social previews. */
export function buildAchievementCopy(type, ctx = {}) {
  const name = ctx.childName || "Your child";
  const story = ctx.storyTitle || "a Bible quest";
  const checkpoint = ctx.checkpointTitle || "Scripture checkpoint";
  const verse = ctx.verseReference || "a memory verse";
  const badge = ctx.badgeName || "Faith Badge";
  const accuracy = ctx.accuracyPercent;

  switch (type) {
    case "checkpoint":
      return {
        title: `${name} passed a Scripture checkpoint!`,
        subtitle: `"${checkpoint}" — ${story}`,
        emoji: "🎯",
        socialTitle: `${name} is growing in God's Word on Bible Teddy`,
        socialDescription: `${name} just aced a Bible quiz checkpoint in ${story}. Start your family's free adventure.`,
        toast: `${name} earned +50 Faith Seeds for that checkpoint!`,
      };
    case "verse":
      return {
        title: `${name} recited ${verse} from memory!`,
        subtitle: accuracy != null ? `${accuracy}% accuracy — spoken aloud with confidence` : "Memory verse mastered aloud",
        emoji: "🎤",
        socialTitle: `${name} spoke God's Word out loud`,
        socialDescription: `Watch ${name}'s memory-verse milestone and try Bible Teddy with your family.`,
        toast: `${name} mastered a memory verse!`,
      };
    case "badge":
      return {
        title: `${name} earned the ${badge}!`,
        subtitle: "A new Faith Badge for their Adventure Map",
        emoji: "🏅",
        socialTitle: `${name} unlocked a Faith Badge on Bible Teddy`,
        socialDescription: `Celebrate this milestone and invite your family to start their own quest.`,
        toast: `New badge unlocked: ${badge}!`,
      };
    case "quest_complete":
      return {
        title: `${name} completed ${story}!`,
        subtitle: "Every checkpoint passed — quest complete!",
        emoji: "⭐",
        socialTitle: `${name} finished a full Bible video quest`,
        socialDescription: `See the achievement and start interactive Scripture adventures with your kids.`,
        toast: `Quest complete! ${story}`,
      };
    default:
      return {
        title: `${name} reached a new milestone!`,
        subtitle: "Growing in faith on Bible Teddy",
        emoji: "🌟",
        socialTitle: `${name}'s Bible Teddy milestone`,
        socialDescription: "Join our family-friendly Bible adventure app.",
        toast: "New achievement recorded!",
      };
  }
}

export function generateShareToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `bt${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function shareUrl(token) {
  const base =
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://bibleteddy.vercel.app";
  return `${base.replace(/\/$/, "")}/share/${token}`;
}

export function inviteSignupUrl(shareToken, siteBase) {
  const base = (siteBase || "https://bibleteddy.vercel.app").replace(/\/$/, "");
  return `${base}/onboarding/signup?ref=${shareToken}`;
}
