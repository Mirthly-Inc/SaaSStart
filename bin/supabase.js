#!/usr/bin/env node

import chalk from "chalk";
import fs from "fs-extra";
import { execa, execaCommand } from "execa";
import path from "path";
import prompts from "prompts";

async function firebase_generate() {
  console.log("-----Welcome to SaaSStart-----");
  console.log(
    "---->You are using default setup : Next.js(TS), Firebase, Mailgun, Stripe"
  );
  try {
    let projectName;
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "Name for your project?",
      initial: "my-app",
      validate: validateProjectName,
    });
    projectName = response.projectName;

    console.log("Creating Next app");
    await execa(
      "npx",
      [
        "create-next-app@latest",
        projectName,
        "--typescript",
        "--tailwind",
        "--eslint",
        "--app",
        "--no-src-dir",
        "--no-import-alias",
      ],
      {
        stdio: "inherit",
        timeout: 300000,
      }
    );
    console.log("Next app created Successfully");

    try {
      process.chdir(projectName);
      console.log("Changed to project directory");
    } catch (error) {
      console.error(chalk.red("Error changing to project directory:"), error);
      process.exit(1);
    }
    console.log("Installing additional dependencies...");
    const dependencies = ["firebase", "stripe", "mailgun.js"];
    try {
      await execaCommand(`npm install ${dependencies.join(" ")}`);
      await execaCommand("npm install @stripe/stripe-js");
      console.log(chalk.green("Dependencies installed successfully"));
    } catch (error) {
      console.error(chalk.red("Error installing dependencies:"), error);
      process.exit(1);
    }
    console.log("Configuring project...");

    await configureProject();

    console.log(chalk.green("Project created successfully!"));

    console.log(chalk.green("Run --> npm run dev"));
    console.log(chalk.green("Add ENV variable"));
  } catch (error) {
    console.log(chalk.red("Cannot create Next App"), error);
    process.exit(1);
  }
}

//Add the verified file <SVG> verified file
async function validateProjectName(name) {
  // Check if name is empty
  if (!name.trim()) {
    return "Project name cannot be empty.";
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(name)) {
    return "Project name cannot contain uppercase letters.";
  }

  // Check for spaces
  if (/\s/.test(name)) {
    return "Project name cannot contain spaces.";
  }

  // Check for valid characters (allowing only lowercase letters, numbers, hyphens, and underscores)
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return "Project name can only contain lowercase letters, numbers, hyphens, and underscores.";
  }

  // Check if name starts with a number
  if (/^[0-9]/.test(name)) {
    return "Project name cannot start with a number.";
  }

  return true;
}

async function configureProject() {
  const projectdir = process.cwd();

  //Configure your database and auth
  await configureDatabaseAndAuth(projectdir);

  //configure Stripe payment
  await configureStripe(projectdir);

  //configure mailgun
  await configureMailgun(projectdir);

  //configure Constants
  await configureConstants(projectdir);

  //configure success page
  await configureSuccessandCancel(projectdir);

  //configure components
  await configureComponents(projectdir);

  //configure already present files
  await replaceContents(projectdir);

  //configure ENV variables
  await configureEnv(projectdir);

  //configure Assests
  await configureAssests(projectdir);
}

async function configureAssests(projectdir) {
  const assestsDir = path.join(projectdir, "app", "assests");
  await fs.ensureDir(assestsDir);

  const assestscontent = getAssestsContent();
  await fs.writeFile(path.join(assestsDir, "verified.tsx"), assestscontent);
}

function getAssestsContent() {
  return `
  import React from "react";

interface VerifiedProps {
  className?: string;
}

export const Verified: React.FC<VerifiedProps> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
};
`;
}

async function configureEnv(projectdir) {
  const replaceENVvalue = getENVContent();
  await fs.writeFile(path.join(projectdir, ".env.local"), replaceENVvalue);
}

function getENVContent() {
  return `#Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

#Mailgun keys
NEXT_PUBLIC_MAILGUN_API_KEY=
NEXT_PUBLIC_MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=

#Your firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
`;
}

