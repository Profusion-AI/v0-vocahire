import React from 'react'
// import Link from 'next/link' // For actual navigation if these become pages
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const footerNavLinks = [
  { name: 'About', href: '#' },
  { name: 'Privacy', href: '#' },
  { name: 'Terms', href: '#' },
  { name: 'Contact', href: '#' },
  { name: 'FAQ', href: '#' },
]

const socialLinks = [
  { name: 'Facebook', href: '#', icon: <Facebook className="h-6 w-6" /> },
  { name: 'Twitter', href: '#', icon: <Twitter className="h-6 w-6" /> },
  { name: 'Instagram', href: '#', icon: <Instagram className="h-6 w-6" /> },
  { name: 'LinkedIn', href: '#', icon: <Linkedin className="h-6 w-6" /> },
]

const Footer = () => {
  return (
    <footer className="bg-white mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {footerNavLinks.map((link) => (
            <div key={link.name} className="px-5 py-2">
              <a href={link.href} className="text-base text-gray-500 hover:text-gray-900">
                {link.name}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((social) => (
            <a key={social.name} href={social.href} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">{social.name}</span>
              {social.icon}
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} VocaHire Coach. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
