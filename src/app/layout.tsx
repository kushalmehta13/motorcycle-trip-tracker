import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Ride Collective · The Rides & Garage",
  description:
    "Ride Collective is hand-picked motorcycle rides and your personal garage. Maps, mileage, and mood tags for roads worth the detour.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en">
        <body
          className={`${archivoBlack.variable} ${spaceGrotesk.variable} font-sans antialiased`}
        >
          {children}
          {modal}
        </body>
      </html>
    </ClerkProvider>
  );
}
