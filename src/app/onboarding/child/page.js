"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const AVATARS = [
  {
    id: "teddy",
    name: "Shepherd Teddy",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDcC1eTj45Biyf3qeF1OThrhran9WZjt4WWMB3KZSxPliltJtV5qQ1CXHs40XqM9iokvLkRAAuW1zYRONG0HxIwCYM0363ZBz8xQAFL9bJBTroJj-b7TxzYW5x4NAiAbz9FLt8koRVach_g2CwHivut3MYbJoQ79voimaqIAjE9kGrGUIQlg6XuK7csFxMF_QW6SbsmRI3zIFXwqUDy3GfmpzJu04BZ8TOaCvO6q_oyA_noxg4PNupmw"
  },
  {
    id: "lion",
    name: "Lion of Judah",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAfGJ0M5B3HvWr7ztM6az1Qk7wU5moOKjVgWYli_7CAYsYSMKK2_BqKssgOoYHB0iZ3uL1ImxPtXjYJvzu0_kICy4-E86-FFN-cnpfwTaknIGds8uREczVLFtZmCIxUItOzn6em0obxYkEnqn5vm7PB0Hy9vHbOn4cwXwbmQoSR1ytQioY0zHb8K4Lxmda8yF1qupPghlwZDFlk7kG01YFJXqblOtRUaRMe9NNeZiGrkkBaAhan12m2A"
  },
  {
    id: "lamb",
    name: "Gentle Lamb",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWlwES_dbe3-I2Z4sA_SMAH-XZ_yAAWMBAmr4C38vVKwLU2VWXbOMj77QD_u3Qf0V_hCgkq0o8Zn_QNMhdsiq-non3xN2XZ9WrMZz_G2D2zSdNq-iGLjoiB-5tzXD-ug_21J0TlxFy8p7FnUwZUKTg8xy1sqxgEmc8cJ0StQlIutWyjeiY2M7A4LHmad8ePZbcBQO06NL0rg3M5FnQd5SA9r12slv9wXTVY5p20xX6kWqyCOZK0r9ELA"
  },
  {
    id: "owl",
    name: "Wise Owl",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrjuwrtCgTJZoKQGjx_pw09NlsJZ7KhpNiYIcetG9GrxY4gRbeO78GDyJkkcOGCUIKBwcS1E6qap4CG2AmqkSeEl3Mg5RW_us6bKZL5zxRD31GIMhXFK5KErDvojYimJxS-IYrSmM35lQEq9zg67gZSfEZVbPbs7JNwEF_IYNyv_nDoRfgvvI1jnGkJAnSfQSG0KnX96DfXK-F2PBTbaO5vw_GwOnvNKEfEv8SFDZXLhd7yF8A9nQug"
  },
  {
    id: "dove",
    name: "Peace Dove",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUnwX-IPYlgplmHcxED5dEJ-P5jAq-yY9gcVR-NYoli8z9BjmIn0vL4uBHC01p2omFPXhki8dt0Jfv6WeLXYf_KR7M5pLTzFPzDmcv98x_FPKPBlkH3X2FNE3NNGLEver7om9cVtiHGObsrNVuYoIRFziYcu4ru6M58G7V7hiI5GlzygN-pcq4bPJcp2MZIP4Lali_wGNqE1eBL5CZYsS3O1RclNjc3QLBiHj5-Jb323oNmj6DcgmqSw"
  }
];

