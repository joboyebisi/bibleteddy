---
name: Stained Glass Sparkle
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#4d4732'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#7e775f'
  outline-variant: '#d0c6ab'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#ffd700'
  on-primary-container: '#705e00'
  inverse-primary: '#e9c400'
  secondary: '#0c6780'
  on-secondary: '#ffffff'
  secondary-container: '#9ae1ff'
  on-secondary-container: '#09657f'
  tertiary: '#5c5d6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#d8d8ec'
  on-tertiary-container: '#5c5e6e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe16d'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#baeaff'
  secondary-fixed-dim: '#89d0ed'
  on-secondary-fixed: '#001f29'
  on-secondary-fixed-variant: '#004d62'
  tertiary-fixed: '#e1e1f5'
  tertiary-fixed-dim: '#c5c5d8'
  on-tertiary-fixed: '#191b29'
  on-tertiary-fixed-variant: '#444655'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 30px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-caps:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is crafted for a young audience, blending the reverent beauty of traditional stained glass with the soft, huggable warmth of a childhood companion. The brand personality is encouraging, safe, and wonder-filled. 

The visual style utilizes a "Soft Neomorphism" approach—avoiding harsh shadows in favor of deep, pillowy elevations and glowing inner-light effects. Surfaces should feel tactile, as if they are made of soft silicone or plush fabric. Every interaction is designed to feel like a gentle hug, using vibrant colors to signify the joy of learning.

## Colors

The palette is anchored by **Golden Yellow** (Primary), representing light and wisdom. **Sky Blue** (Secondary) provides a sense of calm and openness, while **Lavender** (Tertiary) adds a touch of mystery and softness. 

- **Primary (Golden Yellow):** Used for main actions and success states. It should always feel sunny, never muddy.
- **Secondary (Sky Blue):** Used for information containers and navigation elements.
- **Tertiary (Lavender):** Used for background layering and soft decorative elements.
- **Neutral (Cream White):** The base canvas. Avoid pure #FFFFFF; use a warm cream to reduce eye strain for children.
- **Accent (Rose):** Reserved for "love," "heart," and "care" related feedback.

## Typography

This design system exclusively uses **Quicksand** to maintain a consistent, friendly, and rounded character across all touchpoints. 

- **Headlines:** Always Bold (700) to ensure high readability. Use tight letter-spacing for large display text to give it a "sticker-like" appearance.
- **Body Text:** Use Medium (500) weight instead of Regular to ensure strokes are thick enough for early readers to process easily against colorful backgrounds.
- **Line Height:** Generous leading is applied to prevent text from feeling cramped or overwhelming.

## Layout & Spacing

The layout philosophy is **Fluid & Playful**. Instead of rigid grids, the design system utilizes large, safe margins and dynamic containers that "float" on the background.

- **Mobile:** 1-column layout with 16px side margins. Elements should take up the full width of the safe area to provide large "tap targets" for small fingers.
- **Tablet/Desktop:** Content is centered in a max-width container of 1024px. Use a 12-column grid with wide 24px gutters to allow the UI to breathe.
- **Spacing Rhythm:** Based on an 8px scale. Use `lg` (48px) and `xl` (80px) vertical spacing between major sections to maintain a sense of clarity and focus.

## Elevation & Depth

Depth is conveyed through **Tonal Softness** and **Internal Glows**. 

1.  **Level 0 (Floor):** The Cream White background.
2.  **Level 1 (Cards):** Soft, white surfaces with a 15% opacity drop shadow (blurred 20px) tinted with the primary yellow color. This creates a "glow" rather than a dark shadow.
3.  **Level 2 (Active Elements):** Buttons and interactive chips use an inner-shadow effect on the top-left to create a 3D "squishy" appearance, as if the button is a physical toy.
4.  **Glassmorphism:** Use backdrop blurs (20px) for overlays and navigation bars to simulate the "Stained Glass" aesthetic, allowing the vibrant background colors to peek through.

## Shapes

The shape language is strictly **Extra Rounded (3)**. There are no sharp corners in this design system. 

- **Standard Components:** Use a base radius of 1rem (16px).
- **Cards & Containers:** Use `rounded-xl` (3rem / 48px) to emphasize the "plush" feel.
- **Buttons:** Always use pill-shaped (fully rounded) ends.
- **Stroke:** When borders are used, they must be thick (3px+) and colored with a darker shade of the surface color to maintain the "toy" aesthetic.

## Components

- **Buttons:** Large, pill-shaped, and high-contrast. The primary button uses a Golden Yellow background with a subtle "squish" (inner shadow) and thick dark-yellow bottom border to simulate 3D depth.
- **Cards:** White or Sky Blue containers with `rounded-xl` corners. Cards should feature a "sparkle" icon in the top corner for accomplishments or new lessons.
- **Input Fields:** Thick borders, Quicksand Medium text, and a background color that is slightly darker than the page background to indicate "inset" depth.
- **Chips/Badges:** Small, rounded elements used for categories (e.g., "Parables," "Old Testament"). Use the Lavender palette for a soft, secondary feel.
- **Iconography:** Use 3pt or 4pt stroke widths. All terminal ends of lines must be rounded. Icons should be encased in a circular colored "bubble" to mimic stained glass fragments.
- **Progress Bars:** Thick, rounded tracks (16px height) with a "pulsing" glow effect on the filled portion to encourage the child as they progress through a story.