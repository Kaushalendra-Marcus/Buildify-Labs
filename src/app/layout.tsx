import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TamboProviderWrapper } from '@/components/providers/TamboProviderWrapper'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://buldifylabs.in'
const SITE_NAME = 'Buildify Labs'
const TWITTER_HANDLE = '@BuildifyLabs' // Update with actual Twitter handle if available
const AUTHOR = 'Kaushalendra'

export const metadata: Metadata = {
    title: 'Buildify Labs - AI Business Intelligence Workspace',
    description:
        'Generative AI-powered business analytics with real-time component generation',
    keywords: ['AI', 'Business Intelligence', 'Analytics', 'Dashboard', 'Tambo AI', 'Business Analytics', 'AI Dashboard'],
    
    // SEO Metadata
    metadataBase: new URL(SITE_URL),
    authors: [{ name: AUTHOR }],
    creator: AUTHOR,
    publisher: SITE_NAME,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    
    // Open Graph / Facebook
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: SITE_URL,
        siteName: SITE_NAME,
        title: 'Buildify Labs - AI Business Intelligence Workspace',
        description: 'Generative AI-powered business analytics with real-time component generation',
        images: [
            {
                url: '/card.png',
                width: 1200,
                height: 630,
                alt: 'Buildify Labs - AI Business Intelligence Workspace',
            },
        ],
    },
    
    // Twitter
    twitter: {
        card: 'summary_large_image',
        title: 'Buildify Labs - AI Business Intelligence Workspace',
        description: 'Generative AI-powered business analytics with real-time component generation',
        images: ['/card.png'],
        creator: TWITTER_HANDLE,
        site: TWITTER_HANDLE,
    },
    
    // Additional SEO
    alternates: {
        canonical: SITE_URL,
    },
    category: 'technology',
    verification: {
        // Add your verification codes here if needed
        // google: 'verification_code',
        // yandex: 'verification_code',
        // yahoo: 'verification_code',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <head>
                {/* Additional meta tags for older browsers */}
                <meta property="og:title" content="Buildify Labs - AI Business Intelligence Workspace" />
                <meta property="og:description" content="Generative AI-powered business analytics with real-time component generation" />
                <meta property="og:image" content="/card.png" />
                <meta property="og:url" content={SITE_URL} />
                <meta property="og:type" content="website" />
                
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={TWITTER_HANDLE} />
                <meta name="twitter:creator" content={TWITTER_HANDLE} />
                <meta name="twitter:title" content="Buildify Labs - AI Business Intelligence Workspace" />
                <meta name="twitter:description" content="Generative AI-powered business analytics with real-time component generation" />
                <meta name="twitter:image" content="/card.png" />
                
                {/* Structured Data for better SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": SITE_NAME,
                            "url": SITE_URL,
                            "author": {
                                "@type": "Person",
                                "name": AUTHOR
                            },
                            "description": "Generative AI-powered business analytics with real-time component generation",
                            "image": `${SITE_URL}/card.png`
                        })
                    }}
                />
            </head>
            <body className={`${inter.className} h-full`}>
                <TamboProviderWrapper>
                    {children}
                    <Analytics />
                </TamboProviderWrapper>
            </body>
        </html>
    )
}