import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins', // Optional: if you want to use it as a CSS variable
})

export const metadata: Metadata = {
  title: 'VocaHire Coach',
  description: 'AI-powered mock interview platform to help you ace your next interview.',
  icons: {
    icon: '/placeholder-logo.svg', // This refers to public/placeholder-logo.svg
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans`}>
      <body className={poppins.className}>{children}</body>
    </html>
  )
}
