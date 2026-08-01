import { Quicksand } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata = {
  title: "Bible Teddy - Interactive Faith Adventures",
  description: "Turn screen time into active, voice-interactive faith learning with Bible Teddy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
