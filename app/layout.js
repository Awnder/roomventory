import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "/Components/navbar.js"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Roomventory",
  description: "A group inventory management software",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
