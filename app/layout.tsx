import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-roboto-flex",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${robotoFlex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
