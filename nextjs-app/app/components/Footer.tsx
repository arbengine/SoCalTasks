import Link from "next/link";
import { Twitter, Facebook, Youtube, Instagram, ShieldAlert, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        
        {/* ✅ Left Section: Legal Links */}
        <div className="text-sm flex flex-wrap justify-center md:justify-start space-x-6 mb-4 md:mb-0">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
          <Link href="/dmca" className="hover:text-white transition">DMCA</Link>
          <Link href="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
        </div>

        {/* ✅ Right Section: Social Media */}
        <div className="flex space-x-4">
          <Link href="https://twitter.com" target="_blank" className="hover:text-orange-400 transition">
            <Twitter size={22} />
          </Link>
          <Link href="https://facebook.com" target="_blank" className="hover:text-orange-400 transition">
            <Facebook size={22} />
          </Link>
          <Link href="https://youtube.com" target="_blank" className="hover:text-orange-400 transition">
            <Youtube size={22} />
          </Link>
          <Link href="https://instagram.com" target="_blank" className="hover:text-orange-400 transition">
            <Instagram size={22} />
          </Link>
          <Link href="/contact" className="hover:text-orange-400 transition">
            <Mail size={22} />
          </Link>
        </div>
      </div>

      {/* ✅ Copyright */}
      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DoItYourself.bot - All rights reserved.
      </div>
    </footer>
  );
}
