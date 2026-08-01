"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { resolvePostLoginPath } from "@/lib/postLoginPath";

export default function ParentSignUpPage() {
  const router = useRouter();
  const { signUp, signIn, signInWithGoogle, signInWithYouVersion, playSquish, parent } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteRef, setInviteRef] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    const hint = params.get("hint");
    const refParam = params.get("ref");
    if (refParam) {
      localStorage.setItem("btb_invite_ref", refParam);
      setInviteRef(refParam);
    }
    if (params.get("mode") === "login") {
      setIsSignInMode(true);
    }
    if (oauthError) {
      let msg = `Sign-in failed: ${oauthError.replace(/_/g, " ")}`;
      if (oauthError.includes("redirect") || hint) {
        msg += `. Register this callback at platform.youversion.com: https://bibleteddy.vercel.app/api/youversion/callback`;
      }
      if (hint) msg += hint;
      setErrorMsg(msg);
    }
  }, []);

  // Mouse sparkle script replica
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (Math.random() > 0.94) {
        const sparkle = document.createElement("span");
        sparkle.className = "material-symbols-outlined sparkle-accent text-primary-container pointer-events-none";
        sparkle.style.position = "fixed";
        sparkle.style.left = e.clientX + "px";
        sparkle.style.top = e.clientY + "px";
        sparkle.style.fontSize = Math.random() * 20 + 10 + "px";
        sparkle.style.fontVariationSettings = "'FILL' 1";
        sparkle.innerText = "sparkles";
        sparkle.style.zIndex = "100";
        sparkle.style.transition = "all 1.5s ease";
        sparkle.style.opacity = "0.7";
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
          sparkle.style.transform = `scale(1.5) translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 50}px)`;
          sparkle.style.opacity = "0";
        }, 50);

        setTimeout(() => {
          sparkle.remove();
        }, 1500);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!agree && !isSignInMode) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    playSquish();

    try {
      if (isSignInMode) {
        const user = await signIn(email, password);
        const dest = await resolvePostLoginPath(user?.id, "/parent");
        router.push(dest);
      } else {
        await signUp(email, password);
        router.push("/onboarding/child");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYouVersionSignIn = () => {
    playSquish();
    setIsSubmitting(true);
    setErrorMsg("");
    signInWithYouVersion();
  };

  const handleGoogleSignIn = async () => {
    playSquish();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await signInWithGoogle();
      // Redirect handled by OAuth callback: /api/auth/callback
    } catch (err) {
      setErrorMsg(err.message || "Could not sign in with Google. Check your Supabase config.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 backdrop-blur-xl bg-surface/80 shadow-[0_20px_20px_rgba(112,93,0,0.15)]">
        <Link href="/" className="flex items-center gap-sm">
          <span className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold">
            Bible Teddy
          </span>
        </Link>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-headline-md hover:scale-105 transition-transform duration-200 cursor-pointer">
            help
          </span>
        </div>
      </header>

      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col items-center stained-glass-bg overflow-hidden flex-grow">
        {/* Progress Stepper */}
        <div className="w-full max-w-md mt-lg mb-xl relative">
          <div className="flex justify-between items-center relative z-10">
            {/* Step 1: Active */}
            <div className="flex flex-col items-center gap-xs">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                1
              </div>
              <span className="font-label-caps text-label-caps text-primary font-bold">Account</span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-xs">
              <div className="w-12 h-12 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-lg border-4 border-white">
                2
              </div>
              <span className="font-label-caps text-label-caps text-tertiary opacity-50 font-bold">Profile</span>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-xs">
              <div className="w-12 h-12 rounded-full bg-surface-container-high text-outline flex items-center justify-center font-bold text-lg border-4 border-white">
                3
              </div>
              <span className="font-label-caps text-label-caps text-tertiary opacity-50 font-bold">Theme</span>
            </div>
          </div>
          {/* Progress Line Background */}
          <div className="absolute top-6 left-0 w-full h-2 bg-surface-container-high -z-0 rounded-full"></div>
          {/* Progress Line Active */}
          <div className="absolute top-6 left-0 w-1/4 h-2 bg-primary-container -z-0 rounded-full transition-all duration-500"></div>
        </div>

        {inviteRef && (
          <div className="w-full max-w-md mb-md p-md rounded-xl border-2 border-primary/30 bg-primary-container/20 text-center">
            <p className="font-headline-md text-sm font-black text-primary">🎉 You were invited to Bible Teddy!</p>
            <p className="font-body-md text-xs text-on-surface-variant font-medium mt-1">
              A family shared a faith milestone with you. Create your free account to start your own kids&apos; Bible adventure.
            </p>
          </div>
        )}

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-lg items-center mt-4">
          {/* Left Side: Teddy Message */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left gap-md order-2 md:order-1">
            <div className="relative w-60 md:w-72 aspect-square floating-teddy">
              <div className="absolute inset-0 bg-secondary-container opacity-20 blur-3xl rounded-full"></div>
              <img
                alt="Bible Teddy Mascot"
                className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDkrjLF76DxLGFtdmP2YKtIIrOTj_don_NgujVlC15PwjFJmB5uBD33f7XDLZLN9FnHuxw2jZHsAl9xDFzywjRXMjwACHtycX-ChReIldhyFGRkWgImdbr7-OqEyCUvThorkp4BMvZiycWMdn1lBxiYGsS2_SFMRdZnkDiR-6w7GzuyKAnF_3EHsBiEmzx-Z74yhnuYSTfyHIkyyN8oI8Z-r-TJQSlx8y5d6I2VsXAILmPreBs3c9-ig"
              />
              {/* Sparkle Decorations */}
              <span className="material-symbols-outlined sparkle-accent text-primary-container top-0 right-0 text-[3rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="material-symbols-outlined sparkle-accent text-secondary top-1/4 -left-8 text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            
            <div className="bg-white/80 glass-panel p-md md:p-lg rounded-xl soft-neomorph border-2 border-primary-container/30 relative">
              {/* Speech Bubble Tail */}
              <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rotate-45 border-l-2 border-b-2 border-primary-container/30"></div>
              <h2 className="font-headline-md text-headline-md text-primary mb-sm font-bold">Welcome Home!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed font-medium">
                I'm so glad you're here! Linking your YouVersion account helps me sync your family's favorite stories and see all the amazing scripture progress you make together.
              </p>
            </div>
          </div>

          {/* Right Side: Sign-Up Form */}
          <div className="md:col-span-7 w-full order-1 md:order-2">
            <div className="bg-white p-lg md:p-xl rounded-xl soft-neomorph border border-surface-variant flex flex-col gap-lg shadow-lg">
              <div className="text-center md:text-left">
                <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface mb-xs font-bold leading-tight">
                  {isSignInMode ? "Welcome Back" : "Join the Journey"}
                </h1>
                <p className="font-body-md text-body-md text-tertiary font-medium">
                  {isSignInMode
                    ? "Log in to check on your child's progress."
                    : "Start your child's adventure into God's Word today."}
                </p>
              </div>

              {/* YouVersion — optional; link after email signup works too */}
              <button
                id="youversion-signin-btn"
                onClick={handleYouVersionSignIn}
                disabled={isSubmitting}
                className="squish-btn w-full py-md px-lg rounded-full flex items-center justify-center gap-3 hover:brightness-95 transition-all cursor-pointer shadow-md disabled:opacity-50 border-2 bg-[#ff6600] border-[#e55a00] text-white"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
                <span className="font-headline-md font-bold">
                  {isSignInMode ? "Sign in with YouVersion" : "Link YouVersion account"}
                </span>
              </button>
              <p className="text-center text-xs text-tertiary font-medium -mt-sm">
                Or use email below to {isSignInMode ? "log in" : "create an account"} — YouVersion is optional.
              </p>

              {/* Google Social Login */}
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="squish-btn w-full py-md px-lg rounded-full flex items-center justify-center gap-3 hover:brightness-95 transition-all cursor-pointer shadow-md disabled:opacity-50 border-2"
                style={{ background: "white", borderColor: "#d0c6ab" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-headline-md font-bold" style={{ color: "#1b1c1a" }}>
                  {isSignInMode ? "Sign in with Google" : "Continue with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-md py-sm">
                <div className="h-px flex-1 bg-outline-variant"></div>
                <span className="font-label-caps text-label-caps text-outline uppercase font-bold text-xs">
                  or use email
                </span>
                <div className="h-px flex-1 bg-outline-variant"></div>
              </div>

              {/* Email Form */}
              <form className="flex flex-col gap-md" onSubmit={handleFormSubmit}>
                {errorMsg && (
                  <div className="p-sm bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-md font-medium text-center">
                    {errorMsg}
                  </div>
                )}
                
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-primary ml-sm font-bold text-xs">
                    Parent's Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                      mail
                    </span>
                    <input
                      className="w-full pl-12 pr-md py-md bg-surface-container-low rounded-lg border-2 border-transparent focus:border-primary-container focus:ring-0 font-body-md input-inset transition-all"
                      placeholder="hello@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-primary ml-sm font-bold text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                      lock
                    </span>
                    <input
                      className="w-full pl-12 pr-md py-md bg-surface-container-low rounded-lg border-2 border-transparent focus:border-primary-container focus:ring-0 font-body-md input-inset transition-all"
                      placeholder="Min. 8 characters"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isSignInMode && (
                  <label className="flex items-start gap-md cursor-pointer group mt-sm">
                    <div className="relative flex items-center mt-1">
                      <input
                        className="peer h-5 w-5 rounded border-2 border-outline-variant text-primary focus:ring-primary-container focus:ring-offset-0"
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant leading-tight font-medium select-none">
                      I agree to the{" "}
                      <a className="text-secondary font-bold hover:underline" href="#">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a className="text-secondary font-bold hover:underline" href="#">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-md w-full bg-secondary py-md rounded-full text-white font-headline-md font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : isSignInMode ? "Sign In" : "Create Account"}
                </button>
              </form>

              <p className="text-center font-body-md text-body-md text-tertiary font-medium">
                {isSignInMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsSignInMode(!isSignInMode);
                    setErrorMsg("");
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  {isSignInMode ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-low mt-auto">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-primary font-bold">Bible Teddy</span>
          <p className="font-label-caps text-label-caps text-tertiary text-center md:text-left font-bold">
            &copy; 2026 Bible Teddy. Safe &amp; Wonder-filled Learning.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-md">
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
        </nav>
      </footer>
    </div>
  );
}