export default function ChildOnboardingPage() {
  const router = useRouter();
  const { addChild, playSquish, parent, kidsProfiles, isLoading } = useApp();

  const [childName, setChildName] = useState("");
  const [selectedAge, setSelectedAge] = useState("4-5");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(AVATARS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const ages = ["2-3", "4-5", "6-7", "8-10"];

  // Returning users who already have children skip straight to the parent dashboard
  useEffect(() => {
    if (!isLoading && kidsProfiles.length > 0) {
      router.replace("/parent");
    }
  }, [isLoading, kidsProfiles.length, router]);

  // Particles background effect on mount
  useEffect(() => {
    const container = document.getElementById("particle-container");
    if (!container) return;
    
    // Clear old particles if any
    container.innerHTML = "";

    const colors = ["#ffd700", "#baeaff", "#e1e1f5", "#ffd700"];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.position = "absolute";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = "2px";
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.opacity = Math.random() * 0.5;
      particle.style.filter = "blur(1px)";
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      container.appendChild(particle);
      
      const duration = Math.random() * 10000 + 5000;
      const destinationY = Math.random() * 100 - 50;
      const destinationX = Math.random() * 100 - 50;
      
      particle.animate([
        { transform: "translate(0, 0) rotate(0deg)" },
        { transform: `translate(${destinationX}px, ${destinationY}px) rotate(180deg)` }
      ], {
        duration: duration,
        direction: "alternate",
        iterations: Infinity,
        easing: "linear"
      });
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!childName.trim()) {
      setErrorMsg("Please write your child's name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    playSquish();

    try {
      await addChild(childName, selectedAge, selectedAvatarUrl);
      router.push("/onboarding/curation");
    } catch (err) {
      setErrorMsg(err.message || "Could not save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Particle container background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40" id="particle-container"></div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 backdrop-blur-xl bg-surface/80 shadow-[0_20px_20px_rgba(112,93,0,0.15)]">
        <div className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold">
          Bible Teddy
        </div>
        <div className="flex gap-md items-center">
          <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-105 transition-transform" title="Help">
            help
          </span>
          <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-105 transition-transform" title="Account">
            account_circle
          </span>
        </div>
      </header>

      <main className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1024px] mx-auto w-full z-10 flex-grow">
        {/* Progress Stepper */}
        <div className="mb-lg mt-md">
          <div className="flex justify-between items-center mb-base px-2">
            <span className="font-label-caps text-label-caps text-tertiary font-bold text-xs">Step 2 of 3</span>
            <span className="font-label-caps text-label-caps text-primary font-bold text-xs">Almost there!</span>
          </div>
          <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-primary-container pulsing-glow rounded-full transition-all duration-700 ease-out"></div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-xl">
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-sm font-bold leading-tight">
            Let’s Meet Your Hero
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
            Tell us about your little one so we can personalize their <strong>Hero Stories</strong> with language and adventures perfect for their age.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-stretch">
          {/* Left Panel: Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-md md:p-lg soft-shadow border border-white/50 flex flex-col justify-between">
            <form className="space-y-lg" onSubmit={handleProfileSubmit}>
              {errorMsg && (
                <div className="p-sm bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-md font-medium text-center">
                  {errorMsg}
                </div>
              )}

              {/* Child Name */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-primary ml-1 font-bold text-xs">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full h-14 bg-surface-container rounded-lg border-2 border-outline-variant focus:border-primary focus:ring-0 font-body-lg px-md transition-all neomorphic-inset font-bold"
                  placeholder="e.g. Samuel"
                  required
                />
              </div>

              {/* Child Age */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-primary ml-1 font-bold text-xs">
                  Child's Age
                </label>
                <div className="flex flex-wrap gap-sm">
                  {ages.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        playSquish();
                        setSelectedAge(age);
                      }}
                      className={`px-md py-sm rounded-full font-label-caps border-2 font-bold transition-all squish-effect cursor-pointer ${
                        selectedAge === age
                          ? "bg-primary-container text-on-primary-container border-primary shadow-md"
                          : "bg-surface-container border-transparent hover:border-primary-container text-on-surface-variant"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Child Mock */}
              <div className="pt-sm border-t border-surface-container/50">
                <button
                  type="button"
                  onClick={playSquish}
                  className="flex items-center gap-xs text-secondary font-label-caps hover:underline transition-all font-bold cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Add Another Child
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Avatar Selection */}
          <div className="lg:col-span-5 flex flex-col gap-md">
            <div className="bg-secondary-container/30 backdrop-blur-md rounded-xl p-md border border-white/40 soft-shadow flex-grow">
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-headline-md text-on-secondary-container font-bold">Choose an Avatar</h3>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-sm">
                {AVATARS.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => {
                      playSquish();
                      setSelectedAvatarUrl(avatar.url);
                    }}
                    className="relative cursor-pointer"
                  >
                    <div
                      className={`w-full aspect-square rounded-full border-4 p-1 bg-white overflow-hidden transition-transform hover:scale-105 ${
                        selectedAvatarUrl === avatar.url ? "border-primary shadow-lg" : "border-transparent bg-white/50 hover:border-secondary-container"
                      }`}
                    >
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={avatar.url}
                        alt={avatar.name}
                      />
                    </div>
                    {selectedAvatarUrl === avatar.url && (
                      <div className="absolute -top-1 -right-1 bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Randomize Option */}
                <button
                  type="button"
                  onClick={() => {
                    playSquish();
                    const randAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
                    setSelectedAvatarUrl(randAvatar.url);
                  }}
                  className="w-full aspect-square rounded-full bg-surface-container flex flex-col items-center justify-center gap-1 hover:bg-primary-container transition-colors group cursor-pointer border-2 border-transparent hover:border-primary/20"
                >
                  <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform duration-500">
                    casino
                  </span>
                  <span className="text-[10px] font-label-caps font-bold">Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-xl flex flex-col items-center gap-md">
          <button
            onClick={handleProfileSubmit}
            disabled={isSubmitting}
            className="px-xl py-md bg-primary-container text-on-primary-container font-headline-md rounded-full soft-shadow squish-effect border-b-4 border-primary-fixed-dim min-w-[280px] font-bold text-lg hover:brightness-105 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Profile"}
          </button>
          
          <p className="font-body-md text-tertiary font-medium flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">security</span>
            All child data is kept safe &amp; private.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-low mt-auto">
        <div className="font-headline-md text-primary font-bold">Bible Teddy</div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Privacy Policy
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Terms of Service
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Parent Support
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Contact Us
          </a>
        </div>
        <div className="font-label-caps text-label-caps text-secondary text-center md:text-right font-bold">
          &copy; 2026 Bible Teddy. Safe &amp; Wonder-filled Learning.
        </div>
      </footer>
    </div>
  );
}
