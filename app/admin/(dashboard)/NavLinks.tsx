'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks() {
  const pathname = usePathname()

  const links = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },

    {
      href: '/admin/posts',
      label: 'Posts',
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17.5A2.5 2.5 0 0 0 17.5 17H4V4.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 17h13.5A2.5 2.5 0 0 1 20 19.5"
            strokeLinecap="round"
          />
          <path
            d="M8 6h8M8 10h8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    {
      href: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11l2 3h4.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className="space-y-1 px-3 py-6">
      {links.map((link) => {
        const isActive =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 group-hover:text-gray-300'
              }`}
            >
              {link.icon}
            </span>

            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}