async function replaceContents(projectdir) {
  const PageModify = path.join(projectdir, "app", "page.tsx");
  const replacePageValue = getpageContent();

  await replaceInFile(PageModify, replacePageValue);

  const cssModify = path.join(projectdir, "app", "globals.css");
  const replaceCssValue = getcssContent();

  await replaceInFile(cssModify, replaceCssValue);

  const layoutModify = path.join(projectdir, "app", "layout.tsx");
  const replaceLayoutValue = getLayoutContent();

  await replaceInFile(layoutModify, replaceLayoutValue);
}

function getLayoutContent() {
  return `import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { details } from "./constants/Constants";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: details.app.title,
  description: details.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        {children}
      </body>
    </html>
  );
}
`;
}

function getcssContent() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.testimonial-scroll {
  animation: scroll 30s linear infinite;
  width: 200%; /* Ensure there's enough width for the duplicated content */
}

.testimonial-scroll:hover {
  animation-play-state: paused;
}
`;
}

async function replaceInFile(fileToModify, replaceValue) {
  try {
    await fs.writeFile(fileToModify, replaceValue, "utf8");
    console.log(
      chalk.green(`Successfully replaced contents of ${fileToModify}`)
    );
  } catch (error) {
    console.error(
      chalk.red(`Error replacing contents of ${fileToModify}:`),
      error
    );
  }
}

function getpageContent() {
  return `import Home from "./components/Home";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <>
      <Home />
      <Footer />
    </>
  );
}
`;
}

async function configureComponents(projectdir) {
  const componentsDir = path.join(projectdir, "app", "components");
  await fs.ensureDir(componentsDir);

  const Footer = getFooter();
  await fs.writeFile(path.join(componentsDir, "Footer.tsx"), Footer);

  const Home = getHome();
  await fs.writeFile(path.join(componentsDir, "Home.tsx"), Home);

  const Navbar = getNavbar();
  await fs.writeFile(path.join(componentsDir, "Navbar.tsx"), Navbar);

  const Pricing = getPricing();
  await fs.writeFile(path.join(componentsDir, "Pricing.tsx"), Pricing);

  const Testimonials = getTestimonials();
  await fs.writeFile(
    path.join(componentsDir, "Testimonials.tsx"),
    Testimonials
  );

  const VideoDemo = getVideoDemo();
  await fs.writeFile(path.join(componentsDir, "VideoDemo.tsx"), VideoDemo);

  const Availableservices = getAvailableservices();
  await fs.writeFile(
    path.join(componentsDir, "Availableservices.tsx"),
    Availableservices
  );
}

function getVideoDemo() {
  return `
  import React from "react";
import { details } from "../constants/Constants";

export default function VideoDemo() {
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-black text-white my-12 py-12 rounded-xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Watch Our Demo</h2>
          <p className="text-xl text-gray-300">
            See how your \`\${details.app.title}\` can revolutionize
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center mb-8">
          <img
            src="https://apod.nasa.gov/apod/image/2409/iss071e564695_1024.jpg"
            alt={details.app.demo.name}
            className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6"
          />
          <div>
            <h3 className="text-xl font-semibold">{details.app.demo.name}</h3>
            <p className="text-gray-300">{details.app.demo.role}</p>
            <p className="text-gray-400 mt-2">{details.app.demo.bio}</p>
          </div>
        </div>

        <div
          className="relative w-full max-w-2xl mx-auto"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            src={\`\${details.app.demo.demo_url}\`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
`;
}

