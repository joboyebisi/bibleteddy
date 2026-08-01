import { getSiteUrl } from "@/lib/siteUrl";
import ShareAchievementClient from "./ShareAchievementClient";

export async function generateMetadata({ params }) {
  const { token } = await params;
  const siteUrl = getSiteUrl();

  try {
    const res = await fetch(`${siteUrl}/api/achievements/${token}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return { title: "Bible Teddy — Faith Milestone" };
    }
    const data = await res.json();
    return {
      title: `${data.child_name}'s Bible Teddy Milestone`,
      description: data.subtitle || data.title,
      openGraph: {
        title: data.title,
        description: data.subtitle || "Celebrate a child's Scripture milestone on Bible Teddy.",
        url: `${siteUrl}/share/${token}`,
        siteName: "Bible Teddy",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.subtitle,
      },
    };
  } catch {
    return { title: "Bible Teddy — Faith Milestone" };
  }
}

export default async function ShareAchievementPage({ params }) {
  const { token } = await params;
  return <ShareAchievementClient token={token} />;
}
