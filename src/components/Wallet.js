"use client";
import React from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Image from "next/image";
import metamaskImage from "../images/metamask.webp";
import coinbasewalletImage from "../images/coinbasewallet.webp";

const Wallet = ({ isOpen, onClose, setProvider, setAccount }) => {
  if (!isOpen) return null;

  // Web3Modal instance, used for connecting to different providers (not metamask)
  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: "test backend",
          infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
          chainId: 1,
          darkMode: false,
        },
      },
    },
  });

  const connectWallet = async (providerName) => {
    try {
      let providerInstance;
      let provider;

      if (providerName === "injected") {
        console.log("Connecting to MetaMask");

        // Logic to handle multiple web extensions (find all the providers and select MetaMask)
        if (window.ethereum && window.ethereum.providers) {
          const metamaskProvider = window.ethereum.providers.find(
            (p) => p.isMetaMask
          );

          if (metamaskProvider) {
            providerInstance = metamaskProvider;
          }

          //if only metamask exists, use it
        } else if (window.ethereum && window.ethereum.isMetaMask) {
          providerInstance = window.ethereum;
        } else {
          console.error("MetaMask is not installed");
          return;
        }
      } else {
        providerInstance = await web3Modal.connectTo(providerName);
      }

      provider = new ethers.BrowserProvider(providerInstance);

      await provider.send("eth_requestAccounts", []);

      const accounts = await provider.listAccounts();

      setProvider(provider);
      setAccount(accounts[0]);

      console.log("Account:", accounts[0]);
      onClose();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <div className="opacity-100 false fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center text-left backdrop-blur backdrop-brightness-75 transition duration-200">
      <div className="false rounded-2xl modal-border">
        <div className="flex w-72 flex-col rounded-2xl bg-cyan p-4 md:w-[30rem]">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-2xl font-semibold text-[#EEEDF1]">
              Connect Wallet
            </span>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full bg-white-100/20 hover:opacity-90"
              onClick={onClose}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                className="size-8"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M278.6 256l68.2-68.2c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-68.2-68.2c-6.2-6.2-16.4-6.2-22.6 0-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3l68.2 68.2-68.2 68.2c-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3 6.2 6.2 16.4 6.2 22.6 0l68.2-68.2 68.2 68.2c6.2 6.2 16.4 6.2 22.6 0 6.2-6.2 6.2-16.4 0-22.6L278.6 256z" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2 text-[1.1rem]">
            <button
              className="flex h-16 w-full cursor-pointer items-center justify-between rounded-[0.625rem] bg-black/25 px-5 hover:bg-black/20"
              onClick={() => connectWallet("injected")}
              type="button"
            >
              <div>MetaMask</div>
              <div className="relative size-10">
                <Image
                  alt="metamask"
                  src={metamaskImage}
                  width="40"
                  height="40"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    color: "transparent",
                  }}
                />
              </div>
            </button>
            <button
              className="flex h-16 w-full cursor-pointer items-center justify-between rounded-[0.625rem] bg-black/25 px-5 hover:bg-black/20"
              onClick={() => connectWallet("coinbasewallet")}
              type="button"
            >
              <div>Coinbase Wallet</div>
              <div className="relative size-9">
                <Image
                  alt="coinbase"
                  src={coinbasewalletImage}
                  width="40"
                  height="40"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    color: "transparent",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
