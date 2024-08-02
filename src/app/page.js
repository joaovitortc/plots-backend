"use client";
import { useState, useEffect } from "react";
import Wallet from "../components/Wallet";
import Dropdown from "../components/Dropdown";
import Image from "next/image";
import "./globals.css";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openDropdown = () => setIsDropdownOpen(true);
  const closeDropdown = () => setIsDropdownOpen(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Error fetching sign message:", error);
      }
    };

    fetchMessage();
  }, []);

  const disconnectWallet = async () => {
    setProvider(null);
    setAccount(null);
    setIsSignedIn(false);
  };

  const signIn = async () => {
    if (!provider) {
      console.error("Provider is not set");
      return;
    }

    const signer = await provider.getSigner();

    try {
      const signature = await signer.signMessage(message);
      console.log("Signature successful:", signature);

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature, message }),
      });

      // result will be { message: 'User already exists' or 'User created', user: user }
      const result = await response.json();
      
      if (response.ok) {
        setIsSignedIn(true);
        setIsDropdownOpen(false);
        console.log("Sign-in successful:", result);
      } else {
        console.error("Sign-in failed:", result);
      }
    } catch (error) {
        console.error("An error occurred:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {account ? (
        <div className="relative">
          <button
            type="button"
            className="flex rounded-full px-4 text-sm font-medium hover:opacity-80"
            onClick={openDropdown}
          >
            <div className="flex w-full items-center justify-center rounded-full p-[2px] opacity-90 transition-opacity">
              <div className="flex h-11 w-full select-none items-center justify-center rounded-full px-4 text-center border-regular text-[16px] font-semibold">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </div>
            </div>
          </button>
          {isDropdownOpen && (
            <Dropdown
              onSignIn={signIn}
              onClose={() => {
                closeDropdown();
                disconnectWallet();
                closeModal();
              }}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          className="flex rounded-full px-4 text-sm font-medium hover:opacity-80"
          onClick={openModal}
        >
          <div className="flex w-full items-center justify-center rounded-full p-[2px] opacity-90 transition-opacity">
            <div className="flex h-11 w-full select-none items-center justify-center rounded-full px-4 text-center text-[16px] bg-glow-button-purple font-semibold">
              Connect Wallet
            </div>
          </div>
        </button>
      )}

      {isSignedIn && (
        <div>
          <div className="text-2xl font-semibold text-[#EEEDF1]">
            You are signed in!
          </div>
        </div>
      )}
      <Wallet
        isOpen={isModalOpen}
        onClose={closeModal}
        setProvider={setProvider}
        setAccount={setAccount}
      />
    </main>
  );
}
