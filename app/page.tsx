"use client";

import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Journey } from "@/components/Journey";
import { Contact } from "@/components/Contact";
import { Spotlight, Ripple } from "@/components/Animations";

export default function Home() {
  return (
    <main className="relative">
      <Spotlight />
      <Ripple />
      <Hero />
      <About />
      <Journey />
      <Skills />
      <Projects />
      <Contact />
    </main>
  );
}
