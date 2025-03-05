// app/components/Header.tsx
import Link from "next/link";
import { Wrench, Bot } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-black text-white fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="container mx-auto flex justify-center py-2 px-4 md:px-6">
        <Link 
          href="/" 
          className="flex items-center gap-2"
          aria-label="DoItYourself.bot - Home"
        >
          <div className="p-2 rounded-lg flex items-center">
            <Bot size={32} className="text-orange-400" aria-hidden="true" />
            <Wrench size={32} className="ml-1 text-orange-400" aria-hidden="true" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold tracking-wide font-mono">
            DoItYourself.bot
          </h1>
        </Link>
      </div>
    </header>
  );
}