function getTestimonials() {
  return `import React from "react";
import { details } from "../constants/Constants";

export default function Testimonials() {
  return (
    <div className="py-12 bg-black overflow-hidden rounded-xl my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-8">
          What Our Users Say
        </h2>
        <div className="relative">
          <div className="testimonial-scroll flex animate-scroll">
            {[...details.testimonials, ...details.testimonials].map(
              (testimonial, index) => (
                <div
                  key={\`\${testimonial.id}-\${index}\`}
                  className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 rounded-lg shadow-md p-6 w-80 flex-shrink-0 mx-4 transition-all duration-300 hover:scale-105"
                >
                  <p className="mb-4 text-gray-300">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function getPricing() {
  return `"use client";
import { auth, db } from "@/lib/database";
import { useState, useEffect } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { Verified } from "../assests/verified";
import { loadStripe } from "@stripe/stripe-js";
import { doc, getDoc } from "firebase/firestore";
import { details } from "../constants/Constants";
import { onAuthStateChanged } from "firebase/auth";

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  //check whether user has already purchased or not
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      //@ts-ignore
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHasPurchased(docSnap.data().hasPurchased);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  //handle checkout -- POST -> /api/stripe
  const handleCheckout = async (plan: (typeof details.plans)[0]) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (hasPurchased) {
      alert("You have already purchased a plan.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        //@ts-ignore
        body: JSON.stringify({ plan, userId: user?.uid }),
      });

      const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      //redirect to the sessionId given by stripe
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Error:", error);
        setLoading(false);
        return;
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-black py-16 rounded-xl my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Select the perfect plan for your project needs
          </p>
        </div>
        <div className="mt-16 flex justify-center space-x-8">
          {details.plans.map((plan, index) => (
            <div
              key={index}
              className={\`flex flex-col rounded-lg shadow-lg overflow-hidden w-full max-w-md \${
                plan.highlighted
                  ? "border-2 border-blue-500 transform scale-105"
                  : "border border-gray-700"
              }\`}
            >
              <div className="px-6 py-8 bg-[#212021] sm:p-10 sm:pb-6">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-semibold leading-6 text-white">
                    {plan.name}
                  </h3>
                  {plan.highlighted && (
                    <span className="px-3 py-1 text-sm font-semibold leading-5 tracking-wide uppercase rounded-full bg-blue-500 text-white">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline text-6xl font-extrabold text-white">
                  {plan.price}
                  <span className="ml-1 text-2xl font-medium text-gray-400">
                    /month
                  </span>
                </div>
                <p className="mt-5 text-lg text-gray-400">{plan.description}</p>
              </div>
              <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-[#212021] space-y-6 sm:p-10 sm:pt-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Verified
                          className={
                            feature.included ? "text-blue-500" : "text-gray-400"
                          }
                        />
                      </div>
                      <p
                        className={\`ml-3 text-base \${
                          feature.included
                            ? "text-white"
                            : "text-gray-400 line-through"
                        }\`}
                      >
                        {feature.name}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="rounded-md shadow">
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={loading || hasPurchased}
                    className={\`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white \${
                      plan.highlighted
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    } transition duration-150 ease-in-out \${
                      loading || hasPurchased
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }\`}
                  >
                    {loading
                      ? "Processing..."
                      : hasPurchased
                      ? "Already Purchased"
                      : plan.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function getNavbar() {
  return `"use client";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "../../lib/database";
import { signOut, signInWithGoogle } from "../../lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { details } from "../constants/Constants";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  //check status fo auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // No need to redirect, as the auth state change will trigger a re-render
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // No need to redirect, as the auth state change will trigger a re-render
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <nav className="text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          \`\${details.app.title}\`
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">
                Welcome, {user.displayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition duration-300 ease-in-out"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition duration-300 ease-in-out"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
`;
}

function getHome() {
  return `
  import Availableservices from "./Availableservices";
import Navbar from "./Navbar";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import VideoDemo from "./VideoDemo";
import { details } from "../constants/Constants";

export default function Home() {
  return (
    <div className="min-h-screen w-[80%] mx-auto">
      <Navbar />
      <div className="text-center text-4xl font-bold py-10">
        \`\${details.app.slogan}\`
      </div>
      <Testimonials />
      <VideoDemo />
      <Availableservices />
      <Pricing />
    </div>
  );
}
`;
}

function getFooter() {
  return `
  import React from "react";
import { details } from "../constants/Constants";

export default function Footer() {
  return (
    <footer className="bg-[#212021] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {details.footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="hover:text-gray-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2024 Alter, Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {details.socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
`;
}

function getAvailableservices() {
  return `export default function Availableservices() {
    return(
      <div className="text-4xl text-white">Mention Your available services</div>
    )
}
`;
}

async function configureSuccessandCancel(projectdir) {
  const SuccessDir = path.join(projectdir, "app", "success");
  await fs.ensureDir(SuccessDir);
  const successContent = getSuccessContent();
  await fs.writeFile(path.join(SuccessDir, "page.tsx"), successContent);

  const CancelDir = path.join(projectdir, "app", "cancel");
  await fs.ensureDir(CancelDir);
  const cancelContent = getCancelContent();
  await fs.writeFile(path.join(CancelDir, "page.tsx"), cancelContent);
}

function getCancelContent() {
  return `
  export default function Cancel() {
  return (
    <div>
      <div>Please Check Your internet Connection!</div>
      <div>If amount debited please contact support for more details</div>
    </div>
  );
}
`;
}

function getSuccessContent() {
  return `"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

//after payement is done redirect to "/"
export default function SuccessPage() {
  const [status, setStatus] = useState("loading");
  const router = useRouter();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      fetch(\`/api/stripe?session_id=\${sessionId}\`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            setStatus("success");
            setTimeout(() => router.push("/"), 5000);
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [router]);

  if (status === "loading") {
    return <div>Processing your payment...</div>;
  }

  if (status === "error") {
    return (
      <div>
        There was an error processing your payment. Please contact support.
      </div>
    );
  }

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>
        Thank you for your purchase. You will be redirected to the home page in
        5 seconds.
      </p>
    </div>
  );
}
  `;
}

async function configureConstants(projectdir) {
  const ConstantsDir = path.join(projectdir, "app", "constants");
  await fs.ensureDir(ConstantsDir);
  const constantsContent = getConstantsContent();
  await fs.writeFile(path.join(ConstantsDir, "Constants.ts"), constantsContent);
}

function getConstantsContent() {
  return `export const details = {
  stripe: {
    plan_Id: "Your plan ID obtained from stripe",

    //for one-time-payments
    mode: "payment" as string,
  },
  app: {
    title: "Your App Name",
    description: "Your app description",
    slogan:"Your app slogan",
    demo: {
      role: "Role",
      name: "Your name",
      //add embed to load the video
      //wwww.youtube.com/kjsdnjdsj ----> //www.youtube.com/embed/kjsdnjdsj
      demo_url: "https://www.youtube.com/embed/dskvbfdjvbj",
      bio: "Passionate about simplifying app development for startups and developers.",
      avatarUrl: "https://example.com/demo.jpg",
    },
  },
  testimonials: [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Software Developer",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer faucibus enim vitae nulla mollis",
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Project Manager",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer faucibus enim vitae nulla mollis.",
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Startup Founder",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer faucibus enim vitae nulla mollis.",
    },
    {
      id: 4,
      name: "Daryl Dixon",
      role: "Startup Founder",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer faucibus enim vitae nulla mollis.",
    },
  ],
  plans: [
    {
      name: "Basic Plan",
      price: "$100",
      priceId: "price_1PyqnJJ0UEKhTVBjTmxX4key", // Replace with actual Stripe Price ID
      description: "Perfect for small projects",
      features: [
        { name: "Feature 1", included: true },
        { name: "Feature 2", included: true },
        { name: "Feature 3", included: true },
        { name: "Feature 4", included: true },
        { name: "Feature 5", included: false },
        { name: "Feature 6", included: false },
        { name: "Feature 7", included: false },
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro Plan",
      price: "$150",
      priceId: "price_1PzhWFJ0UEKhTVBjIDO9X2kj", // Replace with actual Stripe Price ID
      description: "Ideal for growing businesses",
      features: [
        { name: "Feature 1", included: true },
        { name: "Feature 2", included: true },
        { name: "Feature 3", included: true },
        { name: "Feature 4", included: true },
        { name: "Feature 5", included: true },
        { name: "Feature 6", included: true },
        { name: "Feature 7", included: true },
      ],
      buttonText: "Upgrade Now",
      highlighted: true,
    },
  ],
  socialLinks: [
    { name: "Twitter", url: "https://twitter.com/" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "LinkedIn", url: "https://linkedin.com/" },
  ],
  //add links as per your needs
  footerSections: [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "FAQ"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Contact"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Tutorials", "API Reference", "Community"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
    },
  ],
};
`;
}

async function configureMailgun(projectdir) {
  const mailgunContent = getMailgunContent();
  await fs.writeFile(
    path.join(projectdir, "lib", "mailgun.ts"),
    mailgunContent
  );
}

function getMailgunContent() {
  return `const formData = require("form-data");
const Mailgun = require("mailgun.js");

export default async function sendPurchaseConfirmationEmail(session: any) {
  //create a mailgun instance
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.NEXT_PUBLIC_MAILGUN_API_KEY || "key-yourkeyhere",
  });

  //send email
  mg.messages
    .create(process.env.NEXT_PUBLIC_MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: [\`\${session.customer_details.email}\`],
      subject: "Email Subject",
      html: \`<div>
              <h1>Your Startup Name</h1>
              <h2>Your purchase of \${session.payment_intent} is successful</h2>
            </div>\`,
    })
    .catch((err: any) => console.error(err));
}
`;
}

async function configureDatabaseAndAuth(projectdir) {
  const libdir = path.join(projectdir, "lib");
  await fs.ensureDir(libdir);

  //add database code
  const databaseContent = getDatabaseContent();
  await fs.writeFile(path.join(libdir, "database.ts"), databaseContent);

  //create auth code
  const authContent = getAuthContent();
  await fs.writeFile(path.join(libdir, "auth.ts"), authContent);

  //api auth
  const apiAuthDir = path.join(projectdir, "app", "api", "auth");
  await fs.ensureDir(apiAuthDir);
  const apiAuthContent = getapiAuthContent();
  await fs.writeFile(path.join(apiAuthDir, "route.ts"), apiAuthContent);
}

async function configureStripe(projectdir) {
  //stripe
  const stripeContent = getStripeContent();
  await fs.writeFile(path.join(projectdir, "lib", "stripe.ts"), stripeContent);

  //stripe api
  const stripeDir = path.join(projectdir, "app", "api", "stripe");
  await fs.ensureDir(stripeDir);
  const stripeApiContent = getAPIStripeContent();
  await fs.writeFile(path.join(stripeDir, "route.ts"), stripeApiContent);

  const stripewehookDir = path.join(
    projectdir,
    "app",
    "api",
    "stripe",
    "webhook"
  );
  await fs.ensureDir(stripewehookDir);
  const stripeWebhookContent = getStripeWebhookContent();
  await fs.writeFile(
    path.join(stripewehookDir, "route.ts"),
    stripeWebhookContent
  );
}

function getStripeWebhookContent() {
  return `
  import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { updateUserPurchaseStatus } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import sendPurchaseConfirmationEmail from "@/lib/mailgun";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    //verify the signature of Webhook to prevent to prevent unwanted data manipulations
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error(\`Webhook signature verification failed: \${error.message}\`);
      return NextResponse.json({ message: "Webhook Error" }, { status: 400 });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session: Stripe.Checkout.Session = event.data.object;
      const userId = session.metadata?.userId;

      // Create or update the stripe_customer_id in the stripe_customers table
      await updateUserPurchaseStatus(userId!, true);

      //send email via Mailgun
      await sendPurchaseConfirmationEmail(session);
    }
    //always return "success" to webhook
    return NextResponse.json({ message: "success" });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
  `;
}

function getAPIStripeContent() {
  return `import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { plan, userId } = await request.json();
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId, // Make sure this is a recurring price ID
          quantity: 1,
        },
      ],
      mode: "payment", // Changed from "payment" to "subscription"
      success_url: \`\${request.headers.get(
        "origin"
      )}/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${request.headers.get("origin")}/cancel\`,
      metadata: {
        userId: userId,
      },
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId;
    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("Error processing successful payment:", err);
    return NextResponse.json(
      { error: "Error processing successful payment" },
      { status: 500 }
    );
  }
}
`;
}

function getapiAuthContent() {
  return `
    import { NextApiRequest, NextApiResponse } from "next";
import { signInWithGoogle } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      //google auth sign-in with firebase
      //Enable google auth provider in firebase project
      const user = await signInWithGoogle();
      res.status(200).json({ user });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
`;
}

function getDatabaseContent() {
  return `
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
`;
}

function getAuthContent() {
  return `
    import {
  signOut as firebaseSignOut,
  User,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../lib/database";
import { doc, setDoc, getDoc } from "firebase/firestore";

//sign-in with google
//Enable google as provider in firebase console
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await createOrUpdateUserDocument(result.user);
    return result.user;
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      console.log(
        "Sign-in popup was closed by the user before finalizing the operation."
      );
      return null;
    }
    console.error("Error during sign-in:", error);
  }
}

//create a record of user in firebase after sign-in to track his purchase
async function createOrUpdateUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      hasPurchased: false,
    });
  }
}

//handle SignOut
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// New function to update user's purchase status
export async function updateUserPurchaseStatus(
  uid: string,
  hasPurchased: boolean
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { hasPurchased }, { merge: true });
}
`;
}

function getStripeContent() {
  return `import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
`;
}

firebase_generate();
