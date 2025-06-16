import Link from "next/link";
import Image from "next/image";
import {
  FaDiscord,
  FaReddit,
  FaGithub,
  FaLinkedin,
  FaTelegramPlane,
  FaNewspaper,
  FaFlask,
  FaBrain,
  FaRocket,
  FaUsers,
  FaBook,
  FaHeart,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import LearnMoreButton from "./LearnMoreButton";
import ScrollToTopButton from "./ScrollToTopButton";

interface NavigationLink {
  name: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

export default function Footer() {
  const socialLinks = [
    {
      icon: FaDiscord,
      href: "https://discord.gg/4CZ7RCwEvb",
      label: "Discord",
      color: "hover:text-[#5865F2]",
    },
    {
      icon: FaXTwitter,
      href: "https://x.com/Elata_Bio",
      label: "Twitter",
      color: "hover:text-offBlack",
    },
    {
      icon: FaLinkedin,
      href: "https://www.linkedin.com/company/elata-biosciences/posts/?feedView=all",
      label: "LinkedIn",
      color: "hover:text-[#0077B5]",
    },
    {
      icon: FaGithub,
      href: "https://github.com/Elata-Biosciences/elata-vsm-system-4",
      label: "GitHub",
      color: "hover:text-offBlack",
    },
    {
      icon: FaReddit,
      href: "https://www.reddit.com/r/elata/",
      label: "Reddit",
      color: "hover:text-[#FF4500]",
    },
    {
      icon: FaTelegramPlane,
      href: "https://t.me/Elata_Biosciences",
      label: "Telegram",
      color: "hover:text-[#0088CC]",
    },
  ];

  const navigationLinks: NavigationSection[] = [
    {
      title: "Research",
      links: [
        { name: "Latest Research", href: "/?category=research", icon: FaFlask },
        {
          name: "Computational Psychiatry",
          href: "/?category=computational",
          icon: FaBrain,
        },
        {
          name: "Industry News",
          href: "/?category=industry",
          icon: FaNewspaper,
        },
        {
          name: "Experimental Treatments",
          href: "/?category=biohacking",
          icon: FaRocket,
        },
      ],
    },
    {
      title: "Technology",
      links: [
        { name: "Hardware & BCIs", href: "/?category=hardware", icon: FaBrain },
        { name: "DeSci & DAOs", href: "/?category=desci", icon: FaUsers },
        { name: "Off Topic", href: "/?category=offTopic", icon: FaBook },
      ],
    },
    {
      title: "DAO",
      links: [
        {
          name: "About Elata",
          href: "https://elata.bio",
          icon: FaHeart,
          external: true,
        },
        {
          name: "ELTA Token",
          href: "https://elata.bio/token",
          icon: FaRocket,
          external: true,
        },
        {
          name: "Science",
          href: "https://elata.bio/science",
          icon: FaFlask,
          external: true,
        },
        {
          name: "Roadmap",
          href: "https://elata.bio/roadmap",
          icon: FaBook,
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-cream1 to-cream2 border-t border-gray2/30 mt-20">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Link
                href="https://elata.bio"
                className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/logotype.png"
                  alt="Elata Biosciences Logo"
                  width={120}
                  height={32}
                  className="h-8 w-auto hover:opacity-90 transition-opacity"
                />
              </Link>
              <p className="mt-6 text-gray3 font-sf-pro leading-relaxed text-base">
                Advancing mental health research through decentralized science,
                novel technology, and objective metrics to develop highly
                patient-focused treatments.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          {navigationLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-lg font-bold font-montserrat text-offBlack">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-gray3 hover:text-offBlack transition-colors group font-sf-pro text-base"
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                    >
                      <link.icon className="w-4 h-4 text-elataGreen group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & CTA Section */}
        <div className="mt-20 pt-12 border-t border-gray2/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-center lg:text-left max-w-2xl">
              <h3 className="text-2xl font-bold font-montserrat text-offBlack mb-4">
                Join the Future of Mental Health Research
              </h3>
              <p className="text-gray3 font-sf-pro text-lg leading-relaxed mb-6">
                Connect with researchers, developers, and advocates working to
                transform mental healthcare.
              </p>
              
              {/* Button Container - equal width buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Link
                  href="https://discord.gg/4CZ7RCwEvb"
                  className="group relative inline-flex items-center gap-3 bg-offBlack hover:bg-gray3 text-white px-6 py-3 rounded-none font-medium font-sf-pro transition-all duration-300 hover:shadow-lg transform hover:scale-105 overflow-hidden justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-elataGreen/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FaDiscord className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Join Community</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-elataGreen group-hover:w-full transition-all duration-300 ease-out" />
                </Link>

                <LearnMoreButton />
              </div>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="mt-12 flex justify-center lg:justify-start">
            <div className="flex items-center gap-6">
             
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className={`p-3 rounded-full bg-cream2/80 backdrop-blur-sm border border-gray2/50 text-gray3 ${social.color} transition-all duration-300 hover:shadow-md hover:scale-110 hover:border-gray3 transform-gpu`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Elata on ${social.label}`}
                    title={`Connect with us on ${social.label}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-offBlack/10 backdrop-blur-sm border-t border-gray2/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray3 font-sf-pro">
              <p>© 2024 Elata Biosciences. All rights reserved.</p>
              <div className="flex items-center">
                <Link
                  href="https://elata.bio/contact"
                  className="hover:text-offBlack transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </Link>
              </div>
            </div>

            <ScrollToTopButton />
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Elata Biosciences",
            url: "https://elata.bio",
            logo: "https://news.elata.bio/logo.png",
            description:
              "Advancing mental health research through decentralized science, novel technology, and objective metrics to develop highly patient-focused treatments.",
            foundingDate: "2023",
            industry: "Biotechnology",
            sameAs: [
              "https://discord.gg/4CZ7RCwEvb",
              "https://x.com/Elata_Bio",
              "https://www.linkedin.com/company/elata-biosciences",
              "https://github.com/Elata-Biosciences",
              "https://www.reddit.com/r/elata/",
              "https://t.me/Elata_Biosciences",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              url: "https://discord.gg/4CZ7RCwEvb",
            },
          }),
        }}
      />
    </footer>
  );
}
