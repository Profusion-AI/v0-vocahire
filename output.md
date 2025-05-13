## Tree for vocahire
```
├── pnpm-lock.yaml
├── middleware.ts
├── app/
│   ├── admin/
│   │   └── usage/
│   │       └── page.tsx
│   ├── register/
│   │   ├── page 2.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   ├── page 2.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   └── usage/
│   │   │       └── route.ts
│   │   ├── generate-feedback/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   ├── route 2.ts
│   │   │   └── route.ts
│   │   └── realtime-session/
│   │       └── route.ts
│   ├── page.tsx
│   ├── globals.css
│   └── login/
│       └── page.tsx
├── postcss.config.mjs
├── next.config.mjs
├── prisma/
│   └── schema.prisma
├── README.md
├── tailwind.config.ts
├── styles/
│   └── globals.css
├── components/
│   ├── theme-provider.tsx
│   ├── ui/
│   │   ├── aspect-ratio.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── use-mobile.tsx
│   │   ├── pagination.tsx
│   │   ├── tabs.tsx
│   │   ├── card.tsx
│   │   ├── slider.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── toaster.tsx
│   │   ├── input-otp.tsx
│   │   ├── chart.tsx
│   │   ├── hover-card.tsx
│   │   ├── sheet.tsx
│   │   ├── scroll-area.tsx
│   │   ├── resizable.tsx
│   │   ├── label.tsx
│   │   ├── sonner.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── accordion.tsx
│   │   ├── drawer.tsx
│   │   ├── tooltip.tsx
│   │   ├── alert.tsx
│   │   ├── use-toast.ts
│   │   ├── switch.tsx
│   │   ├── calendar.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── radio-group.tsx
│   │   ├── command.tsx
│   │   ├── toggle-group.tsx
│   │   ├── avatar.tsx
│   │   ├── menubar.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   ├── separator.tsx
│   │   ├── button.tsx
│   │   ├── toggle.tsx
│   │   ├── toast.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   ├── context-menu.tsx
│   │   ├── form.tsx
│   │   └── carousel.tsx
│   ├── navbar.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── Simulation.tsx
│   │   ├── Pricing.tsx
│   │   ├── Features.tsx
│   │   ├── Waveform.tsx
│   │   ├── Footer.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FeedbackSection.tsx
│   │   └── Waveform.module.css
│   └── auth/
│       ├── register-form.tsx
│       └── login-form.tsx
├── public/
│   ├── placeholder-logo.svg
│   ├── placeholder-logo.png
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── .gitignore
├── package.json
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── prisma.ts
│   ├── prisma 2.ts
│   ├── usage-tracking.ts
│   ├── redis.ts
│   ├── utils.ts
│   ├── rate-limit.ts
│   └── auth.ts
├── components.json
└── tsconfig.json
```

## File: pnpm-lock.yaml
```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@auth/core':
        specifier: latest
        version: 0.39.1(nodemailer@7.0.3)
      '@hookform/resolvers':
        specifier: ^3.9.1
        version: 3.9.1(react-hook-form@7.54.1(react@19.0.0))
      '@next-auth/prisma-adapter':
        specifier: latest
        version: 1.0.7(@prisma/client@6.7.0(prisma@6.7.0(typescript@5.0.2))(typescript@5.0.2))(next-auth@4.24.11(@auth/core@0.39.1(nodemailer@7.0.3))(next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0))(nodemailer@7.0.3)(react-dom@19.0.0(react@19.0.0))(react@19.0.0))
      '@prisma/client':
        specifier: latest
        version: 6.7.0(prisma@6.7.0(typescript@5.0.2))(typescript@5.0.2)
      '@radix-ui/react-accordion':
        specifier: 1.2.2
        version: 1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-alert-dialog':
        specifier: 1.1.4
        version: 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-aspect-ratio':
        specifier: 1.1.1
        version: 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-avatar':
        specifier: 1.1.2
        version: 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-checkbox':
        specifier: 1.1.3
        version: 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-collapsible':
        specifier: 1.1.2
        version: 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-context-menu':
        specifier: 2.2.4
        version: 2.2.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-dialog':
        specifier: 1.1.4
        version: 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-dropdown-menu':
        specifier: 2.1.4
        version: 2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-hover-card':
        specifier: 1.1.4
        version: 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-label':
        specifier: 2.1.1
        version: 2.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-menubar':
        specifier: 1.1.4
        version: 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-navigation-menu':
        specifier: 1.2.3
        version: 1.2.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-popover':
        specifier: 1.1.4
        version: 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-progress':
        specifier: 1.1.1
        version: 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-radio-group':
        specifier: 1.2.2
        version: 1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-scroll-area':
        specifier: 1.2.2
        version: 1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-select':
        specifier: 2.1.4
        version: 2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-separator':
        specifier: 1.1.1
        version: 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slider':
        specifier: 1.2.2
        version: 1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot':
        specifier: 1.1.1
        version: 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-switch':
        specifier: 1.1.2
        version: 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-tabs':
        specifier: 1.1.2
        version: 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-toast':
        specifier: 1.2.4
        version: 1.2.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-toggle':
        specifier: 1.1.1
        version: 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-toggle-group':
        specifier: 1.1.1
        version: 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-tooltip':
        specifier: 1.1.6
        version: 1.1.6(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@upstash/redis':
        specifier: latest
        version: 1.34.9
      autoprefixer:
        specifier: ^10.4.20
        version: 10.4.20(postcss@8.0.0)
      bcryptjs:
        specifier: latest
        version: 3.0.2
      class-variance-authority:
        specifier: ^0.7.1
        version: 0.7.1
      clsx:
        specifier: ^2.1.1
        version: 2.1.1
      cmdk:
        specifier: 1.0.4
        version: 1.0.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      date-fns:
        specifier: 4.1.0
        version: 4.1.0
      embla-carousel-react:
        specifier: 8.5.1
        version: 8.5.1(react@19.0.0)
      input-otp:
        specifier: 1.4.1
        version: 1.4.1(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      lucide-react:
        specifier: ^0.454.0
        version: 0.454.0(react@19.0.0)
      next:
        specifier: 15.2.4
        version: 15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      next-auth:
        specifier: latest
        version: 4.24.11(@auth/core@0.39.1(nodemailer@7.0.3))(next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0))(nodemailer@7.0.3)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      next-themes:
        specifier: ^0.4.4
        version: 0.4.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      nodemailer:
        specifier: latest
        version: 7.0.3
      prisma:
        specifier: latest
        version: 6.7.0(typescript@5.0.2)
      react:
        specifier: ^19
        version: 19.0.0
      react-day-picker:
        specifier: 8.10.1
        version: 8.10.1(date-fns@4.1.0)(react@19.0.0)
      react-dom:
        specifier: ^19
        version: 19.0.0(react@19.0.0)
      react-hook-form:
        specifier: ^7.54.1
        version: 7.54.1(react@19.0.0)
      react-resizable-panels:
        specifier: ^2.1.7
        version: 2.1.7(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      recharts:
        specifier: 2.15.0
        version: 2.15.0(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      sonner:
        specifier: ^1.7.1
        version: 1.7.1(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      tailwind-merge:
        specifier: ^2.5.5
        version: 2.5.5
      tailwindcss-animate:
        specifier: ^1.0.7
        version: 1.0.7(tailwindcss@3.4.17)
      vaul:
        specifier: ^0.9.6
        version: 0.9.6(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      zod:
        specifier: latest
        version: 3.24.4
    devDependencies:
      '@types/node':
        specifier: ^22
        version: 22.0.0
      '@types/react':
        specifier: ^19
        version: 19.0.0
      '@types/react-dom':
        specifier: ^19
        version: 19.0.0
      postcss:
        specifier: ^8
        version: 8.0.0
      tailwindcss:
        specifier: ^3.4.17
        version: 3.4.17
      typescript:
        specifier: ^5
        version: 5.0.2

packages:

  '@alloc/quick-lru@5.2.0':
    resolution: {integrity: sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==}
    engines: {node: '>=10'}

  '@auth/core@0.39.1':
    resolution: {integrity: sha512-McD8slui0oOA1pjR5sPjLPl5Zm//nLP/8T3kr8hxIsvNLvsiudYvPHhDFPjh1KcZ2nFxCkZmP6bRxaaPd/AnLA==}
    peerDependencies:
      '@simplewebauthn/browser': ^9.0.1
      '@simplewebauthn/server': ^9.0.2
      nodemailer: ^6.8.0
    peerDependenciesMeta:
      '@simplewebauthn/browser':
        optional: true
      '@simplewebauthn/server':
        optional: true
      nodemailer:
        optional: true

  '@babel/runtime@7.27.1':
    resolution: {integrity: sha512-1x3D2xEk2fRo3PAhwQwu5UubzgiVWSXTBfWpVd2Mx2AzRqJuDJCsgaDVZ7HB5iGzDW1Hl1sWN2mFyKjmR9uAog==}
    engines: {node: '>=6.9.0'}

  '@emnapi/runtime@1.4.3':
    resolution: {integrity: sha512-pBPWdu6MLKROBX05wSNKcNb++m5Er+KQ9QkB+WVM+pW2Kx9hoSrVTnu3BdkI5eBLZoKu/J6mW/B6i6bJB2ytXQ==}

  '@esbuild/aix-ppc64@0.25.4':
    resolution: {integrity: sha512-1VCICWypeQKhVbE9oW/sJaAmjLxhVqacdkvPLEjwlttjfwENRSClS8EjBz0KzRyFSCPDIkuXW34Je/vk7zdB7Q==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/android-arm64@0.25.4':
    resolution: {integrity: sha512-bBy69pgfhMGtCnwpC/x5QhfxAz/cBgQ9enbtwjf6V9lnPI/hMyT9iWpR1arm0l3kttTr4L0KSLpKmLp/ilKS9A==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm@0.25.4':
    resolution: {integrity: sha512-QNdQEps7DfFwE3hXiU4BZeOV68HHzYwGd0Nthhd3uCkkEKK7/R6MTgM0P7H7FAs5pU/DIWsviMmEGxEoxIZ+ZQ==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-x64@0.25.4':
    resolution: {integrity: sha512-TVhdVtQIFuVpIIR282btcGC2oGQoSfZfmBdTip2anCaVYcqWlZXGcdcKIUklfX2wj0JklNYgz39OBqh2cqXvcQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/darwin-arm64@0.25.4':
    resolution: {integrity: sha512-Y1giCfM4nlHDWEfSckMzeWNdQS31BQGs9/rouw6Ub91tkK79aIMTH3q9xHvzH8d0wDru5Ci0kWB8b3up/nl16g==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-x64@0.25.4':
    resolution: {integrity: sha512-CJsry8ZGM5VFVeyUYB3cdKpd/H69PYez4eJh1W/t38vzutdjEjtP7hB6eLKBoOdxcAlCtEYHzQ/PJ/oU9I4u0A==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/freebsd-arm64@0.25.4':
    resolution: {integrity: sha512-yYq+39NlTRzU2XmoPW4l5Ifpl9fqSk0nAJYM/V/WUGPEFfek1epLHJIkTQM6bBs1swApjO5nWgvr843g6TjxuQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.25.4':
    resolution: {integrity: sha512-0FgvOJ6UUMflsHSPLzdfDnnBBVoCDtBTVyn/MrWloUNvq/5SFmh13l3dvgRPkDihRxb77Y17MbqbCAa2strMQQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/linux-arm64@0.25.4':
    resolution: {integrity: sha512-+89UsQTfXdmjIvZS6nUnOOLoXnkUTB9hR5QAeLrQdzOSWZvNSAXAtcRDHWtqAUtAmv7ZM1WPOOeSxDzzzMogiQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm@0.25.4':
    resolution: {integrity: sha512-kro4c0P85GMfFYqW4TWOpvmF8rFShbWGnrLqlzp4X1TNWjRY3JMYUfDCtOxPKOIY8B0WC8HN51hGP4I4hz4AaQ==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-ia32@0.25.4':
    resolution: {integrity: sha512-yTEjoapy8UP3rv8dB0ip3AfMpRbyhSN3+hY8mo/i4QXFeDxmiYbEKp3ZRjBKcOP862Ua4b1PDfwlvbuwY7hIGQ==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-loong64@0.25.4':
    resolution: {integrity: sha512-NeqqYkrcGzFwi6CGRGNMOjWGGSYOpqwCjS9fvaUlX5s3zwOtn1qwg1s2iE2svBe4Q/YOG1q6875lcAoQK/F4VA==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-mips64el@0.25.4':
    resolution: {integrity: sha512-IcvTlF9dtLrfL/M8WgNI/qJYBENP3ekgsHbYUIzEzq5XJzzVEV/fXY9WFPfEEXmu3ck2qJP8LG/p3Q8f7Zc2Xg==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-ppc64@0.25.4':
    resolution: {integrity: sha512-HOy0aLTJTVtoTeGZh4HSXaO6M95qu4k5lJcH4gxv56iaycfz1S8GO/5Jh6X4Y1YiI0h7cRyLi+HixMR+88swag==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-riscv64@0.25.4':
    resolution: {integrity: sha512-i8JUDAufpz9jOzo4yIShCTcXzS07vEgWzyX3NH2G7LEFVgrLEhjwL3ajFE4fZI3I4ZgiM7JH3GQ7ReObROvSUA==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-s390x@0.25.4':
    resolution: {integrity: sha512-jFnu+6UbLlzIjPQpWCNh5QtrcNfMLjgIavnwPQAfoGx4q17ocOU9MsQ2QVvFxwQoWpZT8DvTLooTvmOQXkO51g==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-x64@0.25.4':
    resolution: {integrity: sha512-6e0cvXwzOnVWJHq+mskP8DNSrKBr1bULBvnFLpc1KY+d+irZSgZ02TGse5FsafKS5jg2e4pbvK6TPXaF/A6+CA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/netbsd-arm64@0.25.4':
    resolution: {integrity: sha512-vUnkBYxZW4hL/ie91hSqaSNjulOnYXE1VSLusnvHg2u3jewJBz3YzB9+oCw8DABeVqZGg94t9tyZFoHma8gWZQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.25.4':
    resolution: {integrity: sha512-XAg8pIQn5CzhOB8odIcAm42QsOfa98SBeKUdo4xa8OvX8LbMZqEtgeWE9P/Wxt7MlG2QqvjGths+nq48TrUiKw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/openbsd-arm64@0.25.4':
    resolution: {integrity: sha512-Ct2WcFEANlFDtp1nVAXSNBPDxyU+j7+tId//iHXU2f/lN5AmO4zLyhDcpR5Cz1r08mVxzt3Jpyt4PmXQ1O6+7A==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.25.4':
    resolution: {integrity: sha512-xAGGhyOQ9Otm1Xu8NT1ifGLnA6M3sJxZ6ixylb+vIUVzvvd6GOALpwQrYrtlPouMqd/vSbgehz6HaVk4+7Afhw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/sunos-x64@0.25.4':
    resolution: {integrity: sha512-Mw+tzy4pp6wZEK0+Lwr76pWLjrtjmJyUB23tHKqEDP74R3q95luY/bXqXZeYl4NYlvwOqoRKlInQialgCKy67Q==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/win32-arm64@0.25.4':
    resolution: {integrity: sha512-AVUP428VQTSddguz9dO9ngb+E5aScyg7nOeJDrF1HPYu555gmza3bDGMPhmVXL8svDSoqPCsCPjb265yG/kLKQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-ia32@0.25.4':
    resolution: {integrity: sha512-i1sW+1i+oWvQzSgfRcxxG2k4I9n3O9NRqy8U+uugaT2Dy7kLO9Y7wI72haOahxceMX8hZAzgGou1FhndRldxRg==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-x64@0.25.4':
    resolution: {integrity: sha512-nOT2vZNw6hJ+z43oP1SPea/G/6AbN6X+bGNhNuq8NtRHy4wsMhw765IKLNmnjek7GvjWBYQ8Q5VBoYTFg9y1UQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@floating-ui/core@1.7.0':
    resolution: {integrity: sha512-FRdBLykrPPA6P76GGGqlex/e7fbe0F1ykgxHYNXQsH/iTEtjMj/f9bpY5oQqbjt5VgZvgz/uKXbGuROijh3VLA==}

  '@floating-ui/dom@1.7.0':
    resolution: {integrity: sha512-lGTor4VlXcesUMh1cupTUTDoCxMb0V6bm3CnxHzQcw8Eaf1jQbgQX4i02fYgT0vJ82tb5MZ4CZk1LRGkktJCzg==}

  '@floating-ui/react-dom@2.1.2':
    resolution: {integrity: sha512-06okr5cgPzMNBy+Ycse2A6udMi4bqwW/zgBF/rwjcNqWkyr82Mcg8b0vjX8OJpZFy/FKjJmw6wV7t44kK6kW7A==}
    peerDependencies:
      react: '>=16.8.0'
      react-dom: '>=16.8.0'

  '@floating-ui/utils@0.2.9':
    resolution: {integrity: sha512-MDWhGtE+eHw5JW7lq4qhc5yRLS11ERl1c7Z6Xd0a58DozHES6EnNNwUWbMiG4J9Cgj053Bhk8zvlhFYKVhULwg==}

  '@hookform/resolvers@3.9.1':
    resolution: {integrity: sha512-ud2HqmGBM0P0IABqoskKWI6PEf6ZDDBZkFqe2Vnl+mTHCEHzr3ISjjZyCwTjC/qpL25JC9aIDkloQejvMeq0ug==}
    peerDependencies:
      react-hook-form: ^7.0.0

  '@img/sharp-darwin-arm64@0.33.5':
    resolution: {integrity: sha512-UT4p+iz/2H4twwAoLCqfA9UH5pI6DggwKEGuaPy7nCVQ8ZsiY5PIcrRvD1DzuY3qYL07NtIQcWnBSY/heikIFQ==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [arm64]
    os: [darwin]

  '@img/sharp-darwin-x64@0.33.5':
    resolution: {integrity: sha512-fyHac4jIc1ANYGRDxtiqelIbdWkIuQaI84Mv45KvGRRxSAa7o7d1ZKAOBaYbnepLC1WqxfpimdeWfvqqSGwR2Q==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [x64]
    os: [darwin]

  '@img/sharp-libvips-darwin-arm64@1.0.4':
    resolution: {integrity: sha512-XblONe153h0O2zuFfTAbQYAX2JhYmDHeWikp1LM9Hul9gVPjFY427k6dFEcOL72O01QxQsWi761svJ/ev9xEDg==}
    cpu: [arm64]
    os: [darwin]

  '@img/sharp-libvips-darwin-x64@1.0.4':
    resolution: {integrity: sha512-xnGR8YuZYfJGmWPvmlunFaWJsb9T/AO2ykoP3Fz/0X5XV2aoYBPkX6xqCQvUTKKiLddarLaxpzNe+b1hjeWHAQ==}
    cpu: [x64]
    os: [darwin]

  '@img/sharp-libvips-linux-arm64@1.0.4':
    resolution: {integrity: sha512-9B+taZ8DlyyqzZQnoeIvDVR/2F4EbMepXMc/NdVbkzsJbzkUjhXv/70GQJ7tdLA4YJgNP25zukcxpX2/SueNrA==}
    cpu: [arm64]
    os: [linux]

  '@img/sharp-libvips-linux-arm@1.0.5':
    resolution: {integrity: sha512-gvcC4ACAOPRNATg/ov8/MnbxFDJqf/pDePbBnuBDcjsI8PssmjoKMAz4LtLaVi+OnSb5FK/yIOamqDwGmXW32g==}
    cpu: [arm]
    os: [linux]

  '@img/sharp-libvips-linux-s390x@1.0.4':
    resolution: {integrity: sha512-u7Wz6ntiSSgGSGcjZ55im6uvTrOxSIS8/dgoVMoiGE9I6JAfU50yH5BoDlYA1tcuGS7g/QNtetJnxA6QEsCVTA==}
    cpu: [s390x]
    os: [linux]

  '@img/sharp-libvips-linux-x64@1.0.4':
    resolution: {integrity: sha512-MmWmQ3iPFZr0Iev+BAgVMb3ZyC4KeFc3jFxnNbEPas60e1cIfevbtuyf9nDGIzOaW9PdnDciJm+wFFaTlj5xYw==}
    cpu: [x64]
    os: [linux]

  '@img/sharp-libvips-linuxmusl-arm64@1.0.4':
    resolution: {integrity: sha512-9Ti+BbTYDcsbp4wfYib8Ctm1ilkugkA/uscUn6UXK1ldpC1JjiXbLfFZtRlBhjPZ5o1NCLiDbg8fhUPKStHoTA==}
    cpu: [arm64]
    os: [linux]

  '@img/sharp-libvips-linuxmusl-x64@1.0.4':
    resolution: {integrity: sha512-viYN1KX9m+/hGkJtvYYp+CCLgnJXwiQB39damAO7WMdKWlIhmYTfHjwSbQeUK/20vY154mwezd9HflVFM1wVSw==}
    cpu: [x64]
    os: [linux]

  '@img/sharp-linux-arm64@0.33.5':
    resolution: {integrity: sha512-JMVv+AMRyGOHtO1RFBiJy/MBsgz0x4AWrT6QoEVVTyh1E39TrCUpTRI7mx9VksGX4awWASxqCYLCV4wBZHAYxA==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [arm64]
    os: [linux]

  '@img/sharp-linux-arm@0.33.5':
    resolution: {integrity: sha512-JTS1eldqZbJxjvKaAkxhZmBqPRGmxgu+qFKSInv8moZ2AmT5Yib3EQ1c6gp493HvrvV8QgdOXdyaIBrhvFhBMQ==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [arm]
    os: [linux]

  '@img/sharp-linux-s390x@0.33.5':
    resolution: {integrity: sha512-y/5PCd+mP4CA/sPDKl2961b+C9d+vPAveS33s6Z3zfASk2j5upL6fXVPZi7ztePZ5CuH+1kW8JtvxgbuXHRa4Q==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [s390x]
    os: [linux]

  '@img/sharp-linux-x64@0.33.5':
    resolution: {integrity: sha512-opC+Ok5pRNAzuvq1AG0ar+1owsu842/Ab+4qvU879ippJBHvyY5n2mxF1izXqkPYlGuP/M556uh53jRLJmzTWA==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [x64]
    os: [linux]

  '@img/sharp-linuxmusl-arm64@0.33.5':
    resolution: {integrity: sha512-XrHMZwGQGvJg2V/oRSUfSAfjfPxO+4DkiRh6p2AFjLQztWUuY/o8Mq0eMQVIY7HJ1CDQUJlxGGZRw1a5bqmd1g==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [arm64]
    os: [linux]

  '@img/sharp-linuxmusl-x64@0.33.5':
    resolution: {integrity: sha512-WT+d/cgqKkkKySYmqoZ8y3pxx7lx9vVejxW/W4DOFMYVSkErR+w7mf2u8m/y4+xHe7yY9DAXQMWQhpnMuFfScw==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [x64]
    os: [linux]

  '@img/sharp-wasm32@0.33.5':
    resolution: {integrity: sha512-ykUW4LVGaMcU9lu9thv85CbRMAwfeadCJHRsg2GmeRa/cJxsVY9Rbd57JcMxBkKHag5U/x7TSBpScF4U8ElVzg==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [wasm32]

  '@img/sharp-win32-ia32@0.33.5':
    resolution: {integrity: sha512-T36PblLaTwuVJ/zw/LaH0PdZkRz5rd3SmMHX8GSmR7vtNSP5Z6bQkExdSK7xGWyxLw4sUknBuugTelgw2faBbQ==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [ia32]
    os: [win32]

  '@img/sharp-win32-x64@0.33.5':
    resolution: {integrity: sha512-MpY/o8/8kj+EcnxwvrP4aTJSWw/aZ7JIGR4aBeZkZw5B7/Jn+tY9/VNwtcoGmdT7GfggGIU4kygOMSbYnOrAbg==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}
    cpu: [x64]
    os: [win32]

  '@isaacs/cliui@8.0.2':
    resolution: {integrity: sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==}
    engines: {node: '>=12'}

  '@jridgewell/gen-mapping@0.3.8':
    resolution: {integrity: sha512-imAbBGkb+ebQyxKgzv5Hu2nmROxoDOXHh80evxdoXNOrvAnVx7zimzc1Oo5h9RlfV4vPXaE2iM5pOFbvOCClWA==}
    engines: {node: '>=6.0.0'}

  '@jridgewell/resolve-uri@3.1.2':
    resolution: {integrity: sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==}
    engines: {node: '>=6.0.0'}

  '@jridgewell/set-array@1.2.1':
    resolution: {integrity: sha512-R8gLRTZeyp03ymzP/6Lil/28tGeGEzhx1q2k703KGWRAI1VdvPIXdG70VJc2pAMw3NA6JKL5hhFu1sJX0Mnn/A==}
    engines: {node: '>=6.0.0'}

  '@jridgewell/sourcemap-codec@1.5.0':
    resolution: {integrity: sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==}

  '@jridgewell/trace-mapping@0.3.25':
    resolution: {integrity: sha512-vNk6aEwybGtawWmy/PzwnGDOjCkLWSD2wqvjGGAgOAwCGWySYXfYoxt00IJkTF+8Lb57DwOb3Aa0o9CApepiYQ==}

  '@next-auth/prisma-adapter@1.0.7':
    resolution: {integrity: sha512-Cdko4KfcmKjsyHFrWwZ//lfLUbcLqlyFqjd/nYE2m3aZ7tjMNUjpks47iw7NTCnXf+5UWz5Ypyt1dSs1EP5QJw==}
    peerDependencies:
      '@prisma/client': '>=2.26.0 || >=3'
      next-auth: ^4

  '@next/env@15.2.4':
    resolution: {integrity: sha512-+SFtMgoiYP3WoSswuNmxJOCwi06TdWE733D+WPjpXIe4LXGULwEaofiiAy6kbS0+XjM5xF5n3lKuBwN2SnqD9g==}

  '@next/swc-darwin-arm64@15.2.4':
    resolution: {integrity: sha512-1AnMfs655ipJEDC/FHkSr0r3lXBgpqKo4K1kiwfUf3iE68rDFXZ1TtHdMvf7D0hMItgDZ7Vuq3JgNMbt/+3bYw==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [darwin]

  '@next/swc-darwin-x64@15.2.4':
    resolution: {integrity: sha512-3qK2zb5EwCwxnO2HeO+TRqCubeI/NgCe+kL5dTJlPldV/uwCnUgC7VbEzgmxbfrkbjehL4H9BPztWOEtsoMwew==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [darwin]

  '@next/swc-linux-arm64-gnu@15.2.4':
    resolution: {integrity: sha512-HFN6GKUcrTWvem8AZN7tT95zPb0GUGv9v0d0iyuTb303vbXkkbHDp/DxufB04jNVD+IN9yHy7y/6Mqq0h0YVaQ==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]

  '@next/swc-linux-arm64-musl@15.2.4':
    resolution: {integrity: sha512-Oioa0SORWLwi35/kVB8aCk5Uq+5/ZIumMK1kJV+jSdazFm2NzPDztsefzdmzzpx5oGCJ6FkUC7vkaUseNTStNA==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]

  '@next/swc-linux-x64-gnu@15.2.4':
    resolution: {integrity: sha512-yb5WTRaHdkgOqFOZiu6rHV1fAEK0flVpaIN2HB6kxHVSy/dIajWbThS7qON3W9/SNOH2JWkVCyulgGYekMePuw==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]

  '@next/swc-linux-x64-musl@15.2.4':
    resolution: {integrity: sha512-Dcdv/ix6srhkM25fgXiyOieFUkz+fOYkHlydWCtB0xMST6X9XYI3yPDKBZt1xuhOytONsIFJFB08xXYsxUwJLw==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]

  '@next/swc-win32-arm64-msvc@15.2.4':
    resolution: {integrity: sha512-dW0i7eukvDxtIhCYkMrZNQfNicPDExt2jPb9AZPpL7cfyUo7QSNl1DjsHjmmKp6qNAqUESyT8YFl/Aw91cNJJg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [win32]

  '@next/swc-win32-x64-msvc@15.2.4':
    resolution: {integrity: sha512-SbnWkJmkS7Xl3kre8SdMF6F/XDh1DTFEhp0jRTj/uB8iPKoU2bb2NDfcu+iifv1+mxQEd1g2vvSxcZbXSKyWiQ==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [win32]

  '@nodelib/fs.scandir@2.1.5':
    resolution: {integrity: sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==}
    engines: {node: '>= 8'}

  '@nodelib/fs.stat@2.0.5':
    resolution: {integrity: sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==}
    engines: {node: '>= 8'}

  '@nodelib/fs.walk@1.2.8':
    resolution: {integrity: sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==}
    engines: {node: '>= 8'}

  '@panva/hkdf@1.2.1':
    resolution: {integrity: sha512-6oclG6Y3PiDFcoyk8srjLfVKyMfVCKJ27JwNPViuXziFpmdz+MZnZN/aKY0JGXgYuO/VghU0jcOAZgWXZ1Dmrw==}

  '@pkgjs/parseargs@0.11.0':
    resolution: {integrity: sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==}
    engines: {node: '>=14'}

  '@prisma/client@6.7.0':
    resolution: {integrity: sha512-+k61zZn1XHjbZul8q6TdQLpuI/cvyfil87zqK2zpreNIXyXtpUv3+H/oM69hcsFcZXaokHJIzPAt5Z8C8eK2QA==}
    engines: {node: '>=18.18'}
    peerDependencies:
      prisma: '*'
      typescript: '>=5.1.0'
    peerDependenciesMeta:
      prisma:
        optional: true
      typescript:
        optional: true

  '@prisma/config@6.7.0':
    resolution: {integrity: sha512-di8QDdvSz7DLUi3OOcCHSwxRNeW7jtGRUD2+Z3SdNE3A+pPiNT8WgUJoUyOwJmUr5t+JA2W15P78C/N+8RXrOA==}

  '@prisma/debug@6.7.0':
    resolution: {integrity: sha512-RabHn9emKoYFsv99RLxvfG2GHzWk2ZI1BuVzqYtmMSIcuGboHY5uFt3Q3boOREM9de6z5s3bQoyKeWnq8Fz22w==}

  '@prisma/engines-version@6.7.0-36.3cff47a7f5d65c3ea74883f1d736e41d68ce91ed':
    resolution: {integrity: sha512-EvpOFEWf1KkJpDsBCrih0kg3HdHuaCnXmMn7XFPObpFTzagK1N0Q0FMnYPsEhvARfANP5Ok11QyoTIRA2hgJTA==}

  '@prisma/engines@6.7.0':
    resolution: {integrity: sha512-3wDMesnOxPrOsq++e5oKV9LmIiEazFTRFZrlULDQ8fxdub5w4NgRBoxtWbvXmj2nJVCnzuz6eFix3OhIqsZ1jw==}

  '@prisma/fetch-engine@6.7.0':
    resolution: {integrity: sha512-zLlAGnrkmioPKJR4Yf7NfW3hftcvqeNNEHleMZK9yX7RZSkhmxacAYyfGsCcqRt47jiZ7RKdgE0Wh2fWnm7WsQ==}

  '@prisma/get-platform@6.7.0':
    resolution: {integrity: sha512-i9IH5lO4fQwnMLvQLYNdgVh9TK3PuWBfQd7QLk/YurnAIg+VeADcZDbmhAi4XBBDD+hDif9hrKyASu0hbjwabw==}

  '@radix-ui/number@1.1.0':
    resolution: {integrity: sha512-V3gRzhVNU1ldS5XhAPTom1fOIo4ccrjjJgmE+LI2h/WaFpHmx0MQApT+KZHnx8abG6Avtfcz4WoEciMnpFT3HQ==}

  '@radix-ui/primitive@1.1.1':
    resolution: {integrity: sha512-SJ31y+Q/zAyShtXJc8x83i9TYdbAfHZ++tUZnvjJJqFjzsdUnKsxPL6IEtBlxKkU7yzer//GQtZSV4GbldL3YA==}

  '@radix-ui/react-accordion@1.2.2':
    resolution: {integrity: sha512-b1oh54x4DMCdGsB4/7ahiSrViXxaBwRPotiZNnYXjLha9vfuURSAZErki6qjDoSIV0eXx5v57XnTGVtGwnfp2g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-alert-dialog@1.1.4':
    resolution: {integrity: sha512-A6Kh23qZDLy3PSU4bh2UJZznOrUdHImIXqF8YtUa6CN73f8EOO9XlXSCd9IHyPvIquTaa/kwaSWzZTtUvgXVGw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-arrow@1.1.1':
    resolution: {integrity: sha512-NaVpZfmv8SKeZbn4ijN2V3jlHA9ngBG16VnIIm22nUR0Yk8KUALyBxT3KYEUnNuch9sTE8UTsS3whzBgKOL30w==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-aspect-ratio@1.1.1':
    resolution: {integrity: sha512-kNU4FIpcFMBLkOUcgeIteH06/8JLBcYY6Le1iKenDGCYNYFX3TQqCZjzkOsz37h7r94/99GTb7YhEr98ZBJibw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-avatar@1.1.2':
    resolution: {integrity: sha512-GaC7bXQZ5VgZvVvsJ5mu/AEbjYLnhhkoidOboC50Z6FFlLA03wG2ianUoH+zgDQ31/9gCF59bE4+2bBgTyMiig==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-checkbox@1.1.3':
    resolution: {integrity: sha512-HD7/ocp8f1B3e6OHygH0n7ZKjONkhciy1Nh0yuBgObqThc3oyx+vuMfFHKAknXRHHWVE9XvXStxJFyjUmB8PIw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collapsible@1.1.2':
    resolution: {integrity: sha512-PliMB63vxz7vggcyq0IxNYk8vGDrLXVWw4+W4B8YnwI1s18x7YZYqlG9PLX7XxAJUi0g2DxP4XKJMFHh/iVh9A==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collection@1.1.1':
    resolution: {integrity: sha512-LwT3pSho9Dljg+wY2KN2mrrh6y3qELfftINERIzBUO9e0N+t0oMTyn3k9iv+ZqgrwGkRnLpNJrsMv9BZlt2yuA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-compose-refs@1.1.1':
    resolution: {integrity: sha512-Y9VzoRDSJtgFMUCoiZBDVo084VQ5hfpXxVE+NgkdNsjiDBByiImMZKKhxMwCbdHvhlENG6a833CbFkOQvTricw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-compose-refs@1.1.2':
    resolution: {integrity: sha512-z4eqJvfiNnFMHIIvXP3CY57y2WJs5g2v3X0zm9mEJkrkNv4rDxu+sg9Jh8EkXyeqBkB7SOcboo9dMVqhyrACIg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-context-menu@2.2.4':
    resolution: {integrity: sha512-ap4wdGwK52rJxGkwukU1NrnEodsUFQIooANKu+ey7d6raQ2biTcEf8za1zr0mgFHieevRTB2nK4dJeN8pTAZGQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-context@1.1.1':
    resolution: {integrity: sha512-UASk9zi+crv9WteK/NU4PLvOoL3OuE6BWVKNF6hPRBtYBDXQ2u5iu3O59zUlJiTVvkyuycnqrztsHVJwcK9K+Q==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dialog@1.1.4':
    resolution: {integrity: sha512-Ur7EV1IwQGCyaAuyDRiOLA5JIUZxELJljF+MbM/2NC0BYwfuRrbpS30BiQBJrVruscgUkieKkqXYDOoByaxIoA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-direction@1.1.0':
    resolution: {integrity: sha512-BUuBvgThEiAXh2DWu93XsT+a3aWrGqolGlqqw5VU1kG7p/ZH2cuDlM1sRLNnY3QcBS69UIz2mcKhMxDsdewhjg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dismissable-layer@1.1.3':
    resolution: {integrity: sha512-onrWn/72lQoEucDmJnr8uczSNTujT0vJnA/X5+3AkChVPowr8n1yvIKIabhWyMQeMvvmdpsvcyDqx3X1LEXCPg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-dropdown-menu@2.1.4':
    resolution: {integrity: sha512-iXU1Ab5ecM+yEepGAWK8ZhMyKX4ubFdCNtol4sT9D0OVErG9PNElfx3TQhjw7n7BC5nFVz68/5//clWy+8TXzA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-focus-guards@1.1.1':
    resolution: {integrity: sha512-pSIwfrT1a6sIoDASCSpFwOasEwKTZWDw/iBdtnqKO7v6FeOzYJ7U53cPzYFVR3geGGXgVHaH+CdngrrAzqUGxg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-focus-scope@1.1.1':
    resolution: {integrity: sha512-01omzJAYRxXdG2/he/+xy+c8a8gCydoQ1yOxnWNcRhrrBW5W+RQJ22EK1SaO8tb3WoUsuEw7mJjBozPzihDFjA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-hover-card@1.1.4':
    resolution: {integrity: sha512-QSUUnRA3PQ2UhvoCv3eYvMnCAgGQW+sTu86QPuNb+ZMi+ZENd6UWpiXbcWDQ4AEaKF9KKpCHBeaJz9Rw6lRlaQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-id@1.1.0':
    resolution: {integrity: sha512-EJUrI8yYh7WOjNOqpoJaf1jlFIH2LvtgAl+YcFqNCa+4hj64ZXmPkAKOFs/ukjz3byN6bdb/AVUqHkI8/uWWMA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-id@1.1.1':
    resolution: {integrity: sha512-kGkGegYIdQsOb4XjsfM97rXsiHaBwco+hFI66oO4s9LU+PLAC5oJ7khdOVFxkhsmlbpUqDAvXw11CluXP+jkHg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-label@2.1.1':
    resolution: {integrity: sha512-UUw5E4e/2+4kFMH7+YxORXGWggtY6sM8WIwh5RZchhLuUg2H1hc98Py+pr8HMz6rdaYrK2t296ZEjYLOCO5uUw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menu@2.1.4':
    resolution: {integrity: sha512-BnOgVoL6YYdHAG6DtXONaR29Eq4nvbi8rutrV/xlr3RQCMMb3yqP85Qiw/3NReozrSW+4dfLkK+rc1hb4wPU/A==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menubar@1.1.4':
    resolution: {integrity: sha512-+KMpi7VAZuB46+1LD7a30zb5IxyzLgC8m8j42gk3N4TUCcViNQdX8FhoH1HDvYiA8quuqcek4R4bYpPn/SY1GA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-navigation-menu@1.2.3':
    resolution: {integrity: sha512-IQWAsQ7dsLIYDrn0WqPU+cdM7MONTv9nqrLVYoie3BPiabSfUVDe6Fr+oEt0Cofsr9ONDcDe9xhmJbL1Uq1yKg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popover@1.1.4':
    resolution: {integrity: sha512-aUACAkXx8LaFymDma+HQVji7WhvEhpFJ7+qPz17Nf4lLZqtreGOFRiNQWQmhzp7kEWg9cOyyQJpdIMUMPc/CPw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popper@1.2.1':
    resolution: {integrity: sha512-3kn5Me69L+jv82EKRuQCXdYyf1DqHwD2U/sxoNgBGCB7K9TRc3bQamQ+5EPM9EvyPdli0W41sROd+ZU1dTCztw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-portal@1.1.3':
    resolution: {integrity: sha512-NciRqhXnGojhT93RPyDaMPfLH3ZSl4jjIFbZQ1b/vxvZEdHsBZ49wP9w8L3HzUQwep01LcWtkUvm0OVB5JAHTw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-presence@1.1.2':
    resolution: {integrity: sha512-18TFr80t5EVgL9x1SwF/YGtfG+l0BS0PRAlCWBDoBEiDQjeKgnNZRVJp/oVBl24sr3Gbfwc/Qpj4OcWTQMsAEg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-primitive@2.0.1':
    resolution: {integrity: sha512-sHCWTtxwNn3L3fH8qAfnF3WbUZycW93SM1j3NFDzXBiz8D6F5UTTy8G1+WFEaiCdvCVRJWj6N2R4Xq6HdiHmDg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-primitive@2.1.2':
    resolution: {integrity: sha512-uHa+l/lKfxuDD2zjN/0peM/RhhSmRjr5YWdk/37EnSv1nJ88uvG85DPexSm8HdFQROd2VdERJ6ynXbkCFi+APw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-progress@1.1.1':
    resolution: {integrity: sha512-6diOawA84f/eMxFHcWut0aE1C2kyE9dOyCTQOMRR2C/qPiXz/X0SaiA/RLbapQaXUCmy0/hLMf9meSccD1N0pA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-radio-group@1.2.2':
    resolution: {integrity: sha512-E0MLLGfOP0l8P/NxgVzfXJ8w3Ch8cdO6UDzJfDChu4EJDy+/WdO5LqpdY8PYnCErkmZH3gZhDL1K7kQ41fAHuQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-roving-focus@1.1.1':
    resolution: {integrity: sha512-QE1RoxPGJ/Nm8Qmk0PxP8ojmoaS67i0s7hVssS7KuI2FQoc/uzVlZsqKfQvxPE6D8hICCPHJ4D88zNhT3OOmkw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-scroll-area@1.2.2':
    resolution: {integrity: sha512-EFI1N/S3YxZEW/lJ/H1jY3njlvTd8tBmgKEn4GHi51+aMm94i6NmAJstsm5cu3yJwYqYc93gpCPm21FeAbFk6g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-select@2.1.4':
    resolution: {integrity: sha512-pOkb2u8KgO47j/h7AylCj7dJsm69BXcjkrvTqMptFqsE2i0p8lHkfgneXKjAgPzBMivnoMyt8o4KiV4wYzDdyQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-separator@1.1.1':
    resolution: {integrity: sha512-RRiNRSrD8iUiXriq/Y5n4/3iE8HzqgLHsusUSg5jVpU2+3tqcUFPJXHDymwEypunc2sWxDUS3UC+rkZRlHedsw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slider@1.2.2':
    resolution: {integrity: sha512-sNlU06ii1/ZcbHf8I9En54ZPW0Vil/yPVg4vQMcFNjrIx51jsHbFl1HYHQvCIWJSr1q0ZmA+iIs/ZTv8h7HHSA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slot@1.1.1':
    resolution: {integrity: sha512-RApLLOcINYJA+dMVbOju7MYv1Mb2EBp2nH4HdDzXTSyaR5optlm6Otrz1euW3HbdOR8UmmFK06TD+A9frYWv+g==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-slot@1.2.2':
    resolution: {integrity: sha512-y7TBO4xN4Y94FvcWIOIh18fM4R1A8S4q1jhoz4PNzOoHsFcN8pogcFmZrTYAm4F9VRUrWP/Mw7xSKybIeRI+CQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-switch@1.1.2':
    resolution: {integrity: sha512-zGukiWHjEdBCRyXvKR6iXAQG6qXm2esuAD6kDOi9Cn+1X6ev3ASo4+CsYaD6Fov9r/AQFekqnD/7+V0Cs6/98g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tabs@1.1.2':
    resolution: {integrity: sha512-9u/tQJMcC2aGq7KXpGivMm1mgq7oRJKXphDwdypPd/j21j/2znamPU8WkXgnhUaTrSFNIt8XhOyCAupg8/GbwQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toast@1.2.4':
    resolution: {integrity: sha512-Sch9idFJHJTMH9YNpxxESqABcAFweJG4tKv+0zo0m5XBvUSL8FM5xKcJLFLXononpePs8IclyX1KieL5SDUNgA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle-group@1.1.1':
    resolution: {integrity: sha512-OgDLZEA30Ylyz8YSXvnGqIHtERqnUt1KUYTKdw/y8u7Ci6zGiJfXc02jahmcSNK3YcErqioj/9flWC9S1ihfwg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle@1.1.1':
    resolution: {integrity: sha512-i77tcgObYr743IonC1hrsnnPmszDRn8p+EGUsUt+5a/JFn28fxaM88Py6V2mc8J5kELMWishI0rLnuGLFD/nnQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tooltip@1.1.6':
    resolution: {integrity: sha512-TLB5D8QLExS1uDn7+wH/bjEmRurNMTzNrtq7IjaS4kjion9NtzsTGkvR5+i7yc9q01Pi2KMM2cN3f8UG4IvvXA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-use-callback-ref@1.1.0':
    resolution: {integrity: sha512-CasTfvsy+frcFkbXtSJ2Zu9JHpN8TYKxkgJGWbjiZhFivxaeW7rMeZt7QELGVLaYVfFMsKHjb7Ak0nMEe+2Vfw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-controllable-state@1.1.0':
    resolution: {integrity: sha512-MtfMVJiSr2NjzS0Aa90NPTnvTSg6C/JLCV7ma0W6+OMV78vd8OyRpID+Ng9LxzsPbLeuBnWBA1Nq30AtBIDChw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-escape-keydown@1.1.0':
    resolution: {integrity: sha512-L7vwWlR1kTTQ3oh7g1O0CBF3YCyyTj8NmhLR+phShpyA50HCfBFKVJTpshm9PzLiKmehsrQzTYTpX9HvmC9rhw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-layout-effect@1.1.0':
    resolution: {integrity: sha512-+FPE0rOdziWSrH9athwI1R0HDVbWlEhd+FR+aSDk4uWGmSJ9Z54sdZVDQPZAinJhJXwfT+qnj969mCsT2gfm5w==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-layout-effect@1.1.1':
    resolution: {integrity: sha512-RbJRS4UWQFkzHTTwVymMTUv8EqYhOp8dOOviLj2ugtTiXRaRQS7GLGxZTLL1jWhMeoSCf5zmcZkqTl9IiYfXcQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-previous@1.1.0':
    resolution: {integrity: sha512-Z/e78qg2YFnnXcW88A4JmTtm4ADckLno6F7OXotmkQfeuCVaKuYzqAATPhVzl3delXE7CxIV8shofPn3jPc5Og==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-rect@1.1.0':
    resolution: {integrity: sha512-0Fmkebhr6PiseyZlYAOtLS+nb7jLmpqTrJyv61Pe68MKYW6OWdRE2kI70TaYY27u7H0lajqM3hSMMLFq18Z7nQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-size@1.1.0':
    resolution: {integrity: sha512-XW3/vWuIXHa+2Uwcc2ABSfcCledmXhhQPlGbfcRXbiUQI5Icjcg19BGCZVKKInYbvUCut/ufbbLLPFC5cbb1hw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-visually-hidden@1.1.1':
    resolution: {integrity: sha512-vVfA2IZ9q/J+gEamvj761Oq1FpWgCDaNOOIfbPVp2MVPLEomUr5+Vf7kJGwQ24YxZSlQVar7Bes8kyTo5Dshpg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/rect@1.1.0':
    resolution: {integrity: sha512-A9+lCBZoaMJlVKcRBz2YByCG+Cp2t6nAnMnNba+XiWxnj6r4JUFqfsgwocMBZU9LPtdxC6wB56ySYpc7LQIoJg==}

  '@swc/counter@0.1.3':
    resolution: {integrity: sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==}

  '@swc/helpers@0.5.15':
    resolution: {integrity: sha512-JQ5TuMi45Owi4/BIMAJBoSQoOJu12oOk/gADqlcUL9JEdHB8vyjUSsxqeNXnmXHjYKMi2WcYtezGEEhqUI/E2g==}

  '@types/d3-array@3.2.1':
    resolution: {integrity: sha512-Y2Jn2idRrLzUfAKV2LyRImR+y4oa2AntrgID95SHJxuMUrkNXmanDSed71sRNZysveJVt1hLLemQZIady0FpEg==}

  '@types/d3-color@3.1.3':
    resolution: {integrity: sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==}

  '@types/d3-ease@3.0.2':
    resolution: {integrity: sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==}

  '@types/d3-interpolate@3.0.4':
    resolution: {integrity: sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==}

  '@types/d3-path@3.1.1':
    resolution: {integrity: sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==}

  '@types/d3-scale@4.0.9':
    resolution: {integrity: sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==}

  '@types/d3-shape@3.1.7':
    resolution: {integrity: sha512-VLvUQ33C+3J+8p+Daf+nYSOsjB4GXp19/S/aGo60m9h1v6XaxjiT82lKVWJCfzhtuZ3yD7i/TPeC/fuKLLOSmg==}

  '@types/d3-time@3.0.4':
    resolution: {integrity: sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==}

  '@types/d3-timer@3.0.2':
    resolution: {integrity: sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==}

  '@types/node@22.0.0':
    resolution: {integrity: sha512-VT7KSYudcPOzP5Q0wfbowyNLaVR8QWUdw+088uFWwfvpY6uCWaXpqV6ieLAu9WBcnTa7H4Z5RLK8I5t2FuOcqw==}

  '@types/react-dom@19.0.0':
    resolution: {integrity: sha512-1KfiQKsH1o00p9m5ag12axHQSb3FOU9H20UTrujVSkNhuCrRHiQWFqgEnTNK5ZNfnzZv8UWrnXVqCmCF9fgY3w==}

  '@types/react@19.0.0':
    resolution: {integrity: sha512-MY3oPudxvMYyesqs/kW1Bh8y9VqSmf+tzqw3ae8a9DZW68pUe3zAdHeI1jc6iAysuRdACnVknHP8AhwD4/dxtg==}

  '@upstash/redis@1.34.9':
    resolution: {integrity: sha512-7qzzF2FQP5VxR2YUNjemWs+hl/8VzJJ6fOkT7O7kt9Ct8olEVzb1g6/ik6B8Pb8W7ZmYv81SdlVV9F6O8bh/gw==}

  ansi-regex@5.0.1:
    resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
    engines: {node: '>=8'}

  ansi-regex@6.1.0:
    resolution: {integrity: sha512-7HSX4QQb4CspciLpVFwyRe79O3xsIZDDLER21kERQ71oaPodF8jL725AgJMFAYbooIqolJoRLuM81SpeUkpkvA==}
    engines: {node: '>=12'}

  ansi-styles@4.3.0:
    resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
    engines: {node: '>=8'}

  ansi-styles@6.2.1:
    resolution: {integrity: sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==}
    engines: {node: '>=12'}

  any-promise@1.3.0:
    resolution: {integrity: sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==}

  anymatch@3.1.3:
    resolution: {integrity: sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==}
    engines: {node: '>= 8'}

  arg@5.0.2:
    resolution: {integrity: sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==}

  aria-hidden@1.2.4:
    resolution: {integrity: sha512-y+CcFFwelSXpLZk/7fMB2mUbGtX9lKycf1MWJ7CaTIERyitVlyQx6C+sxcROU2BAJ24OiZyK+8wj2i8AlBoS3A==}
    engines: {node: '>=10'}

  autoprefixer@10.4.20:
    resolution: {integrity: sha512-XY25y5xSv/wEoqzDyXXME4AFfkZI0P23z6Fs3YgymDnKJkCGOnkL0iTxCa85UTqaSgfcqyf3UA6+c7wUvx/16g==}
    engines: {node: ^10 || ^12 || >=14}
    hasBin: true
    peerDependencies:
      postcss: ^8.1.0

  balanced-match@1.0.2:
    resolution: {integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==}

  bcryptjs@3.0.2:
    resolution: {integrity: sha512-k38b3XOZKv60C4E2hVsXTolJWfkGRMbILBIe2IBITXciy5bOsTKot5kDrf3ZfufQtQOUN5mXceUEpU1rTl9Uog==}
    hasBin: true

  binary-extensions@2.3.0:
    resolution: {integrity: sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==}
    engines: {node: '>=8'}

  brace-expansion@2.0.1:
    resolution: {integrity: sha512-XnAIvQ8eM+kC6aULx6wuQiwVsnzsi9d3WxzV3FpWTGA19F621kwdbsAcFKXgKUHZWsy+mY6iL1sHTxWEFCytDA==}

  braces@3.0.3:
    resolution: {integrity: sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==}
    engines: {node: '>=8'}

  browserslist@4.24.5:
    resolution: {integrity: sha512-FDToo4Wo82hIdgc1CQ+NQD0hEhmpPjrZ3hiUgwgOG6IuTdlpr8jdjyG24P6cNP1yJpTLzS5OcGgSw0xmDU1/Tw==}
    engines: {node: ^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7}
    hasBin: true

  busboy@1.6.0:
    resolution: {integrity: sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==}
    engines: {node: '>=10.16.0'}

  camelcase-css@2.0.1:
    resolution: {integrity: sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==}
    engines: {node: '>= 6'}

  caniuse-lite@1.0.30001717:
    resolution: {integrity: sha512-auPpttCq6BDEG8ZAuHJIplGw6GODhjw+/11e7IjpnYCxZcW/ONgPs0KVBJ0d1bY3e2+7PRe5RCLyP+PfwVgkYw==}

  chokidar@3.6.0:
    resolution: {integrity: sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==}
    engines: {node: '>= 8.10.0'}

  class-variance-authority@0.7.1:
    resolution: {integrity: sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==}

  client-only@0.0.1:
    resolution: {integrity: sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==}

  clsx@2.1.1:
    resolution: {integrity: sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==}
    engines: {node: '>=6'}

  cmdk@1.0.4:
    resolution: {integrity: sha512-AnsjfHyHpQ/EFeAnG216WY7A5LiYCoZzCSygiLvfXC3H3LFGCprErteUcszaVluGOhuOTbJS3jWHrSDYPBBygg==}
    peerDependencies:
      react: ^18 || ^19 || ^19.0.0-rc
      react-dom: ^18 || ^19 || ^19.0.0-rc

  color-convert@2.0.1:
    resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
    engines: {node: '>=7.0.0'}

  color-name@1.1.4:
    resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  color-string@1.9.1:
    resolution: {integrity: sha512-shrVawQFojnZv6xM40anx4CkoDP+fZsw/ZerEMsW/pyzsRbElpsL/DBVW7q3ExxwusdNXI3lXpuhEZkzs8p5Eg==}

  color@4.2.3:
    resolution: {integrity: sha512-1rXeuUUiGGrykh+CeBdu5Ie7OJwinCgQY0bc7GCRxy5xVHy+moaqkpL/jqQq0MtQOeYcrqEz4abc5f0KtU7W4A==}
    engines: {node: '>=12.5.0'}

  colorette@1.4.0:
    resolution: {integrity: sha512-Y2oEozpomLn7Q3HFP7dpww7AtMJplbM9lGZP6RDfHqmbeRjiwRg4n6VM6j4KLmRke85uWEI7JqF17f3pqdRA0g==}

  commander@4.1.1:
    resolution: {integrity: sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==}
    engines: {node: '>= 6'}

  cookie@0.7.2:
    resolution: {integrity: sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==}
    engines: {node: '>= 0.6'}

  cross-spawn@7.0.6:
    resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
    engines: {node: '>= 8'}

  crypto-js@4.2.0:
    resolution: {integrity: sha512-KALDyEYgpY+Rlob/iriUtjV6d5Eq+Y191A5g4UqLAi8CyGP9N1+FdVbkc1SxKc2r4YAYqG8JzO2KGL+AizD70Q==}

  cssesc@3.0.0:
    resolution: {integrity: sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==}
    engines: {node: '>=4'}
    hasBin: true

  csstype@3.1.3:
    resolution: {integrity: sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw==}

  d3-array@3.2.4:
    resolution: {integrity: sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==}
    engines: {node: '>=12'}

  d3-color@3.1.0:
    resolution: {integrity: sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==}
    engines: {node: '>=12'}

  d3-ease@3.0.1:
    resolution: {integrity: sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==}
    engines: {node: '>=12'}

  d3-format@3.1.0:
    resolution: {integrity: sha512-YyUI6AEuY/Wpt8KWLgZHsIU86atmikuoOmCfommt0LYHiQSPjvX2AcFc38PX0CBpr2RCyZhjex+NS/LPOv6YqA==}
    engines: {node: '>=12'}

  d3-interpolate@3.0.1:
    resolution: {integrity: sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==}
    engines: {node: '>=12'}

  d3-path@3.1.0:
    resolution: {integrity: sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==}
    engines: {node: '>=12'}

  d3-scale@4.0.2:
    resolution: {integrity: sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==}
    engines: {node: '>=12'}

  d3-shape@3.2.0:
    resolution: {integrity: sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==}
    engines: {node: '>=12'}

  d3-time-format@4.1.0:
    resolution: {integrity: sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==}
    engines: {node: '>=12'}

  d3-time@3.1.0:
    resolution: {integrity: sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==}
    engines: {node: '>=12'}

  d3-timer@3.0.1:
    resolution: {integrity: sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==}
    engines: {node: '>=12'}

  date-fns@4.1.0:
    resolution: {integrity: sha512-Ukq0owbQXxa/U3EGtsdVBkR1w7KOQ5gIBqdH2hkvknzZPYvBxb/aa6E8L7tmjFtkwZBu3UXBbjIgPo/Ez4xaNg==}

  debug@4.4.0:
    resolution: {integrity: sha512-6WTZ/IxCY/T6BALoZHaE4ctp9xm+Z5kY/pzYaCHRFeyVhojxlrm+46y68HA6hr0TcwEssoxNiDEUJQjfPZ/RYA==}
    engines: {node: '>=6.0'}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  decimal.js-light@2.5.1:
    resolution: {integrity: sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==}

  detect-libc@2.0.4:
    resolution: {integrity: sha512-3UDv+G9CsCKO1WKMGw9fwq/SWJYbI0c5Y7LU1AXYoDdbhE2AHQ6N6Nb34sG8Fj7T5APy8qXDCKuuIHd1BR0tVA==}
    engines: {node: '>=8'}

  detect-node-es@1.1.0:
    resolution: {integrity: sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==}

  didyoumean@1.2.2:
    resolution: {integrity: sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==}

  dlv@1.1.3:
    resolution: {integrity: sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==}

  dom-helpers@5.2.1:
    resolution: {integrity: sha512-nRCa7CK3VTrM2NmGkIy4cbK7IZlgBE/PYMn55rrXefr5xXDP0LdtfPnblFDoVdcAfslJ7or6iqAUnx0CCGIWQA==}

  eastasianwidth@0.2.0:
    resolution: {integrity: sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==}

  electron-to-chromium@1.5.151:
    resolution: {integrity: sha512-Rl6uugut2l9sLojjS4H4SAr3A4IgACMLgpuEMPYCVcKydzfyPrn5absNRju38IhQOf/NwjJY8OGWjlteqYeBCA==}

  embla-carousel-react@8.5.1:
    resolution: {integrity: sha512-z9Y0K84BJvhChXgqn2CFYbfEi6AwEr+FFVVKm/MqbTQ2zIzO1VQri6w67LcfpVF0AjbhwVMywDZqY4alYkjW5w==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.1 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  embla-carousel-reactive-utils@8.5.1:
    resolution: {integrity: sha512-n7VSoGIiiDIc4MfXF3ZRTO59KDp820QDuyBDGlt5/65+lumPHxX2JLz0EZ23hZ4eg4vZGUXwMkYv02fw2JVo/A==}
    peerDependencies:
      embla-carousel: 8.5.1

  embla-carousel@8.5.1:
    resolution: {integrity: sha512-JUb5+FOHobSiWQ2EJNaueCNT/cQU9L6XWBbWmorWPQT9bkbk+fhsuLr8wWrzXKagO3oWszBO7MSx+GfaRk4E6A==}

  emoji-regex@8.0.0:
    resolution: {integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==}

  emoji-regex@9.2.2:
    resolution: {integrity: sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==}

  esbuild-register@3.6.0:
    resolution: {integrity: sha512-H2/S7Pm8a9CL1uhp9OvjwrBh5Pvx0H8qVOxNu8Wed9Y7qv56MPtq+GGM8RJpq6glYJn9Wspr8uw7l55uyinNeg==}
    peerDependencies:
      esbuild: '>=0.12 <1'

  esbuild@0.25.4:
    resolution: {integrity: sha512-8pgjLUcUjcgDg+2Q4NYXnPbo/vncAY4UmyaCm0jZevERqCHZIaWwdJHkf8XQtu4AxSKCdvrUbT0XUr1IdZzI8Q==}
    engines: {node: '>=18'}
    hasBin: true

  escalade@3.2.0:
    resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
    engines: {node: '>=6'}

  eventemitter3@4.0.7:
    resolution: {integrity: sha512-8guHBZCwKnFhYdHr2ysuRWErTwhoN2X8XELRlrRwpmfeY2jjuUN4taQMsULKUVo1K4DvZl+0pgfyoysHxvmvEw==}

  fast-equals@5.2.2:
    resolution: {integrity: sha512-V7/RktU11J3I36Nwq2JnZEM7tNm17eBJz+u25qdxBZeCKiX6BkVSZQjwWIr+IobgnZy+ag73tTZgZi7tr0LrBw==}
    engines: {node: '>=6.0.0'}

  fast-glob@3.3.3:
    resolution: {integrity: sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==}
    engines: {node: '>=8.6.0'}

  fastq@1.19.1:
    resolution: {integrity: sha512-GwLTyxkCXjXbxqIhTsMI2Nui8huMPtnxg7krajPJAjnEG/iiOS7i+zCtWGZR9G0NBKbXKh6X9m9UIsYX/N6vvQ==}

  fill-range@7.1.1:
    resolution: {integrity: sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==}
    engines: {node: '>=8'}

  foreground-child@3.3.1:
    resolution: {integrity: sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==}
    engines: {node: '>=14'}

  fraction.js@4.3.7:
    resolution: {integrity: sha512-ZsDfxO51wGAXREY55a7la9LScWpwv9RxIrYABrlvOFBlH/ShPnrtsXeuUIfXKKOVicNxQ+o8JTbJvjS4M89yew==}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  get-nonce@1.0.1:
    resolution: {integrity: sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==}
    engines: {node: '>=6'}

  glob-parent@5.1.2:
    resolution: {integrity: sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==}
    engines: {node: '>= 6'}

  glob-parent@6.0.2:
    resolution: {integrity: sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==}
    engines: {node: '>=10.13.0'}

  glob@10.4.5:
    resolution: {integrity: sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==}
    hasBin: true

  hasown@2.0.2:
    resolution: {integrity: sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==}
    engines: {node: '>= 0.4'}

  input-otp@1.4.1:
    resolution: {integrity: sha512-+yvpmKYKHi9jIGngxagY9oWiiblPB7+nEO75F2l2o4vs+6vpPZZmUl4tBNYuTCvQjhvEIbdNeJu70bhfYP2nbw==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc

  internmap@2.0.3:
    resolution: {integrity: sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==}
    engines: {node: '>=12'}

  is-arrayish@0.3.2:
    resolution: {integrity: sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ==}

  is-binary-path@2.1.0:
    resolution: {integrity: sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==}
    engines: {node: '>=8'}

  is-core-module@2.16.1:
    resolution: {integrity: sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==}
    engines: {node: '>= 0.4'}

  is-extglob@2.1.1:
    resolution: {integrity: sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==}
    engines: {node: '>=0.10.0'}

  is-fullwidth-code-point@3.0.0:
    resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
    engines: {node: '>=8'}

  is-glob@4.0.3:
    resolution: {integrity: sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==}
    engines: {node: '>=0.10.0'}

  is-number@7.0.0:
    resolution: {integrity: sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==}
    engines: {node: '>=0.12.0'}

  isarray@1.0.0:
    resolution: {integrity: sha512-VLghIWNM6ELQzo7zwmcg0NmTVyWKYjvIeM83yjp0wRDTmUnrM678fQbcKBo6n2CJEF0szoG//ytg+TKla89ALQ==}

  isexe@2.0.0:
    resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}

  isobject@2.1.0:
    resolution: {integrity: sha512-+OUdGJlgjOBZDfxnDjYYG6zp487z0JGNQq3cYQYg5f5hKR+syHMsaztzGeml/4kGG55CSpKSpWTY+jYGgsHLgA==}
    engines: {node: '>=0.10.0'}

  jackspeak@3.4.3:
    resolution: {integrity: sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==}

  jiti@1.21.7:
    resolution: {integrity: sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==}
    hasBin: true

  jose@4.15.9:
    resolution: {integrity: sha512-1vUQX+IdDMVPj4k8kOxgUqlcK518yluMuGZwqlr44FS1ppZB/5GWh4rZG89erpOBOJjU/OBsnCVFfapsRz6nEA==}

  jose@6.0.11:
    resolution: {integrity: sha512-QxG7EaliDARm1O1S8BGakqncGT9s25bKL1WSf6/oa17Tkqwi8D2ZNglqCF+DsYF88/rV66Q/Q2mFAy697E1DUg==}

  js-tokens@4.0.0:
    resolution: {integrity: sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==}

  lilconfig@3.1.3:
    resolution: {integrity: sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==}
    engines: {node: '>=14'}

  line-column@1.0.2:
    resolution: {integrity: sha512-Ktrjk5noGYlHsVnYWh62FLVs4hTb8A3e+vucNZMgPeAOITdshMSgv4cCZQeRDjm7+goqmo6+liZwTXo+U3sVww==}

  lines-and-columns@1.2.4:
    resolution: {integrity: sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==}

  lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==}

  loose-envify@1.4.0:
    resolution: {integrity: sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==}
    hasBin: true

  lru-cache@10.4.3:
    resolution: {integrity: sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==}

  lru-cache@6.0.0:
    resolution: {integrity: sha512-Jo6dJ04CmSjuznwJSS3pUeWmd/H0ffTlkXXgwZi+eq1UCmqQwCh+eLsYOYCwY991i2Fah4h1BEMCx4qThGbsiA==}
    engines: {node: '>=10'}

  lucide-react@0.454.0:
    resolution: {integrity: sha512-hw7zMDwykCLnEzgncEEjHeA6+45aeEzRYuKHuyRSOPkhko+J3ySGjGIzu+mmMfDFG1vazHepMaYFYHbTFAZAAQ==}
    peerDependencies:
      react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0-rc

  merge2@1.4.1:
    resolution: {integrity: sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==}
    engines: {node: '>= 8'}

  micromatch@4.0.8:
    resolution: {integrity: sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==}
    engines: {node: '>=8.6'}

  minimatch@9.0.5:
    resolution: {integrity: sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==}
    engines: {node: '>=16 || 14 >=14.17'}

  minipass@7.1.2:
    resolution: {integrity: sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==}
    engines: {node: '>=16 || 14 >=14.17'}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  mz@2.7.0:
    resolution: {integrity: sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==}

  nanoid@3.3.11:
    resolution: {integrity: sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  next-auth@4.24.11:
    resolution: {integrity: sha512-pCFXzIDQX7xmHFs4KVH4luCjaCbuPRtZ9oBUjUhOk84mZ9WVPf94n87TxYI4rSRf9HmfHEF8Yep3JrYDVOo3Cw==}
    peerDependencies:
      '@auth/core': 0.34.2
      next: ^12.2.5 || ^13 || ^14 || ^15
      nodemailer: ^6.6.5
      react: ^17.0.2 || ^18 || ^19
      react-dom: ^17.0.2 || ^18 || ^19
    peerDependenciesMeta:
      '@auth/core':
        optional: true
      nodemailer:
        optional: true

  next-themes@0.4.4:
    resolution: {integrity: sha512-LDQ2qIOJF0VnuVrrMSMLrWGjRMkq+0mpgl6e0juCLqdJ+oo8Q84JRWT6Wh11VDQKkMMe+dVzDKLWs5n87T+PkQ==}
    peerDependencies:
      react: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc
      react-dom: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc

  next@15.2.4:
    resolution: {integrity: sha512-VwL+LAaPSxEkd3lU2xWbgEOtrM8oedmyhBqaVNmgKB+GvZlCy9rgaEc+y2on0wv+l0oSFqLtYD6dcC1eAedUaQ==}
    engines: {node: ^18.18.0 || ^19.8.0 || >= 20.0.0}
    hasBin: true
    peerDependencies:
      '@opentelemetry/api': ^1.1.0
      '@playwright/test': ^1.41.2
      babel-plugin-react-compiler: '*'
      react: ^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0
      react-dom: ^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0
      sass: ^1.3.0
    peerDependenciesMeta:
      '@opentelemetry/api':
        optional: true
      '@playwright/test':
        optional: true
      babel-plugin-react-compiler:
        optional: true
      sass:
        optional: true

  node-releases@2.0.19:
    resolution: {integrity: sha512-xxOWJsBKtzAq7DY0J+DTzuz58K8e7sJbdgwkbMWQe8UYB6ekmsQ45q0M/tJDsGaZmbC+l7n57UV8Hl5tHxO9uw==}

  nodemailer@7.0.3:
    resolution: {integrity: sha512-Ajq6Sz1x7cIK3pN6KesGTah+1gnwMnx5gKl3piQlQQE/PwyJ4Mbc8is2psWYxK3RJTVeqsDaCv8ZzXLCDHMTZw==}
    engines: {node: '>=6.0.0'}

  normalize-path@3.0.0:
    resolution: {integrity: sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==}
    engines: {node: '>=0.10.0'}

  normalize-range@0.1.2:
    resolution: {integrity: sha512-bdok/XvKII3nUpklnV6P2hxtMNrCboOjAcyBuQnWEhO665FwrSNRxU+AqpsyvO6LgGYPspN+lu5CLtw4jPRKNA==}
    engines: {node: '>=0.10.0'}

  oauth4webapi@3.5.1:
    resolution: {integrity: sha512-txg/jZQwcbaF7PMJgY7aoxc9QuCxHVFMiEkDIJ60DwDz3PbtXPQnrzo+3X4IRYGChIwWLabRBRpf1k9hO9+xrQ==}

  oauth@0.9.15:
    resolution: {integrity: sha512-a5ERWK1kh38ExDEfoO6qUHJb32rd7aYmPHuyCu3Fta/cnICvYmgd2uhuKXvPD+PXB+gCEYYEaQdIRAjCOwAKNA==}

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-hash@2.2.0:
    resolution: {integrity: sha512-gScRMn0bS5fH+IuwyIFgnh9zBdo4DV+6GhygmWM9HyNJSgS0hScp1f5vjtm7oIIOiT9trXrShAkLFSc2IqKNgw==}
    engines: {node: '>= 6'}

  object-hash@3.0.0:
    resolution: {integrity: sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==}
    engines: {node: '>= 6'}

  oidc-token-hash@5.1.0:
    resolution: {integrity: sha512-y0W+X7Ppo7oZX6eovsRkuzcSM40Bicg2JEJkDJ4irIt1wsYAP5MLSNv+QAogO8xivMffw/9OvV3um1pxXgt1uA==}
    engines: {node: ^10.13.0 || >=12.0.0}

  openid-client@5.7.1:
    resolution: {integrity: sha512-jDBPgSVfTnkIh71Hg9pRvtJc6wTwqjRkN88+gCFtYWrlP4Yx2Dsrow8uPi3qLr/aeymPF3o2+dS+wOpglK04ew==}

  package-json-from-dist@1.0.1:
    resolution: {integrity: sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==}

  path-key@3.1.1:
    resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
    engines: {node: '>=8'}

  path-parse@1.0.7:
    resolution: {integrity: sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==}

  path-scurry@1.11.1:
    resolution: {integrity: sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==}
    engines: {node: '>=16 || 14 >=14.18'}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@2.3.1:
    resolution: {integrity: sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==}
    engines: {node: '>=8.6'}

  pify@2.3.0:
    resolution: {integrity: sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==}
    engines: {node: '>=0.10.0'}

  pirates@4.0.7:
    resolution: {integrity: sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==}
    engines: {node: '>= 6'}

  postcss-import@15.1.0:
    resolution: {integrity: sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==}
    engines: {node: '>=14.0.0'}
    peerDependencies:
      postcss: ^8.0.0

  postcss-js@4.0.1:
    resolution: {integrity: sha512-dDLF8pEO191hJMtlHFPRa8xsizHaM82MLfNkUHdUtVEV3tgTp5oj+8qbEqYM57SLfc74KSbw//4SeJma2LRVIw==}
    engines: {node: ^12 || ^14 || >= 16}
    peerDependencies:
      postcss: ^8.4.21

  postcss-load-config@4.0.2:
    resolution: {integrity: sha512-bSVhyJGL00wMVoPUzAVAnbEoWyqRxkjv64tUl427SKnPrENtq6hJwUojroMz2VB+Q1edmi4IfrAPpami5VVgMQ==}
    engines: {node: '>= 14'}
    peerDependencies:
      postcss: '>=8.0.9'
      ts-node: '>=9.0.0'
    peerDependenciesMeta:
      postcss:
        optional: true
      ts-node:
        optional: true

  postcss-nested@6.2.0:
    resolution: {integrity: sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==}
    engines: {node: '>=12.0'}
    peerDependencies:
      postcss: ^8.2.14

  postcss-selector-parser@6.1.2:
    resolution: {integrity: sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==}
    engines: {node: '>=4'}

  postcss-value-parser@4.2.0:
    resolution: {integrity: sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==}

  postcss@8.0.0:
    resolution: {integrity: sha512-BriaW5AeZHfyuuKhK3Z6yRDKI6NR2TdRWyZcj3+Pk2nczQsMBqavggAzTledsbyexPthW3nFA6XfgCWjZqmVPA==}
    engines: {node: ^10 || ^12 || >=14}

  postcss@8.4.31:
    resolution: {integrity: sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==}
    engines: {node: ^10 || ^12 || >=14}

  postcss@8.5.3:
    resolution: {integrity: sha512-dle9A3yYxlBSrt8Fu+IpjGT8SY8hN0mlaA6GY8t0P5PjIOZemULz/E2Bnm/2dcUOena75OTNkHI76uZBNUUq3A==}
    engines: {node: ^10 || ^12 || >=14}

  preact-render-to-string@5.2.6:
    resolution: {integrity: sha512-JyhErpYOvBV1hEPwIxc/fHWXPfnEGdRKxc8gFdAZ7XV4tlzyzG847XAyEZqoDnynP88akM4eaHcSOzNcLWFguw==}
    peerDependencies:
      preact: '>=10'

  preact-render-to-string@6.5.11:
    resolution: {integrity: sha512-ubnauqoGczeGISiOh6RjX0/cdaF8v/oDXIjO85XALCQjwQP+SB4RDXXtvZ6yTYSjG+PC1QRP2AhPgCEsM2EvUw==}
    peerDependencies:
      preact: '>=10'

  preact@10.24.3:
    resolution: {integrity: sha512-Z2dPnBnMUfyQfSQ+GBdsGa16hz35YmLmtTLhM169uW944hYL6xzTYkJjC07j+Wosz733pMWx0fgON3JNw1jJQA==}

  preact@10.26.6:
    resolution: {integrity: sha512-5SRRBinwpwkaD+OqlBDeITlRgvd8I8QlxHJw9AxSdMNV6O+LodN9nUyYGpSF7sadHjs6RzeFShMexC6DbtWr9g==}

  pretty-format@3.8.0:
    resolution: {integrity: sha512-WuxUnVtlWL1OfZFQFuqvnvs6MiAGk9UNsBostyBOB0Is9wb5uRESevA6rnl/rkksXaGX3GzZhPup5d6Vp1nFew==}

  prisma@6.7.0:
    resolution: {integrity: sha512-vArg+4UqnQ13CVhc2WUosemwh6hr6cr6FY2uzDvCIFwH8pu8BXVv38PktoMLVjtX7sbYThxbnZF5YiR8sN2clw==}
    engines: {node: '>=18.18'}
    hasBin: true
    peerDependencies:
      typescript: '>=5.1.0'
    peerDependenciesMeta:
      typescript:
        optional: true

  prop-types@15.8.1:
    resolution: {integrity: sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==}

  queue-microtask@1.2.3:
    resolution: {integrity: sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==}

  react-day-picker@8.10.1:
    resolution: {integrity: sha512-TMx7fNbhLk15eqcMt+7Z7S2KF7mfTId/XJDjKE8f+IUcFn0l08/kI4FiYTL/0yuOLmEcbR4Fwe3GJf/NiiMnPA==}
    peerDependencies:
      date-fns: ^2.28.0 || ^3.0.0
      react: ^16.8.0 || ^17.0.0 || ^18.0.0

  react-dom@19.0.0:
    resolution: {integrity: sha512-4GV5sHFG0e/0AD4X+ySy6UJd3jVl1iNsNHdpad0qhABJ11twS3TTBnseqsKurKcsNqCEFeGL3uLpVChpIO3QfQ==}
    peerDependencies:
      react: ^19.0.0

  react-hook-form@7.54.1:
    resolution: {integrity: sha512-PUNzFwQeQ5oHiiTUO7GO/EJXGEtuun2Y1A59rLnZBBj+vNEOWt/3ERTiG1/zt7dVeJEM+4vDX/7XQ/qanuvPMg==}
    engines: {node: '>=18.0.0'}
    peerDependencies:
      react: ^16.8.0 || ^17 || ^18 || ^19

  react-is@16.13.1:
    resolution: {integrity: sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==}

  react-is@18.3.1:
    resolution: {integrity: sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==}

  react-remove-scroll-bar@2.3.8:
    resolution: {integrity: sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-remove-scroll@2.6.3:
    resolution: {integrity: sha512-pnAi91oOk8g8ABQKGF5/M9qxmmOPxaAnopyTHYfqYEwJhyFrbbBtHuSgtKEoH0jpcxx5o3hXqH1mNd9/Oi+8iQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-resizable-panels@2.1.7:
    resolution: {integrity: sha512-JtT6gI+nURzhMYQYsx8DKkx6bSoOGFp7A3CwMrOb8y5jFHFyqwo9m68UhmXRw57fRVJksFn1TSlm3ywEQ9vMgA==}
    peerDependencies:
      react: ^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  react-smooth@4.0.4:
    resolution: {integrity: sha512-gnGKTpYwqL0Iii09gHobNolvX4Kiq4PKx6eWBCYYix+8cdw+cGo3do906l1NBPKkSWx1DghC1dlWG9L2uGd61Q==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  react-style-singleton@2.2.3:
    resolution: {integrity: sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-transition-group@4.4.5:
    resolution: {integrity: sha512-pZcd1MCJoiKiBR2NRxeCRg13uCXbydPnmB4EOeRrY7480qNWO8IIgQG6zlDkm6uRMsURXPuKq0GWtiM59a5Q6g==}
    peerDependencies:
      react: '>=16.6.0'
      react-dom: '>=16.6.0'

  react@19.0.0:
    resolution: {integrity: sha512-V8AVnmPIICiWpGfm6GLzCR/W5FXLchHop40W4nXBmdlEceh16rCN8O8LNWm5bh5XUX91fh7KpA+W0TgMKmgTpQ==}
    engines: {node: '>=0.10.0'}

  read-cache@1.0.0:
    resolution: {integrity: sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==}

  readdirp@3.6.0:
    resolution: {integrity: sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==}
    engines: {node: '>=8.10.0'}

  recharts-scale@0.4.5:
    resolution: {integrity: sha512-kivNFO+0OcUNu7jQquLXAxz1FIwZj8nrj+YkOKc5694NbjCvcT6aSZiIzNzd2Kul4o4rTto8QVR9lMNtxD4G1w==}

  recharts@2.15.0:
    resolution: {integrity: sha512-cIvMxDfpAmqAmVgc4yb7pgm/O1tmmkl/CjrvXuW+62/+7jj/iF9Ykm+hb/UJt42TREHMyd3gb+pkgoa2MxgDIw==}
    engines: {node: '>=14'}
    peerDependencies:
      react: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  resolve@1.22.10:
    resolution: {integrity: sha512-NPRy+/ncIMeDlTAsuqwKIiferiawhefFJtkNSW0qZJEqMEb+qBt/77B/jGeeek+F0uOeN05CDa6HXbbIgtVX4w==}
    engines: {node: '>= 0.4'}
    hasBin: true

  reusify@1.1.0:
    resolution: {integrity: sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==}
    engines: {iojs: '>=1.0.0', node: '>=0.10.0'}

  run-parallel@1.2.0:
    resolution: {integrity: sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==}

  scheduler@0.25.0:
    resolution: {integrity: sha512-xFVuu11jh+xcO7JOAGJNOXld8/TcEHK/4CituBUeUb5hqxJLj9YuemAEuvm9gQ/+pgXYfbQuqAkiYu+u7YEsNA==}

  semver@7.7.2:
    resolution: {integrity: sha512-RF0Fw+rO5AMf9MAyaRXI4AV0Ulj5lMHqVxxdSgiVbixSCXoEmmX/jk0CuJw4+3SqroYO9VoUh+HcuJivvtJemA==}
    engines: {node: '>=10'}
    hasBin: true

  sharp@0.33.5:
    resolution: {integrity: sha512-haPVm1EkS9pgvHrQ/F3Xy+hgcuMV0Wm9vfIBSiwZ05k+xgb0PkBQpGsAA/oWdDobNaZTH5ppvHtzCFbnSEwHVw==}
    engines: {node: ^18.17.0 || ^20.3.0 || >=21.0.0}

  shebang-command@2.0.0:
    resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
    engines: {node: '>=8'}

  shebang-regex@3.0.0:
    resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
    engines: {node: '>=8'}

  signal-exit@4.1.0:
    resolution: {integrity: sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==}
    engines: {node: '>=14'}

  simple-swizzle@0.2.2:
    resolution: {integrity: sha512-JA//kQgZtbuY83m+xT+tXJkmJncGMTFT+C+g2h2R9uxkYIrE2yy9sgmcLhCnw57/WSD+Eh3J97FPEDFnbXnDUg==}

  sonner@1.7.1:
    resolution: {integrity: sha512-b6LHBfH32SoVasRFECrdY8p8s7hXPDn3OHUFbZZbiB1ctLS9Gdh6rpX2dVrpQA0kiL5jcRzDDldwwLkSKk3+QQ==}
    peerDependencies:
      react: ^18.0.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  source-map@0.6.1:
    resolution: {integrity: sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==}
    engines: {node: '>=0.10.0'}

  streamsearch@1.1.0:
    resolution: {integrity: sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==}
    engines: {node: '>=10.0.0'}

  string-width@4.2.3:
    resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
    engines: {node: '>=8'}

  string-width@5.1.2:
    resolution: {integrity: sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==}
    engines: {node: '>=12'}

  strip-ansi@6.0.1:
    resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
    engines: {node: '>=8'}

  strip-ansi@7.1.0:
    resolution: {integrity: sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==}
    engines: {node: '>=12'}

  styled-jsx@5.1.6:
    resolution: {integrity: sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==}
    engines: {node: '>= 12.0.0'}
    peerDependencies:
      '@babel/core': '*'
      babel-plugin-macros: '*'
      react: '>= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0'
    peerDependenciesMeta:
      '@babel/core':
        optional: true
      babel-plugin-macros:
        optional: true

  sucrase@3.35.0:
    resolution: {integrity: sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==}
    engines: {node: '>=16 || 14 >=14.17'}
    hasBin: true

  supports-preserve-symlinks-flag@1.0.0:
    resolution: {integrity: sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==}
    engines: {node: '>= 0.4'}

  tailwind-merge@2.5.5:
    resolution: {integrity: sha512-0LXunzzAZzo0tEPxV3I297ffKZPlKDrjj7NXphC8V5ak9yHC5zRmxnOe2m/Rd/7ivsOMJe3JZ2JVocoDdQTRBA==}

  tailwindcss-animate@1.0.7:
    resolution: {integrity: sha512-bl6mpH3T7I3UFxuvDEXLxy/VuFxBk5bbzplh7tXI68mwMokNYd1t9qPBHlnyTwfa4JGC4zP516I1hYYtQ/vspA==}
    peerDependencies:
      tailwindcss: '>=3.0.0 || insiders'

  tailwindcss@3.4.17:
    resolution: {integrity: sha512-w33E2aCvSDP0tW9RZuNXadXlkHXqFzSkQew/aIa2i/Sj8fThxwovwlXHSPXTbAHwEIhBFXAedUhP2tueAKP8Og==}
    engines: {node: '>=14.0.0'}
    hasBin: true

  thenify-all@1.6.0:
    resolution: {integrity: sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==}
    engines: {node: '>=0.8'}

  thenify@3.3.1:
    resolution: {integrity: sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==}

  tiny-invariant@1.3.3:
    resolution: {integrity: sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==}

  to-regex-range@5.0.1:
    resolution: {integrity: sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==}
    engines: {node: '>=8.0'}

  ts-interface-checker@0.1.13:
    resolution: {integrity: sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  typescript@5.0.2:
    resolution: {integrity: sha512-wVORMBGO/FAs/++blGNeAVdbNKtIh1rbBL2EyQ1+J9lClJ93KiiKe8PmFIVdXhHcyv44SL9oglmfeSsndo0jRw==}
    engines: {node: '>=12.20'}
    hasBin: true

  undici-types@6.11.1:
    resolution: {integrity: sha512-mIDEX2ek50x0OlRgxryxsenE5XaQD4on5U2inY7RApK3SOJpofyw7uW2AyfMKkhAxXIceo2DeWGVGwyvng1GNQ==}

  update-browserslist-db@1.1.3:
    resolution: {integrity: sha512-UxhIZQ+QInVdunkDAaiazvvT/+fXL5Osr0JZlJulepYu6Jd7qJtDZjlur0emRlT71EN3ScPoE7gvsuIKKNavKw==}
    hasBin: true
    peerDependencies:
      browserslist: '>= 4.21.0'

  use-callback-ref@1.3.3:
    resolution: {integrity: sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sidecar@1.1.3:
    resolution: {integrity: sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sync-external-store@1.5.0:
    resolution: {integrity: sha512-Rb46I4cGGVBmjamjphe8L/UnvJD+uPPtTkNvX5mZgqdbavhI4EbgIWJiIHXJ8bc/i9EQGPRh4DwEURJ552Do0A==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  util-deprecate@1.0.2:
    resolution: {integrity: sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==}

  uuid@8.3.2:
    resolution: {integrity: sha512-+NYs2QeMWy+GWFOEm9xnn6HCDp0l7QBD7ml8zLUmJ+93Q5NF0NocErnwkTkXVFNiX3/fpC6afS8Dhb/gz7R7eg==}
    hasBin: true

  vaul@0.9.6:
    resolution: {integrity: sha512-Ykk5FSu4ibeD6qfKQH/CkBRdSGWkxi35KMNei0z59kTPAlgzpE/Qf1gTx2sxih8Q05KBO/aFhcF/UkBW5iI1Ww==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0
      react-dom: ^16.8 || ^17.0 || ^18.0

  victory-vendor@36.9.2:
    resolution: {integrity: sha512-PnpQQMuxlwYdocC8fIJqVXvkeViHYzotI+NJrCuav0ZYFoq912ZHBk3mCeuj+5/VpodOjPe1z0Fk2ihgzlXqjQ==}

  which@2.0.2:
    resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
    engines: {node: '>= 8'}
    hasBin: true

  wrap-ansi@7.0.0:
    resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
    engines: {node: '>=10'}

  wrap-ansi@8.1.0:
    resolution: {integrity: sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==}
    engines: {node: '>=12'}

  yallist@4.0.0:
    resolution: {integrity: sha512-3wdGidZyq5PB084XLES5TpOSRA3wjXAlIWMhum2kRcv/41Sn2emQ0dycQW4uZXLejwKvg6EsvbdlVL+FYEct7A==}

  yaml@2.7.1:
    resolution: {integrity: sha512-10ULxpnOCQXxJvBgxsn9ptjq6uviG/htZKk9veJGhlqn3w/DxQ631zFF+nlQXLwmImeS5amR2dl2U8sg6U9jsQ==}
    engines: {node: '>= 14'}
    hasBin: true

  zod@3.24.4:
    resolution: {integrity: sha512-OdqJE9UDRPwWsrHjLN2F8bPxvwJBK22EHLWtanu0LSYr5YqzsaaW3RMgmjwr8Rypg5k+meEJdSPXJZXE/yqOMg==}

snapshots:

  '@alloc/quick-lru@5.2.0': {}

  '@auth/core@0.39.1(nodemailer@7.0.3)':
    dependencies:
      '@panva/hkdf': 1.2.1
      jose: 6.0.11
      oauth4webapi: 3.5.1
      preact: 10.24.3
      preact-render-to-string: 6.5.11(preact@10.24.3)
    optionalDependencies:
      nodemailer: 7.0.3

  '@babel/runtime@7.27.1': {}

  '@emnapi/runtime@1.4.3':
    dependencies:
      tslib: 2.8.1
    optional: true

  '@esbuild/aix-ppc64@0.25.4':
    optional: true

  '@esbuild/android-arm64@0.25.4':
    optional: true

  '@esbuild/android-arm@0.25.4':
    optional: true

  '@esbuild/android-x64@0.25.4':
    optional: true

  '@esbuild/darwin-arm64@0.25.4':
    optional: true

  '@esbuild/darwin-x64@0.25.4':
    optional: true

  '@esbuild/freebsd-arm64@0.25.4':
    optional: true

  '@esbuild/freebsd-x64@0.25.4':
    optional: true

  '@esbuild/linux-arm64@0.25.4':
    optional: true

  '@esbuild/linux-arm@0.25.4':
    optional: true

  '@esbuild/linux-ia32@0.25.4':
    optional: true

  '@esbuild/linux-loong64@0.25.4':
    optional: true

  '@esbuild/linux-mips64el@0.25.4':
    optional: true

  '@esbuild/linux-ppc64@0.25.4':
    optional: true

  '@esbuild/linux-riscv64@0.25.4':
    optional: true

  '@esbuild/linux-s390x@0.25.4':
    optional: true

  '@esbuild/linux-x64@0.25.4':
    optional: true

  '@esbuild/netbsd-arm64@0.25.4':
    optional: true

  '@esbuild/netbsd-x64@0.25.4':
    optional: true

  '@esbuild/openbsd-arm64@0.25.4':
    optional: true

  '@esbuild/openbsd-x64@0.25.4':
    optional: true

  '@esbuild/sunos-x64@0.25.4':
    optional: true

  '@esbuild/win32-arm64@0.25.4':
    optional: true

  '@esbuild/win32-ia32@0.25.4':
    optional: true

  '@esbuild/win32-x64@0.25.4':
    optional: true

  '@floating-ui/core@1.7.0':
    dependencies:
      '@floating-ui/utils': 0.2.9

  '@floating-ui/dom@1.7.0':
    dependencies:
      '@floating-ui/core': 1.7.0
      '@floating-ui/utils': 0.2.9

  '@floating-ui/react-dom@2.1.2(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@floating-ui/dom': 1.7.0
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  '@floating-ui/utils@0.2.9': {}

  '@hookform/resolvers@3.9.1(react-hook-form@7.54.1(react@19.0.0))':
    dependencies:
      react-hook-form: 7.54.1(react@19.0.0)

  '@img/sharp-darwin-arm64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-darwin-arm64': 1.0.4
    optional: true

  '@img/sharp-darwin-x64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-darwin-x64': 1.0.4
    optional: true

  '@img/sharp-libvips-darwin-arm64@1.0.4':
    optional: true

  '@img/sharp-libvips-darwin-x64@1.0.4':
    optional: true

  '@img/sharp-libvips-linux-arm64@1.0.4':
    optional: true

  '@img/sharp-libvips-linux-arm@1.0.5':
    optional: true

  '@img/sharp-libvips-linux-s390x@1.0.4':
    optional: true

  '@img/sharp-libvips-linux-x64@1.0.4':
    optional: true

  '@img/sharp-libvips-linuxmusl-arm64@1.0.4':
    optional: true

  '@img/sharp-libvips-linuxmusl-x64@1.0.4':
    optional: true

  '@img/sharp-linux-arm64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linux-arm64': 1.0.4
    optional: true

  '@img/sharp-linux-arm@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linux-arm': 1.0.5
    optional: true

  '@img/sharp-linux-s390x@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linux-s390x': 1.0.4
    optional: true

  '@img/sharp-linux-x64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linux-x64': 1.0.4
    optional: true

  '@img/sharp-linuxmusl-arm64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linuxmusl-arm64': 1.0.4
    optional: true

  '@img/sharp-linuxmusl-x64@0.33.5':
    optionalDependencies:
      '@img/sharp-libvips-linuxmusl-x64': 1.0.4
    optional: true

  '@img/sharp-wasm32@0.33.5':
    dependencies:
      '@emnapi/runtime': 1.4.3
    optional: true

  '@img/sharp-win32-ia32@0.33.5':
    optional: true

  '@img/sharp-win32-x64@0.33.5':
    optional: true

  '@isaacs/cliui@8.0.2':
    dependencies:
      string-width: 5.1.2
      string-width-cjs: string-width@4.2.3
      strip-ansi: 7.1.0
      strip-ansi-cjs: strip-ansi@6.0.1
      wrap-ansi: 8.1.0
      wrap-ansi-cjs: wrap-ansi@7.0.0

  '@jridgewell/gen-mapping@0.3.8':
    dependencies:
      '@jridgewell/set-array': 1.2.1
      '@jridgewell/sourcemap-codec': 1.5.0
      '@jridgewell/trace-mapping': 0.3.25

  '@jridgewell/resolve-uri@3.1.2': {}

  '@jridgewell/set-array@1.2.1': {}

  '@jridgewell/sourcemap-codec@1.5.0': {}

  '@jridgewell/trace-mapping@0.3.25':
    dependencies:
      '@jridgewell/resolve-uri': 3.1.2
      '@jridgewell/sourcemap-codec': 1.5.0

  '@next-auth/prisma-adapter@1.0.7(@prisma/client@6.7.0(prisma@6.7.0(typescript@5.0.2))(typescript@5.0.2))(next-auth@4.24.11(@auth/core@0.39.1(nodemailer@7.0.3))(next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0))(nodemailer@7.0.3)(react-dom@19.0.0(react@19.0.0))(react@19.0.0))':
    dependencies:
      '@prisma/client': 6.7.0(prisma@6.7.0(typescript@5.0.2))(typescript@5.0.2)
      next-auth: 4.24.11(@auth/core@0.39.1(nodemailer@7.0.3))(next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0))(nodemailer@7.0.3)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)

  '@next/env@15.2.4': {}

  '@next/swc-darwin-arm64@15.2.4':
    optional: true

  '@next/swc-darwin-x64@15.2.4':
    optional: true

  '@next/swc-linux-arm64-gnu@15.2.4':
    optional: true

  '@next/swc-linux-arm64-musl@15.2.4':
    optional: true

  '@next/swc-linux-x64-gnu@15.2.4':
    optional: true

  '@next/swc-linux-x64-musl@15.2.4':
    optional: true

  '@next/swc-win32-arm64-msvc@15.2.4':
    optional: true

  '@next/swc-win32-x64-msvc@15.2.4':
    optional: true

  '@nodelib/fs.scandir@2.1.5':
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      run-parallel: 1.2.0

  '@nodelib/fs.stat@2.0.5': {}

  '@nodelib/fs.walk@1.2.8':
    dependencies:
      '@nodelib/fs.scandir': 2.1.5
      fastq: 1.19.1

  '@panva/hkdf@1.2.1': {}

  '@pkgjs/parseargs@0.11.0':
    optional: true

  '@prisma/client@6.7.0(prisma@6.7.0(typescript@5.0.2))(typescript@5.0.2)':
    optionalDependencies:
      prisma: 6.7.0(typescript@5.0.2)
      typescript: 5.0.2

  '@prisma/config@6.7.0':
    dependencies:
      esbuild: 0.25.4
      esbuild-register: 3.6.0(esbuild@0.25.4)
    transitivePeerDependencies:
      - supports-color

  '@prisma/debug@6.7.0': {}

  '@prisma/engines-version@6.7.0-36.3cff47a7f5d65c3ea74883f1d736e41d68ce91ed': {}

  '@prisma/engines@6.7.0':
    dependencies:
      '@prisma/debug': 6.7.0
      '@prisma/engines-version': 6.7.0-36.3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
      '@prisma/fetch-engine': 6.7.0
      '@prisma/get-platform': 6.7.0

  '@prisma/fetch-engine@6.7.0':
    dependencies:
      '@prisma/debug': 6.7.0
      '@prisma/engines-version': 6.7.0-36.3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
      '@prisma/get-platform': 6.7.0

  '@prisma/get-platform@6.7.0':
    dependencies:
      '@prisma/debug': 6.7.0

  '@radix-ui/number@1.1.0': {}

  '@radix-ui/primitive@1.1.1': {}

  '@radix-ui/react-accordion@1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collapsible': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-alert-dialog@1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dialog': 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-arrow@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-aspect-ratio@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-avatar@1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-checkbox@1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-size': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-collapsible@1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-collection@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-compose-refs@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-compose-refs@1.1.2(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-context-menu@2.2.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-menu': 2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-context@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-dialog@1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-focus-guards': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-focus-scope': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      aria-hidden: 1.2.4
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-remove-scroll: 2.6.3(@types/react@19.0.0)(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-direction@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-dismissable-layer@1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-escape-keydown': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-dropdown-menu@2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-menu': 2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-focus-guards@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-focus-scope@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-hover-card@1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-popper': 1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-id@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-id@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-label@2.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-menu@2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-focus-guards': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-focus-scope': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-popper': 1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-roving-focus': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      aria-hidden: 1.2.4
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-remove-scroll: 2.6.3(@types/react@19.0.0)(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-menubar@1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-menu': 2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-roving-focus': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-navigation-menu@1.2.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-visually-hidden': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-popover@1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-focus-guards': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-focus-scope': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-popper': 1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      aria-hidden: 1.2.4
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-remove-scroll: 2.6.3(@types/react@19.0.0)(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-popper@1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@floating-ui/react-dom': 2.1.2(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-arrow': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-rect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-size': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/rect': 1.1.0
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-portal@1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-presence@1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-primitive@2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-primitive@2.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-slot': 1.2.2(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-progress@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-radio-group@1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-roving-focus': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-size': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-roving-focus@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-scroll-area@1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/number': 1.1.0
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-select@2.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/number': 1.1.0
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-focus-guards': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-focus-scope': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-popper': 1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-visually-hidden': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      aria-hidden: 1.2.4
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-remove-scroll: 2.6.3(@types/react@19.0.0)(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-separator@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-slider@1.2.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/number': 1.1.0
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-size': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-slot@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-slot@1.2.2(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.2(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-switch@1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-previous': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-size': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-tabs@1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-roving-focus': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-toast@1.2.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-collection': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-visually-hidden': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-toggle-group@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-direction': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-roving-focus': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-toggle': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-toggle@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-tooltip@1.1.6(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.1
      '@radix-ui/react-compose-refs': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-context': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-dismissable-layer': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-popper': 1.2.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-portal': 1.1.3(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-presence': 1.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-slot': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-use-controllable-state': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-visually-hidden': 1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/react-use-callback-ref@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-controllable-state@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-escape-keydown@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-use-callback-ref': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-layout-effect@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-layout-effect@1.1.1(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-previous@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-rect@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/rect': 1.1.0
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-use-size@1.1.0(@types/react@19.0.0)(react@19.0.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.0(@types/react@19.0.0)(react@19.0.0)
      react: 19.0.0
    optionalDependencies:
      '@types/react': 19.0.0

  '@radix-ui/react-visually-hidden@1.1.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.0.1(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0
      '@types/react-dom': 19.0.0

  '@radix-ui/rect@1.1.0': {}

  '@swc/counter@0.1.3': {}

  '@swc/helpers@0.5.15':
    dependencies:
      tslib: 2.8.1

  '@types/d3-array@3.2.1': {}

  '@types/d3-color@3.1.3': {}

  '@types/d3-ease@3.0.2': {}

  '@types/d3-interpolate@3.0.4':
    dependencies:
      '@types/d3-color': 3.1.3

  '@types/d3-path@3.1.1': {}

  '@types/d3-scale@4.0.9':
    dependencies:
      '@types/d3-time': 3.0.4

  '@types/d3-shape@3.1.7':
    dependencies:
      '@types/d3-path': 3.1.1

  '@types/d3-time@3.0.4': {}

  '@types/d3-timer@3.0.2': {}

  '@types/node@22.0.0':
    dependencies:
      undici-types: 6.11.1

  '@types/react-dom@19.0.0':
    dependencies:
      '@types/react': 19.0.0

  '@types/react@19.0.0':
    dependencies:
      csstype: 3.1.3

  '@upstash/redis@1.34.9':
    dependencies:
      crypto-js: 4.2.0

  ansi-regex@5.0.1: {}

  ansi-regex@6.1.0: {}

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  ansi-styles@6.2.1: {}

  any-promise@1.3.0: {}

  anymatch@3.1.3:
    dependencies:
      normalize-path: 3.0.0
      picomatch: 2.3.1

  arg@5.0.2: {}

  aria-hidden@1.2.4:
    dependencies:
      tslib: 2.8.1

  autoprefixer@10.4.20(postcss@8.0.0):
    dependencies:
      browserslist: 4.24.5
      caniuse-lite: 1.0.30001717
      fraction.js: 4.3.7
      normalize-range: 0.1.2
      picocolors: 1.1.1
      postcss: 8.0.0
      postcss-value-parser: 4.2.0

  balanced-match@1.0.2: {}

  bcryptjs@3.0.2: {}

  binary-extensions@2.3.0: {}

  brace-expansion@2.0.1:
    dependencies:
      balanced-match: 1.0.2

  braces@3.0.3:
    dependencies:
      fill-range: 7.1.1

  browserslist@4.24.5:
    dependencies:
      caniuse-lite: 1.0.30001717
      electron-to-chromium: 1.5.151
      node-releases: 2.0.19
      update-browserslist-db: 1.1.3(browserslist@4.24.5)

  busboy@1.6.0:
    dependencies:
      streamsearch: 1.1.0

  camelcase-css@2.0.1: {}

  caniuse-lite@1.0.30001717: {}

  chokidar@3.6.0:
    dependencies:
      anymatch: 3.1.3
      braces: 3.0.3
      glob-parent: 5.1.2
      is-binary-path: 2.1.0
      is-glob: 4.0.3
      normalize-path: 3.0.0
      readdirp: 3.6.0
    optionalDependencies:
      fsevents: 2.3.3

  class-variance-authority@0.7.1:
    dependencies:
      clsx: 2.1.1

  client-only@0.0.1: {}

  clsx@2.1.1: {}

  cmdk@1.0.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      '@radix-ui/react-dialog': 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      '@radix-ui/react-id': 1.1.1(@types/react@19.0.0)(react@19.0.0)
      '@radix-ui/react-primitive': 2.1.2(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      use-sync-external-store: 1.5.0(react@19.0.0)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  color-string@1.9.1:
    dependencies:
      color-name: 1.1.4
      simple-swizzle: 0.2.2
    optional: true

  color@4.2.3:
    dependencies:
      color-convert: 2.0.1
      color-string: 1.9.1
    optional: true

  colorette@1.4.0: {}

  commander@4.1.1: {}

  cookie@0.7.2: {}

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  crypto-js@4.2.0: {}

  cssesc@3.0.0: {}

  csstype@3.1.3: {}

  d3-array@3.2.4:
    dependencies:
      internmap: 2.0.3

  d3-color@3.1.0: {}

  d3-ease@3.0.1: {}

  d3-format@3.1.0: {}

  d3-interpolate@3.0.1:
    dependencies:
      d3-color: 3.1.0

  d3-path@3.1.0: {}

  d3-scale@4.0.2:
    dependencies:
      d3-array: 3.2.4
      d3-format: 3.1.0
      d3-interpolate: 3.0.1
      d3-time: 3.1.0
      d3-time-format: 4.1.0

  d3-shape@3.2.0:
    dependencies:
      d3-path: 3.1.0

  d3-time-format@4.1.0:
    dependencies:
      d3-time: 3.1.0

  d3-time@3.1.0:
    dependencies:
      d3-array: 3.2.4

  d3-timer@3.0.1: {}

  date-fns@4.1.0: {}

  debug@4.4.0:
    dependencies:
      ms: 2.1.3

  decimal.js-light@2.5.1: {}

  detect-libc@2.0.4:
    optional: true

  detect-node-es@1.1.0: {}

  didyoumean@1.2.2: {}

  dlv@1.1.3: {}

  dom-helpers@5.2.1:
    dependencies:
      '@babel/runtime': 7.27.1
      csstype: 3.1.3

  eastasianwidth@0.2.0: {}

  electron-to-chromium@1.5.151: {}

  embla-carousel-react@8.5.1(react@19.0.0):
    dependencies:
      embla-carousel: 8.5.1
      embla-carousel-reactive-utils: 8.5.1(embla-carousel@8.5.1)
      react: 19.0.0

  embla-carousel-reactive-utils@8.5.1(embla-carousel@8.5.1):
    dependencies:
      embla-carousel: 8.5.1

  embla-carousel@8.5.1: {}

  emoji-regex@8.0.0: {}

  emoji-regex@9.2.2: {}

  esbuild-register@3.6.0(esbuild@0.25.4):
    dependencies:
      debug: 4.4.0
      esbuild: 0.25.4
    transitivePeerDependencies:
      - supports-color

  esbuild@0.25.4:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.25.4
      '@esbuild/android-arm': 0.25.4
      '@esbuild/android-arm64': 0.25.4
      '@esbuild/android-x64': 0.25.4
      '@esbuild/darwin-arm64': 0.25.4
      '@esbuild/darwin-x64': 0.25.4
      '@esbuild/freebsd-arm64': 0.25.4
      '@esbuild/freebsd-x64': 0.25.4
      '@esbuild/linux-arm': 0.25.4
      '@esbuild/linux-arm64': 0.25.4
      '@esbuild/linux-ia32': 0.25.4
      '@esbuild/linux-loong64': 0.25.4
      '@esbuild/linux-mips64el': 0.25.4
      '@esbuild/linux-ppc64': 0.25.4
      '@esbuild/linux-riscv64': 0.25.4
      '@esbuild/linux-s390x': 0.25.4
      '@esbuild/linux-x64': 0.25.4
      '@esbuild/netbsd-arm64': 0.25.4
      '@esbuild/netbsd-x64': 0.25.4
      '@esbuild/openbsd-arm64': 0.25.4
      '@esbuild/openbsd-x64': 0.25.4
      '@esbuild/sunos-x64': 0.25.4
      '@esbuild/win32-arm64': 0.25.4
      '@esbuild/win32-ia32': 0.25.4
      '@esbuild/win32-x64': 0.25.4

  escalade@3.2.0: {}

  eventemitter3@4.0.7: {}

  fast-equals@5.2.2: {}

  fast-glob@3.3.3:
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      '@nodelib/fs.walk': 1.2.8
      glob-parent: 5.1.2
      merge2: 1.4.1
      micromatch: 4.0.8

  fastq@1.19.1:
    dependencies:
      reusify: 1.1.0

  fill-range@7.1.1:
    dependencies:
      to-regex-range: 5.0.1

  foreground-child@3.3.1:
    dependencies:
      cross-spawn: 7.0.6
      signal-exit: 4.1.0

  fraction.js@4.3.7: {}

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  get-nonce@1.0.1: {}

  glob-parent@5.1.2:
    dependencies:
      is-glob: 4.0.3

  glob-parent@6.0.2:
    dependencies:
      is-glob: 4.0.3

  glob@10.4.5:
    dependencies:
      foreground-child: 3.3.1
      jackspeak: 3.4.3
      minimatch: 9.0.5
      minipass: 7.1.2
      package-json-from-dist: 1.0.1
      path-scurry: 1.11.1

  hasown@2.0.2:
    dependencies:
      function-bind: 1.1.2

  input-otp@1.4.1(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  internmap@2.0.3: {}

  is-arrayish@0.3.2:
    optional: true

  is-binary-path@2.1.0:
    dependencies:
      binary-extensions: 2.3.0

  is-core-module@2.16.1:
    dependencies:
      hasown: 2.0.2

  is-extglob@2.1.1: {}

  is-fullwidth-code-point@3.0.0: {}

  is-glob@4.0.3:
    dependencies:
      is-extglob: 2.1.1

  is-number@7.0.0: {}

  isarray@1.0.0: {}

  isexe@2.0.0: {}

  isobject@2.1.0:
    dependencies:
      isarray: 1.0.0

  jackspeak@3.4.3:
    dependencies:
      '@isaacs/cliui': 8.0.2
    optionalDependencies:
      '@pkgjs/parseargs': 0.11.0

  jiti@1.21.7: {}

  jose@4.15.9: {}

  jose@6.0.11: {}

  js-tokens@4.0.0: {}

  lilconfig@3.1.3: {}

  line-column@1.0.2:
    dependencies:
      isarray: 1.0.0
      isobject: 2.1.0

  lines-and-columns@1.2.4: {}

  lodash@4.17.21: {}

  loose-envify@1.4.0:
    dependencies:
      js-tokens: 4.0.0

  lru-cache@10.4.3: {}

  lru-cache@6.0.0:
    dependencies:
      yallist: 4.0.0

  lucide-react@0.454.0(react@19.0.0):
    dependencies:
      react: 19.0.0

  merge2@1.4.1: {}

  micromatch@4.0.8:
    dependencies:
      braces: 3.0.3
      picomatch: 2.3.1

  minimatch@9.0.5:
    dependencies:
      brace-expansion: 2.0.1

  minipass@7.1.2: {}

  ms@2.1.3: {}

  mz@2.7.0:
    dependencies:
      any-promise: 1.3.0
      object-assign: 4.1.1
      thenify-all: 1.6.0

  nanoid@3.3.11: {}

  next-auth@4.24.11(@auth/core@0.39.1(nodemailer@7.0.3))(next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0))(nodemailer@7.0.3)(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      '@babel/runtime': 7.27.1
      '@panva/hkdf': 1.2.1
      cookie: 0.7.2
      jose: 4.15.9
      next: 15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      oauth: 0.9.15
      openid-client: 5.7.1
      preact: 10.26.6
      preact-render-to-string: 5.2.6(preact@10.26.6)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      uuid: 8.3.2
    optionalDependencies:
      '@auth/core': 0.39.1(nodemailer@7.0.3)
      nodemailer: 7.0.3

  next-themes@0.4.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  next@15.2.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      '@next/env': 15.2.4
      '@swc/counter': 0.1.3
      '@swc/helpers': 0.5.15
      busboy: 1.6.0
      caniuse-lite: 1.0.30001717
      postcss: 8.4.31
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      styled-jsx: 5.1.6(react@19.0.0)
    optionalDependencies:
      '@next/swc-darwin-arm64': 15.2.4
      '@next/swc-darwin-x64': 15.2.4
      '@next/swc-linux-arm64-gnu': 15.2.4
      '@next/swc-linux-arm64-musl': 15.2.4
      '@next/swc-linux-x64-gnu': 15.2.4
      '@next/swc-linux-x64-musl': 15.2.4
      '@next/swc-win32-arm64-msvc': 15.2.4
      '@next/swc-win32-x64-msvc': 15.2.4
      sharp: 0.33.5
    transitivePeerDependencies:
      - '@babel/core'
      - babel-plugin-macros

  node-releases@2.0.19: {}

  nodemailer@7.0.3: {}

  normalize-path@3.0.0: {}

  normalize-range@0.1.2: {}

  oauth4webapi@3.5.1: {}

  oauth@0.9.15: {}

  object-assign@4.1.1: {}

  object-hash@2.2.0: {}

  object-hash@3.0.0: {}

  oidc-token-hash@5.1.0: {}

  openid-client@5.7.1:
    dependencies:
      jose: 4.15.9
      lru-cache: 6.0.0
      object-hash: 2.2.0
      oidc-token-hash: 5.1.0

  package-json-from-dist@1.0.1: {}

  path-key@3.1.1: {}

  path-parse@1.0.7: {}

  path-scurry@1.11.1:
    dependencies:
      lru-cache: 10.4.3
      minipass: 7.1.2

  picocolors@1.1.1: {}

  picomatch@2.3.1: {}

  pify@2.3.0: {}

  pirates@4.0.7: {}

  postcss-import@15.1.0(postcss@8.5.3):
    dependencies:
      postcss: 8.5.3
      postcss-value-parser: 4.2.0
      read-cache: 1.0.0
      resolve: 1.22.10

  postcss-js@4.0.1(postcss@8.5.3):
    dependencies:
      camelcase-css: 2.0.1
      postcss: 8.5.3

  postcss-load-config@4.0.2(postcss@8.5.3):
    dependencies:
      lilconfig: 3.1.3
      yaml: 2.7.1
    optionalDependencies:
      postcss: 8.5.3

  postcss-nested@6.2.0(postcss@8.5.3):
    dependencies:
      postcss: 8.5.3
      postcss-selector-parser: 6.1.2

  postcss-selector-parser@6.1.2:
    dependencies:
      cssesc: 3.0.0
      util-deprecate: 1.0.2

  postcss-value-parser@4.2.0: {}

  postcss@8.0.0:
    dependencies:
      colorette: 1.4.0
      line-column: 1.0.2
      nanoid: 3.3.11
      source-map: 0.6.1

  postcss@8.4.31:
    dependencies:
      nanoid: 3.3.11
      picocolors: 1.1.1
      source-map-js: 1.2.1

  postcss@8.5.3:
    dependencies:
      nanoid: 3.3.11
      picocolors: 1.1.1
      source-map-js: 1.2.1

  preact-render-to-string@5.2.6(preact@10.26.6):
    dependencies:
      preact: 10.26.6
      pretty-format: 3.8.0

  preact-render-to-string@6.5.11(preact@10.24.3):
    dependencies:
      preact: 10.24.3

  preact@10.24.3: {}

  preact@10.26.6: {}

  pretty-format@3.8.0: {}

  prisma@6.7.0(typescript@5.0.2):
    dependencies:
      '@prisma/config': 6.7.0
      '@prisma/engines': 6.7.0
    optionalDependencies:
      fsevents: 2.3.3
      typescript: 5.0.2
    transitivePeerDependencies:
      - supports-color

  prop-types@15.8.1:
    dependencies:
      loose-envify: 1.4.0
      object-assign: 4.1.1
      react-is: 16.13.1

  queue-microtask@1.2.3: {}

  react-day-picker@8.10.1(date-fns@4.1.0)(react@19.0.0):
    dependencies:
      date-fns: 4.1.0
      react: 19.0.0

  react-dom@19.0.0(react@19.0.0):
    dependencies:
      react: 19.0.0
      scheduler: 0.25.0

  react-hook-form@7.54.1(react@19.0.0):
    dependencies:
      react: 19.0.0

  react-is@16.13.1: {}

  react-is@18.3.1: {}

  react-remove-scroll-bar@2.3.8(@types/react@19.0.0)(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-style-singleton: 2.2.3(@types/react@19.0.0)(react@19.0.0)
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.0.0

  react-remove-scroll@2.6.3(@types/react@19.0.0)(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-remove-scroll-bar: 2.3.8(@types/react@19.0.0)(react@19.0.0)
      react-style-singleton: 2.2.3(@types/react@19.0.0)(react@19.0.0)
      tslib: 2.8.1
      use-callback-ref: 1.3.3(@types/react@19.0.0)(react@19.0.0)
      use-sidecar: 1.1.3(@types/react@19.0.0)(react@19.0.0)
    optionalDependencies:
      '@types/react': 19.0.0

  react-resizable-panels@2.1.7(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  react-smooth@4.0.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      fast-equals: 5.2.2
      prop-types: 15.8.1
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-transition-group: 4.4.5(react-dom@19.0.0(react@19.0.0))(react@19.0.0)

  react-style-singleton@2.2.3(@types/react@19.0.0)(react@19.0.0):
    dependencies:
      get-nonce: 1.0.1
      react: 19.0.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.0.0

  react-transition-group@4.4.5(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      '@babel/runtime': 7.27.1
      dom-helpers: 5.2.1
      loose-envify: 1.4.0
      prop-types: 15.8.1
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  react@19.0.0: {}

  read-cache@1.0.0:
    dependencies:
      pify: 2.3.0

  readdirp@3.6.0:
    dependencies:
      picomatch: 2.3.1

  recharts-scale@0.4.5:
    dependencies:
      decimal.js-light: 2.5.1

  recharts@2.15.0(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      clsx: 2.1.1
      eventemitter3: 4.0.7
      lodash: 4.17.21
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
      react-is: 18.3.1
      react-smooth: 4.0.4(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      recharts-scale: 0.4.5
      tiny-invariant: 1.3.3
      victory-vendor: 36.9.2

  resolve@1.22.10:
    dependencies:
      is-core-module: 2.16.1
      path-parse: 1.0.7
      supports-preserve-symlinks-flag: 1.0.0

  reusify@1.1.0: {}

  run-parallel@1.2.0:
    dependencies:
      queue-microtask: 1.2.3

  scheduler@0.25.0: {}

  semver@7.7.2:
    optional: true

  sharp@0.33.5:
    dependencies:
      color: 4.2.3
      detect-libc: 2.0.4
      semver: 7.7.2
    optionalDependencies:
      '@img/sharp-darwin-arm64': 0.33.5
      '@img/sharp-darwin-x64': 0.33.5
      '@img/sharp-libvips-darwin-arm64': 1.0.4
      '@img/sharp-libvips-darwin-x64': 1.0.4
      '@img/sharp-libvips-linux-arm': 1.0.5
      '@img/sharp-libvips-linux-arm64': 1.0.4
      '@img/sharp-libvips-linux-s390x': 1.0.4
      '@img/sharp-libvips-linux-x64': 1.0.4
      '@img/sharp-libvips-linuxmusl-arm64': 1.0.4
      '@img/sharp-libvips-linuxmusl-x64': 1.0.4
      '@img/sharp-linux-arm': 0.33.5
      '@img/sharp-linux-arm64': 0.33.5
      '@img/sharp-linux-s390x': 0.33.5
      '@img/sharp-linux-x64': 0.33.5
      '@img/sharp-linuxmusl-arm64': 0.33.5
      '@img/sharp-linuxmusl-x64': 0.33.5
      '@img/sharp-wasm32': 0.33.5
      '@img/sharp-win32-ia32': 0.33.5
      '@img/sharp-win32-x64': 0.33.5
    optional: true

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  signal-exit@4.1.0: {}

  simple-swizzle@0.2.2:
    dependencies:
      is-arrayish: 0.3.2
    optional: true

  sonner@1.7.1(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)

  source-map-js@1.2.1: {}

  source-map@0.6.1: {}

  streamsearch@1.1.0: {}

  string-width@4.2.3:
    dependencies:
      emoji-regex: 8.0.0
      is-fullwidth-code-point: 3.0.0
      strip-ansi: 6.0.1

  string-width@5.1.2:
    dependencies:
      eastasianwidth: 0.2.0
      emoji-regex: 9.2.2
      strip-ansi: 7.1.0

  strip-ansi@6.0.1:
    dependencies:
      ansi-regex: 5.0.1

  strip-ansi@7.1.0:
    dependencies:
      ansi-regex: 6.1.0

  styled-jsx@5.1.6(react@19.0.0):
    dependencies:
      client-only: 0.0.1
      react: 19.0.0

  sucrase@3.35.0:
    dependencies:
      '@jridgewell/gen-mapping': 0.3.8
      commander: 4.1.1
      glob: 10.4.5
      lines-and-columns: 1.2.4
      mz: 2.7.0
      pirates: 4.0.7
      ts-interface-checker: 0.1.13

  supports-preserve-symlinks-flag@1.0.0: {}

  tailwind-merge@2.5.5: {}

  tailwindcss-animate@1.0.7(tailwindcss@3.4.17):
    dependencies:
      tailwindcss: 3.4.17

  tailwindcss@3.4.17:
    dependencies:
      '@alloc/quick-lru': 5.2.0
      arg: 5.0.2
      chokidar: 3.6.0
      didyoumean: 1.2.2
      dlv: 1.1.3
      fast-glob: 3.3.3
      glob-parent: 6.0.2
      is-glob: 4.0.3
      jiti: 1.21.7
      lilconfig: 3.1.3
      micromatch: 4.0.8
      normalize-path: 3.0.0
      object-hash: 3.0.0
      picocolors: 1.1.1
      postcss: 8.5.3
      postcss-import: 15.1.0(postcss@8.5.3)
      postcss-js: 4.0.1(postcss@8.5.3)
      postcss-load-config: 4.0.2(postcss@8.5.3)
      postcss-nested: 6.2.0(postcss@8.5.3)
      postcss-selector-parser: 6.1.2
      resolve: 1.22.10
      sucrase: 3.35.0
    transitivePeerDependencies:
      - ts-node

  thenify-all@1.6.0:
    dependencies:
      thenify: 3.3.1

  thenify@3.3.1:
    dependencies:
      any-promise: 1.3.0

  tiny-invariant@1.3.3: {}

  to-regex-range@5.0.1:
    dependencies:
      is-number: 7.0.0

  ts-interface-checker@0.1.13: {}

  tslib@2.8.1: {}

  typescript@5.0.2: {}

  undici-types@6.11.1: {}

  update-browserslist-db@1.1.3(browserslist@4.24.5):
    dependencies:
      browserslist: 4.24.5
      escalade: 3.2.0
      picocolors: 1.1.1

  use-callback-ref@1.3.3(@types/react@19.0.0)(react@19.0.0):
    dependencies:
      react: 19.0.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.0.0

  use-sidecar@1.1.3(@types/react@19.0.0)(react@19.0.0):
    dependencies:
      detect-node-es: 1.1.0
      react: 19.0.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.0.0

  use-sync-external-store@1.5.0(react@19.0.0):
    dependencies:
      react: 19.0.0

  util-deprecate@1.0.2: {}

  uuid@8.3.2: {}

  vaul@0.9.6(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0):
    dependencies:
      '@radix-ui/react-dialog': 1.1.4(@types/react-dom@19.0.0)(@types/react@19.0.0)(react-dom@19.0.0(react@19.0.0))(react@19.0.0)
      react: 19.0.0
      react-dom: 19.0.0(react@19.0.0)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  victory-vendor@36.9.2:
    dependencies:
      '@types/d3-array': 3.2.1
      '@types/d3-ease': 3.0.2
      '@types/d3-interpolate': 3.0.4
      '@types/d3-scale': 4.0.9
      '@types/d3-shape': 3.1.7
      '@types/d3-time': 3.0.4
      '@types/d3-timer': 3.0.2
      d3-array: 3.2.4
      d3-ease: 3.0.1
      d3-interpolate: 3.0.1
      d3-scale: 4.0.2
      d3-shape: 3.2.0
      d3-time: 3.1.0
      d3-timer: 3.0.1

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  wrap-ansi@7.0.0:
    dependencies:
      ansi-styles: 4.3.0
      string-width: 4.2.3
      strip-ansi: 6.0.1

  wrap-ansi@8.1.0:
    dependencies:
      ansi-styles: 6.2.1
      string-width: 5.1.2
      strip-ansi: 7.1.0

  yallist@4.0.0: {}

  yaml@2.7.1: {}

  zod@3.24.4: {}
```
## File: middleware.ts
```typescript
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// Add routes that require authentication
const protectedRoutes = ["/prepare", "/interview", "/feedback", "/profile", "/settings"]

// Add routes that should be accessible only when not authenticated
const authRoutes = ["/login", "/register"]

// Add routes that should be accessible without authentication
const publicRoutes = ["/", "/privacy", "/terms"]

// Add diagnostic routes that should be accessible in development
const diagnosticRoutes = ["/diagnostics", "/mock-auth"]

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Check if the route is a diagnostic route
  const isDiagnosticRoute = diagnosticRoutes.some((route) => pathname.startsWith(route))

  // Allow access to diagnostic routes in development
  if (isDiagnosticRoute && process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If the route is an auth route and the user is authenticated, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Allow access to API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
```
## File: postcss.config.mjs
```
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```
## File: next.config.mjs
```
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```
## File: README.md
```markdown
# Vocahire

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/profusionais-projects/v0-vocahire)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/WTBvruYOwzR)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/profusionais-projects/v0-vocahire](https://vercel.com/profusionais-projects/v0-vocahire)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/WTBvruYOwzR](https://v0.dev/chat/projects/WTBvruYOwzR)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
```
## File: tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        h1: ['3rem', { lineHeight: '1.2' }],   // 48px, bold
        h2: ['2rem', { lineHeight: '1.3' }],   // 32px, semibold
        h3: ['1.5rem', { lineHeight: '1.4' }], // 24px, medium
        base: ['1rem', { lineHeight: '1.6' }], // 16px, regular
        sm: ['0.875rem', { lineHeight: '1.5' }], // 14px, regular
      },
      lineHeight: {
        normal: '1.5',
        relaxed: '1.7',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```
## File: .gitignore
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```
## File: package.json
```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@auth/core": "latest",
    "@hookform/resolvers": "^3.9.1",
    "@next-auth/prisma-adapter": "latest",
    "@prisma/client": "latest",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "@upstash/redis": "latest",
    "autoprefixer": "^10.4.20",
    "bcryptjs": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "15.2.4",
    "next-auth": "latest",
    "next-themes": "^0.4.4",
    "nodemailer": "latest",
    "prisma": "latest",
    "react": "^19",
    "react-day-picker": "8.10.1",
    "react-dom": "^19",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```
## File: components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```
## File: tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
## File: app/layout.tsx
```
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
```
## File: app/page.tsx
```
'use client' // Needed for useEffect for smooth scrolling and for Simulation component interactivity

import React, { useEffect } from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import Simulation from '@/components/landing/Simulation'
import FeedbackSection from '@/components/landing/FeedbackSection'
import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Cleanup event listeners on component unmount
    return () => {
      anchors.forEach(anchor => {
        // It's tricky to remove the exact same event listener function reference here
        // without storing them. For this scope, if re-renders are minimal,
        // it might be acceptable. A more robust solution would store listener refs.
        // Or, rely on modern browsers to GC listeners on unmounted elements if anchors are within this component.
        // For simplicity now, not removing, but be aware for complex apps.
      });
    };
  }, []);

  return (
    <div className="bg-gray-50"> {/* Matching body bg from original splashpage.html */}
      <Navbar />
      <main>
        {/* Hero, Features, and Testimonials were originally under a single section#home.
            The .section class (min-height: 100vh, padding: 2rem 0) is applied by individual components if needed,
            or globally to <section> tags if they use that class.
            The Hero component already includes <section id="home">.
            The other components (Features, Testimonials, etc.) also define their own <section> or <div> root.
            The .section class from globals.css provides min-height and vertical padding.
        */}
        <Hero /> {/* Contains its own <section id="home"> and initial content */}
        <Features /> {/* This was nested in original #home, now separate component with its own styling */}
        <Testimonials /> {/* Also nested, now separate */}
        
        {/* These components correspond to the other top-level sections from splashpage.html */}
        <Simulation /> {/* Contains <section id="simulation"> */}
        <FeedbackSection /> {/* Contains <section id="feedback"> */}
        <Pricing /> {/* Contains <section id="pricing"> */}
      </main>
      <Footer />
    </div>
  )
}
```
## File: app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* body font-family is now handled by next/font in app/layout.tsx */

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 217 19% 35%; /* #1F2937 */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 249 79% 57%; /* #4F46E5 */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 98%; /* #F9FAFB */
    --secondary-foreground: 217 19% 35%;
    --muted: 0 0% 96.1%; /* Light neutral */
    --muted-foreground: 217 19% 35%;
    --accent: 174 75% 45%; /* #14B8A6 */
    --accent-foreground: 0 0% 100%;
    --destructive: 4 83% 59%; /* #EF4444 */
    --destructive-foreground: 0 0% 100%;
    --success: 145 75% 45%; /* #10B981 */
    --success-foreground: 0 0% 100%;
    --warning: 42 100% 53%; /* #F59E0B */
    --info: 217 89% 66%; /* #3B82F6 */
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    /* Poppins font is applied via className in app/layout.tsx */
  }
}

/* Custom global styles from splashpage.html */
html {
  scroll-behavior: smooth;
}

.section {
  min-height: 100vh;
  padding: 2rem 0;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.lock-icon {
  position: absolute;
  top: 10px; /* Consider Tailwind: top-2.5 */
  right: 10px; /* Consider Tailwind: right-2.5 */
  color: #6B7280; /* Consider Tailwind: text-gray-500 */
  background: #F3F4F6; /* Consider Tailwind: bg-gray-100 */
  border-radius: 50%; /* Consider Tailwind: rounded-full */
  padding: 5px; /* Consider Tailwind: p-1 or p-1.5 */
}
```
## File: prisma/schema.prisma
```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  credits       Int       @default(3)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  interviews    Interview[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Interview {
  id        String   @id @default(cuid())
  userId    String
  transcript String? @db.Text
  feedback  Json?
  duration  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
## File: styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
## File: components/theme-provider.tsx
```
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```
## File: components/navbar.tsx
```
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">VocaHire</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/prepare"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/prepare" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Prepare
          </Link>
          <Link
            href="/feedback"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/feedback" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Feedback
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {loading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                    <AvatarFallback>
                      {session.user?.name
                        ? session.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut({ callbackUrl: "/" })
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
```
## File: public/placeholder-logo.svg
```
<svg xmlns="http://www.w3.org/2000/svg" width="215" height="48" fill="none"><path fill="#000" d="M57.588 9.6h6L73.828 38h-5.2l-2.36-6.88h-11.36L52.548 38h-5.2l10.24-28.4Zm7.16 17.16-4.16-12.16-4.16 12.16h8.32Zm23.694-2.24c-.186-1.307-.706-2.32-1.56-3.04-.853-.72-1.866-1.08-3.04-1.08-1.68 0-2.986.613-3.92 1.84-.906 1.227-1.36 2.947-1.36 5.16s.454 3.933 1.36 5.16c.934 1.227 2.24 1.84 3.92 1.84 1.254 0 2.307-.373 3.16-1.12.854-.773 1.387-1.867 1.6-3.28l5.12.24c-.186 1.68-.733 3.147-1.64 4.4-.906 1.227-2.08 2.173-3.52 2.84-1.413.667-2.986 1-4.72 1-2.08 0-3.906-.453-5.48-1.36-1.546-.907-2.76-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84 0-2.24.427-4.187 1.28-5.84.88-1.68 2.094-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.68 0 3.227.32 4.64.96 1.414.64 2.56 1.56 3.44 2.76.907 1.2 1.454 2.6 1.64 4.2l-5.12.28Zm11.486-7.72.12 3.4c.534-1.227 1.307-2.173 2.32-2.84 1.04-.693 2.267-1.04 3.68-1.04 1.494 0 2.76.387 3.8 1.16 1.067.747 1.827 1.813 2.28 3.2.507-1.44 1.294-2.52 2.36-3.24 1.094-.747 2.414-1.12 3.96-1.12 1.414 0 2.64.307 3.68.92s1.84 1.52 2.4 2.72c.56 1.2.84 2.667.84 4.4V38h-4.96V25.92c0-1.813-.293-3.187-.88-4.12-.56-.96-1.413-1.44-2.56-1.44-.906 0-1.68.213-2.32.64-.64.427-1.133 1.053-1.48 1.88-.32.827-.48 1.84-.48 3.04V38h-4.56V25.92c0-1.2-.133-2.213-.4-3.04-.24-.827-.626-1.453-1.16-1.88-.506-.427-1.133-.64-1.88-.64-.906 0-1.68.227-2.32.68-.64.427-1.133 1.053-1.48 1.88-.32.827-.48 1.827-.48 3V38h-4.96V16.8h4.48Zm26.723 10.6c0-2.24.427-4.187 1.28-5.84.854-1.68 2.067-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.84 0 3.494.413 4.96 1.24 1.467.827 2.64 2.08 3.52 3.76.88 1.653 1.347 3.693 1.4 6.12v1.32h-15.08c.107 1.813.614 3.227 1.52 4.24.907.987 2.134 1.48 3.68 1.48.987 0 1.88-.253 2.68-.76a4.803 4.803 0 0 0 1.84-2.2l5.08.36c-.64 2.027-1.84 3.64-3.6 4.84-1.733 1.173-3.733 1.76-6 1.76-2.08 0-3.906-.453-5.48-1.36-1.573-.907-2.786-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84Zm15.16-2.04c-.213-1.733-.76-3.013-1.64-3.84-.853-.827-1.893-1.24-3.12-1.24-1.44 0-2.6.453-3.48 1.36-.88.88-1.44 2.12-1.68 3.72h9.92ZM163.139 9.6V38h-5.04V9.6h5.04Zm8.322 7.2.24 5.88-.64-.36c.32-2.053 1.094-3.56 2.32-4.52 1.254-.987 2.787-1.48 4.6-1.48 2.32 0 4.107.733 5.36 2.2 1.254 1.44 1.88 3.387 1.88 5.84V38h-4.96V25.92c0-1.253-.12-2.28-.36-3.08-.24-.8-.64-1.413-1.2-1.84-.533-.427-1.253-.64-2.16-.64-1.44 0-2.573.48-3.4 1.44-.8.933-1.2 2.307-1.2 4.12V38h-4.96V16.8h4.48Zm30.003 7.72c-.186-1.307-.706-2.32-1.56-3.04-.853-.72-1.866-1.08-3.04-1.08-1.68 0-2.986.613-3.92 1.84-.906 1.227-1.36 2.947-1.36 5.16s.454 3.933 1.36 5.16c.934 1.227 2.24 1.84 3.92 1.84 1.254 0 2.307-.373 3.16-1.12.854-.773 1.387-1.867 1.6-3.28l5.12.24c-.186 1.68-.733 3.147-1.64 4.4-.906 1.227-2.08 2.173-3.52 2.84-1.413.667-2.986 1-4.72 1-2.08 0-3.906-.453-5.48-1.36-1.546-.907-2.76-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84 0-2.24.427-4.187 1.28-5.84.88-1.68 2.094-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.68 0 3.227.32 4.64.96 1.414.64 2.56 1.56 3.44 2.76.907 1.2 1.454 2.6 1.64 4.2l-5.12.28Zm11.443 8.16V38h-5.6v-5.32h5.6Z"/><path fill="#171717" fill-rule="evenodd" d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z" clip-rule="evenodd"/></svg>
```
## File: public/placeholder-logo.png
```
�PNG

   
IHDR      �   M��   0PLTE                                                Z?   tRNS � �@��`P0p���w  �IDATx��ؽJ3Q�7'��%�|?� ���E�l�7���(X�D������w`����[�*t����D���mD�}��4;;�DDDDDDDDDDDD_�_İ��!�y�`�_�:��;Ļ�'|�	��;.I"����3*5����J�1�� �T��FI��	��=��3܃�2~�b���0��U9\��]�4�#w0��Gt\&1�?21,���o!e�m��ĻR�����5�� ؽAJ�9��R)�5�0.FFASaǃ�T�#|�K���I�������1�
M������N"��$����G�V�T���T^^��A�$S��h(�������G]co"J׸^^�'�=���%�	�W�6Ы�W��w�a�߇*�^^�YG�c���`'F����������������^ 5_�,�S�%    IEND�B`�
```
## File: public/placeholder-user.jpg
```
���� JFIF      �� C 
	
		
$ &%# #"(-90(*6+"#2D26;=@@@&0FKE>J9?@=�� C
=)#)==================================================��  � � ��             ��                 ��     ـ                                                           |�r4�-�       ̈"x�'�0      �Í��8�H�N�      q�����Q��      �����V�`=       �($q"_��               
�S8�P��0     VFbP��!
Io40     ��[?p #�|�@    !.E�  3��4p    Bq  �Z
    s   �                                                          �� C 		       AQR�!1@Ua��02Tq���56cps�� "#$PS�����  ? ��R���,�����
�n�k��n8rZ�����9Vv� �V��ms$9zWʏh�-+@Z�2�PGE������EY9��i�Ͻ�S	��O��Ȕ��_I��W髵�}�����B�ՎT��>%r�[e/,W�D}��D�>b�e>�v�Z�p&�*VS��V�sV�c �:��~K������� C��:��k�'An|ʶ�}\��C� �f����a�;�h��J����q!i=���"�q�NF�IZ�`�wĝ5hAj�	
�RXl䎉�lk���@I�%l��Ն���FDY-����Eq�i����O�I�_�2b�lǋ�Yu��k���AO����٣��ܭ�n��cam�jN�j���VL�}�;��oކ6��շs��,���ք���l�i����l{I�O��(!%J $���n�-@G����n��ܮi!�괁G�:�^��n�g3l�F%���9]�Pq��)�:���@�*ɍmׅ�VLY'�s+�z���V�m �J9��S�_���#��;�����Ǌ!5�#�q\�M@��@�]yz�����A;e�k��@� s�^���G����\�5F��(�� S��Ly���c�i8�����o�8T��i�N��7D����t-� p�3`r� q
r�;|�.��bTG��[i H��͚-�
��Oj�H����M�ؒFE�{�3X�n���e� �R3/�~�����
�� a����!�j&@^r�����Y�������l�Z? �7땵��)ki�w��\.�u�����X��\.�u�����X��\.�u�����X��\.�u��p�M����o(N��3�Vg�����Z�s��%�\�]q}d�k\_Y5���MG�����Q��q}d�k\_Y5���MG�����Q��q}d�kV|5���8���//����                ��� ? ��                ��� ? ��
```
## File: public/placeholder.jpg
```
���� JFIF   H H  �� �Exif  MM *                  J       R(       �i       Z       H      H    �       �       �           �� 8Photoshop 3.0 8BIM      8BIM%     ��ُ ��	���B~��    ��           	
�� � s !1"AQ2aq#� �B�R3�$b0�r�C�4��S@%c5�s�PD���&T6d�t�`҄�p�'E7e�Uu��Å��Fv��GVf�	
()*89:HIJWXYZghijwxyz�����������������������������������������������������������        	
�� � � ! 1A0"2Q@3#aBqR4�P$��C�b5S��%`�D�r��c6p&ET�'��	
()*789:FGHIJUVWXYZdefghijstuvwxyz����������������������������������������������������������������������������� C 

	


")$+*($''-2@7-0=0''8L9=CEHIH+6OUNFT@GHE�� C

!!E.'.EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE��    �k��  �� ?�� ?��  ?�� 3     !1AQaq��������� 0@P`p���������  ?!���    �� 3   	 !1AQa q𑁡�����0@P`p��������� ?��� ?���  ?���
```
## File: public/placeholder.svg
```
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" fill="none"><rect width="1200" height="1200" fill="#EAEAEA" rx="3"/><g opacity=".5"><g opacity=".5"><path fill="#FAFAFA" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/></g><path stroke="url(#a)" stroke-width="2.418" d="M0-1.209h553.581" transform="scale(1 -1) rotate(45 1163.11 91.165)"/><path stroke="url(#b)" stroke-width="2.418" d="M404.846 598.671h391.726"/><path stroke="url(#c)" stroke-width="2.418" d="M599.5 795.742V404.017"/><path stroke="url(#d)" stroke-width="2.418" d="m795.717 796.597-391.441-391.44"/><path fill="#fff" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/><g clip-path="url(#e)"><path fill="#666" fill-rule="evenodd" d="M616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181V586.58Zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181-.071.072Zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146.146.147Z" clip-rule="evenodd"/></g><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/></g><defs><linearGradient id="a" x1="554.061" x2="-.48" y1=".083" y2=".087" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="796.912" x2="404.507" y1="599.963" y2="599.965" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="c" x1="600.792" x2="600.794" y1="403.677" y2="796.082" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="d" x1="404.85" x2="796.972" y1="403.903" y2="796.02" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><clipPath id="e"><path fill="#fff" d="M581.364 580.535h38.689v38.689h-38.689z"/></clipPath></defs></svg>
```
## File: hooks/use-mobile.tsx
```
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```
## File: hooks/use-toast.ts
```typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```
## File: lib/prisma.ts
```typescript
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
```
## File: lib/prisma 2.ts
```typescript
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
```
## File: lib/usage-tracking.ts
```typescript
import { getRedisClient } from "./redis"

// Track usage for a specific action
export async function trackUsage(userId: string, action: string): Promise<void> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0] // YYYY-MM-DD
  const month = day.substring(0, 7) // YYYY-MM

  try {
    // Increment daily counter
    await redis.incr(`usage:${action}:day:${day}:${userId}`)
    await redis.expire(`usage:${action}:day:${day}:${userId}`, 60 * 60 * 24 * 7) // 7 days

    // Increment monthly counter
    await redis.incr(`usage:${action}:month:${month}:${userId}`)
    await redis.expire(`usage:${action}:month:${month}:${userId}`, 60 * 60 * 24 * 32) // 32 days

    // Increment total counter
    await redis.incr(`usage:${action}:total:${userId}`)

    // Increment global counters
    await redis.incr(`usage:${action}:day:${day}:global`)
    await redis.incr(`usage:${action}:month:${month}:global`)
    await redis.incr(`usage:${action}:total:global`)
  } catch (error) {
    // If Redis fails, log the error but don't block the operation
    console.error("Error tracking usage:", error)
  }
}

// Get usage statistics for a user
export async function getUserUsage(userId: string): Promise<any> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0]
  const month = day.substring(0, 7)

  try {
    const [dailyInterviews, monthlyInterviews, totalInterviews, dailyFeedback, monthlyFeedback, totalFeedback] =
      await Promise.all([
        redis.get(`usage:realtime_session:day:${day}:${userId}`),
        redis.get(`usage:realtime_session:month:${month}:${userId}`),
        redis.get(`usage:realtime_session:total:${userId}`),
        redis.get(`usage:generate_feedback:day:${day}:${userId}`),
        redis.get(`usage:generate_feedback:month:${month}:${userId}`),
        redis.get(`usage:generate_feedback:total:${userId}`),
      ])

    return {
      interviews: {
        daily: Number.parseInt(dailyInterviews || "0"),
        monthly: Number.parseInt(monthlyInterviews || "0"),
        total: Number.parseInt(totalInterviews || "0"),
      },
      feedback: {
        daily: Number.parseInt(dailyFeedback || "0"),
        monthly: Number.parseInt(monthlyFeedback || "0"),
        total: Number.parseInt(totalFeedback || "0"),
      },
    }
  } catch (error) {
    console.error("Error getting user usage:", error)
    return {
      interviews: { daily: 0, monthly: 0, total: 0 },
      feedback: { daily: 0, monthly: 0, total: 0 },
    }
  }
}

// Get global usage statistics
export async function getGlobalUsage(): Promise<any> {
  const redis = getRedisClient()
  const now = new Date()
  const day = now.toISOString().split("T")[0]
  const month = day.substring(0, 7)

  try {
    const [dailyInterviews, monthlyInterviews, totalInterviews, dailyFeedback, monthlyFeedback, totalFeedback] =
      await Promise.all([
        redis.get(`usage:realtime_session:day:${day}:global`),
        redis.get(`usage:realtime_session:month:${month}:global`),
        redis.get(`usage:realtime_session:total:global`),
        redis.get(`usage:generate_feedback:day:${day}:global`),
        redis.get(`usage:generate_feedback:month:${month}:global`),
        redis.get(`usage:generate_feedback:total:global`),
      ])

    return {
      interviews: {
        daily: Number.parseInt(dailyInterviews || "0"),
        monthly: Number.parseInt(monthlyInterviews || "0"),
        total: Number.parseInt(totalInterviews || "0"),
      },
      feedback: {
        daily: Number.parseInt(dailyFeedback || "0"),
        monthly: Number.parseInt(monthlyFeedback || "0"),
        total: Number.parseInt(totalFeedback || "0"),
      },
    }
  } catch (error) {
    console.error("Error getting global usage:", error)
    return {
      interviews: { daily: 0, monthly: 0, total: 0 },
      feedback: { daily: 0, monthly: 0, total: 0 },
    }
  }
}
```
## File: lib/redis.ts
```typescript
import { Redis } from "@upstash/redis"

// Singleton instances
let redis: Redis | null = null
let mockRedisClient: any = null

/**
 * Creates a mock Redis client for development or when Redis is unavailable
 */
function createMockRedisClient() {
  console.warn(
    "Upstash Redis not configured or connection failed. Using mock Redis client. Rate limiting and other Redis-dependent features will not be effective.",
  )

  const storage = new Map<string, { value: any; expiry?: number }>()

  // Clean up expired keys periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, item] of storage.entries()) {
      if (item.expiry && item.expiry <= now) {
        storage.delete(key)
      }
    }
  }, 60000) // Run every minute

  const clientImplementation = {
    get: async <T>(key: string): Promise<T | null> => {
      const item = storage.get(key)
      if (!item) return null
      if (item.expiry && item.expiry <= Date.now()) {
        storage.delete(key)
        return null
      }
      return item.value as T
    },
    
    set: async (
      key: string,
      value: any,
      options?: {
        ex?: number
        px?: number
      }
    ): Promise<string | null> => {
      let expiry: number | undefined
      if (options?.ex) {
        expiry = Date.now() + options.ex * 1000
      } else if (options?.px) {
        expiry = Date.now() + options.px
      }
      storage.set(key, { value, expiry })
      return "OK"
    },
    
    incr: async (key: string): Promise<number> => {
      const item = storage.get(key)
      let currentValue = 0
      if (item && typeof item.value === "number") {
        if (!item.expiry || item.expiry > Date.now()) {
          currentValue = item.value
        }
      }
      const newValue = currentValue + 1
      storage.set(key, { value: newValue, expiry: item?.expiry })
      return newValue
    },
    
    expire: async (key: string, seconds: number): Promise<number> => {
      const item = storage.get(key)
      if (item) {
        item.expiry = Date.now() + seconds * 1000
        return 1
      }
      return 0
    },
    
    pipeline: () => {
      const commands: Array<{ command: string; args: any[] }> = []
      const pipelineInstance = {
        incr: (key: string) => {
          commands.push({ command: "incr", args: [key] })
          return pipelineInstance
        },
        expire: (key: string, seconds: number) => {
          commands.push({ command: "expire", args: [key, seconds] })
          return pipelineInstance
        },
        exec: async () => {
          const results: any[] = []
          for (const cmd of commands) {
            if (cmd.command === "incr") {
              results.push(await clientImplementation.incr(cmd.args[0]))
            } else if (cmd.command === "expire") {
              results.push(await clientImplementation.expire(cmd.args[0], cmd.args[1]))
            }
          }
          return results
        },
      }
      return pipelineInstance
    },
    
    del: async (key: string): Promise<number> => {
      return storage.delete(key) ? 1 : 0
    },
  }
  return clientImplementation
}

/**
 * Returns a Redis client or a mock implementation if Redis is unavailable
 */
export function getRedisClient(): Redis | any {
  if (redis) {
    return redis
  }

  const UPSTASH_URL = process.env.KV_REST_API_URL
  const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN

  if (mockRedisClient && (!UPSTASH_URL || !UPSTASH_TOKEN)) {
    // If already using mock and still no creds, return existing mock
    return mockRedisClient
  }

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    if (!mockRedisClient) {
      mockRedisClient = createMockRedisClient()
    }
    return mockRedisClient
  }

  try {
    redis = new Redis({
      url: UPSTASH_URL,
      token: UPSTASH_TOKEN,
    })
    console.log("Successfully connected to Upstash Redis.")
    return redis
  } catch (error) {
    console.error("Failed to connect to Upstash Redis:", error)
    if (!mockRedisClient) {
      mockRedisClient = createMockRedisClient()
    }
    return mockRedisClient
  }
}
```
## File: lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
## File: lib/rate-limit.ts
```typescript
import { getRedisClient } from "./redis"

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Maximum number of requests allowed in the time window
  uniqueTokenPerInterval?: number // Maximum number of unique tokens per interval
}

export interface RateLimiter {
  check: (token: string) => Promise<void>
}

export function rateLimit(config: RateLimitConfig): RateLimiter {
  const { interval, limit, uniqueTokenPerInterval = 500 } = config
  const redis = getRedisClient()

  return {
    check: async (token: string): Promise<void> => {
      const tokenKey = `rate-limit:${token}`
      const uniqueTokensKey = `rate-limit:unique-tokens:${Math.floor(Date.now() / interval)}`

      let requests: number

      try {
        // Increment the token count
        requests = await redis.incr(tokenKey)

        // Set expiration for the token key if it's new
        if (requests === 1) {
          await redis.expire(tokenKey, Math.floor(interval / 1000))
        }

        // Add the token to the set of unique tokens for this interval
        await redis.set(uniqueTokensKey, token, { ex: Math.floor(interval / 1000) })

        // Check if the token has exceeded the limit
        if (requests > limit) {
          throw new Error(`Rate limit exceeded for ${token}`)
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
          throw error
        }
        // If there's an error with Redis, we'll log it but allow the request
        console.error("Error in rate limiting:", error)
      }
    },
  }
}
```
## File: lib/auth.ts
```typescript
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
```
## File: components/ui/aspect-ratio.tsx
```
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
```
## File: components/ui/alert-dialog.tsx
```
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```
## File: components/ui/use-mobile.tsx
```
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```
## File: components/ui/pagination.tsx
```
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
```
## File: components/ui/tabs.tsx
```
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```
## File: components/ui/card.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```
## File: components/ui/slider.tsx
```
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
```
## File: components/ui/popover.tsx
```
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
```
## File: components/ui/progress.tsx
```
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```
## File: components/ui/toaster.tsx
```
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```
## File: components/ui/input-otp.tsx
```
"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```
## File: components/ui/chart.tsx
```
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
```
## File: components/ui/hover-card.tsx
```
"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
```
## File: components/ui/sheet.tsx
```
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```
## File: components/ui/scroll-area.tsx
```
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
```
## File: components/ui/resizable.tsx
```
"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```
## File: components/ui/label.tsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```
## File: components/ui/sonner.tsx
```
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```
## File: components/ui/navigation-menu.tsx
```
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
```
## File: components/ui/accordion.tsx
```
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```
## File: components/ui/drawer.tsx
```
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
```
## File: components/ui/tooltip.tsx
```
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```
## File: components/ui/alert.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```
## File: components/ui/use-toast.ts
```typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```
## File: components/ui/switch.tsx
```
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```
## File: components/ui/calendar.tsx
```
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
```
## File: components/ui/breadcrumb.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
```
## File: components/ui/radio-group.tsx
```
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
```
## File: components/ui/command.tsx
```
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```
## File: components/ui/toggle-group.tsx
```
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
```
## File: components/ui/avatar.tsx
```
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```
## File: components/ui/menubar.tsx
```
"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
```
## File: components/ui/dialog.tsx
```
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```
## File: components/ui/badge.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```
## File: components/ui/sidebar.tsx
```
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
```
## File: components/ui/table.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```
## File: components/ui/separator.tsx
```
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```
## File: components/ui/button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```
## File: components/ui/toggle.tsx
```
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-9 px-2.5 min-w-9",
        lg: "h-11 px-5 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
```
## File: components/ui/toast.tsx
```
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
```
## File: components/ui/checkbox.tsx
```
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```
## File: components/ui/collapsible.tsx
```
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```
## File: components/ui/dropdown-menu.tsx
```
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```
## File: components/ui/select.tsx
```
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```
## File: components/ui/textarea.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```
## File: components/ui/input.tsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```
## File: components/ui/skeleton.tsx
```
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```
## File: components/ui/context-menu.tsx
```
"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
```
## File: components/ui/form.tsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```
## File: components/ui/carousel.tsx
```
"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
```
## File: components/landing/Hero.tsx
```
import React from 'react'
// import Link from 'next/link' // For CTAs if they navigate to different pages
import { Briefcase } from 'lucide-react' // Placeholder for fa-user-tie

const Hero = () => {
  return (
    <section id="home" className="pt-20 md:pt-28 lg:pt-32"> {/* Adjusted top padding to account for fixed navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Land your dream job with</span>
              <span className="block text-indigo-600">AI Interview Coaching</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Practice unlimited interview scenarios with our AI-powered coach. Get real-time feedback on your speaking style, answer content, and confidence. All in a safe, private environment.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <a
                href="#simulation"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Try for Free
              </a>
              <a
                href="#pricing"
                className="ml-3 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                See Pricing
              </a>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-indigo-100 flex items-center justify-center">
                  <div className="text-center p-5">
                    <Briefcase className="text-indigo-500 mx-auto" size={64} strokeWidth={1.5} />
                    <p className="text-gray-700 mt-4">AI Interview Simulation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
```
## File: components/landing/Navbar.tsx
```
import React from 'react'
// import Link from 'next/link' // Not used yet, but might be for actual page navigation

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full z-10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-indigo-600 font-bold text-xl">VocaHire Coach</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#home"
                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </a>
              <a
                href="#simulation"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Interview Simulation
              </a>
              <a
                href="#feedback"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Feedback
              </a>
              <a
                href="#pricing"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* TODO: Replace with Link to actual sign-up page or auth modal trigger */}
            <button 
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up Free
            </button>
          </div>
          {/* TODO: Add mobile menu button and functionality */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
```
## File: components/landing/Simulation.tsx
```
'use client' // This component uses client-side interactivity (useState, useEffect)

import React, { useState, useEffect, useRef } from 'react'
import { UploadCloud, Bot, User, Mic, MicOff, Square, Lock } from 'lucide-react'
import Waveform from './Waveform'

const questions = [
  "Tell me about a time when you had to solve a challenging problem at work. What was your approach and what was the outcome?",
  "How do you handle tight deadlines and pressure?",
  "Describe a situation where you had to work with a difficult team member. How did you handle it?",
  "What is your greatest professional achievement and why?",
  "How do you stay updated with the latest technologies in your field?",
  "Tell me about a time when you failed. What did you learn from it?",
  "How do you approach learning new technical skills?",
  "Describe a project where you demonstrated leadership.",
  "How do you handle constructive criticism?",
  "Where do you see yourself in 5 years?"
];

const Simulation = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'interview'>('setup')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Form state (simplified for now)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [interviewType, setInterviewType] = useState('behavioral')

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartInterview = () => {
    // TODO: Process form data (jobTitle, company, resumeFile, etc.)
    console.log('Starting interview with settings:', { jobTitle, company, resumeFile, jobDescription, interviewType });
    setActiveTab('interview')
    setIsRecording(true) // Auto-start recording
    setRecordingSeconds(0)
    setCurrentQuestionIndex(0)
  }

  const handleEndInterview = () => {
    if (isRecording) {
      setIsRecording(false)
    }
    // TODO: Navigate to feedback section or page
    const feedbackSection = document.getElementById('feedback');
    if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveTab('setup'); // Or a new 'results' tab
  }

  const handleToggleMic = () => {
    setIsRecording((prev) => !prev)
    if (!isRecording) { // If we are about to start recording
        setRecordingSeconds(0);
    }
  }

  const handleNextQuestion = () => {
    if (isRecording) {
      setIsRecording(false) // Stop recording for current question
    }
    // TODO: Save current answer/transcript segment
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Last question, perhaps end interview
      handleEndInterview()
    }
    // Optionally, auto-start mic for next question after a delay or user action
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0]);
      // TODO: Display file name or preview
    }
  };

  return (
    <section id="simulation" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Interview Simulation
          </h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Practice makes perfect
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Engage in a realistic mock interview with our AI coach.
          </p>
        </div>

        <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* Interview Setup */}
            <div id="setup" className={`tab-content ${activeTab === 'setup' ? 'active' : ''}`}>
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Set up your interview</h3>
                <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="job-title"
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Google"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                      Upload Resume
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1} />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        {resumeFile && <p className="text-xs text-gray-500 mt-1">{resumeFile.name}</p>}
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                      Job Description (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="job-description"
                        name="job-description"
                        rows={4}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Paste the job description here..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="interview-type" className="block text-sm font-medium text-gray-700">
                      Interview Type
                    </label>
                    <select
                      id="interview-type"
                      name="interview-type"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="behavioral">Behavioral Interview</option>
                      <option value="technical">Technical Interview</option>
                      <option value="leadership">Leadership Interview</option>
                      <option value="case">Case Interview</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      onClick={handleStartInterview}
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview in Progress */}
            <div id="interview" className={`tab-content ${activeTab === 'interview' ? 'active' : ''}`}>
              <div className="max-w-3xl mx-auto">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">AI Interviewer</h3>
                        <p className="text-sm text-gray-500" id="questionNumber">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isRecording && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Mic className="-ml-1 mr-1.5 h-4 w-4 text-green-600" />
                          Recording
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-gray-700 text-lg" id="currentQuestion">
                      {questions[currentQuestionIndex]}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">You</h4>
                          </div>
                        </div>
                        <div>
                          <span id="recordingTime" className="text-sm text-gray-500">
                            {formatTime(recordingSeconds)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Waveform isActive={isRecording} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={handleEndInterview}
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      End Interview
                    </button>
                    <div>
                      <button
                        id="micToggle"
                        onClick={handleToggleMic}
                        type="button"
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          isRecording ? 'bg-red-600' : 'bg-indigo-600'
                        }`}
                      >
                        {isRecording ? <Square className="h-5 w-5" fill="white"/> : <Mic className="h-5 w-5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleNextQuestion}
                      type="button"
                      disabled={currentQuestionIndex >= questions.length -1 && !isRecording} // Disable if last q and not recording
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Next Question
                    </button>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm relative">
                  <Lock className="lock-icon h-5 w-5" /> {/* Using .lock-icon class from globals.css */}
                  <h4 className="text-lg font-medium text-gray-900">
                    Real-time Coaching{' '}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                      Premium
                    </span>
                  </h4>
                  <p className="mt-2 text-gray-500">
                    Upgrade to get real-time tips and feedback while you answer. We'll help you structure your responses, avoid filler words, and maintain a confident tone.
                  </p>
                  <div className="mt-3">
                    <button 
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Simulation
```
## File: components/landing/Pricing.tsx
```
import React from 'react'
import { Check } from 'lucide-react'

const pricingTiers = [
  {
    name: 'Free',
    description: 'Perfect for trying out and occasional practice.',
    price: '$0',
    frequency: '/forever',
    buttonText: 'Start Free',
    buttonHref: '#simulation', // Or actual sign-up link
    buttonVariant: 'secondary', // 'primary' or 'secondary' for styling
    features: [
      '5 AI interviews per month',
      'Basic voice analysis',
      'Limited answer feedback',
      'Standard interview questions',
    ],
  },
  {
    name: 'Premium',
    description: 'For job seekers in active interview mode.',
    price: '$19.99',
    frequency: '/month',
    buttonText: 'Upgrade Now',
    buttonHref: '#', // Actual upgrade link
    buttonVariant: 'primary',
    features: [
      'Unlimited AI interviews',
      'Advanced voice & tone analysis',
      'Detailed feedback for all answers',
      'Real-time coaching during interviews',
      'Tailored questions from resume & job description',
      'AI-suggested improved answers',
    ],
  },
  {
    name: 'Pay-Per-Use',
    description: 'For occasional premium sessions without subscription.',
    price: '$4.99',
    frequency: '/session',
    buttonText: 'Buy Credits',
    buttonHref: '#', // Actual credits purchase link
    buttonVariant: 'secondary',
    features: [
      'One full interview (up to 10 questions)',
      'Advanced voice & tone analysis',
      'Detailed feedback for all answers',
      'Tailored questions from resume & job description',
      'Session recording for later review',
    ],
  },
]

const Pricing = () => {
  return (
    <section id="pricing" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Simple, transparent pricing
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Start for free, upgrade when you need more.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                tier.buttonVariant === 'primary' ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  <span className="text-base font-medium text-gray-500">{tier.frequency}</span>
                </p>
                <a
                  href={tier.buttonHref}
                  className={`mt-8 block w-full border rounded-md py-2 text-sm font-semibold text-center ${
                    tier.buttonVariant === 'primary'
                      ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                      : 'bg-gray-800 border-gray-800 text-white hover:bg-gray-900' // Original HTML used gray-800 for secondary
                  }`}
                >
                  {tier.buttonText}
                </a>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900">
                  {tier.name === 'Premium' ? 'All Free features, plus:' : "What's included"}
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
```
## File: components/landing/Features.tsx
```
import React from 'react'
import { Mic, FileText, LineChart, Shield } from 'lucide-react'

const Features = () => {
  const featuresList = [
    {
      icon: <Mic className="h-6 w-6 text-white" />,
      title: 'Realistic Voice Interviews',
      description: "Engage in real-time, voice-driven mock interviews with our AI interviewer using OpenAI's latest speech models.",
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: 'Personalized Context',
      description: 'Upload your resume and job description to get tailored questions specific to your experience and target role.',
    },
    {
      icon: <LineChart className="h-6 w-6 text-white" />,
      title: 'Instant Feedback',
      description: 'Receive immediate, actionable post-interview analytics on your speaking style, answer quality, and timing.',
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Privacy by Design',
      description: 'Your data is never sold or misused. We use strict privacy measures to protect your information.',
    },
  ]

  return (
    <div className="py-12 bg-white"> {/* This was part of the #home section in original HTML */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to prepare for interviews
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our AI-powered platform offers everything you need to ace your next interview.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {featuresList.map((feature) => (
              <div key={feature.title} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.title}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Features
```
## File: components/landing/Waveform.tsx
```
import React from 'react'
import styles from './Waveform.module.css'

interface WaveformProps {
  isActive: boolean
}

const Waveform: React.FC<WaveformProps> = ({ isActive }) => {
  return (
    <div className={`${styles.waveform} ${isActive ? styles.waveformActive : ''}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export default Waveform
```
## File: components/landing/Footer.tsx
```
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
```
## File: components/landing/Testimonials.tsx
```
import React from 'react'
import { Star, StarHalf } from 'lucide-react'

const testimonialsData = [
  {
    stars: 5,
    quote: "I used VocaHire Coach to prepare for my Google interview, and one of the practice questions came up in the real interview! I felt so confident answering it.",
    author: 'Sarah L.',
    role: 'Software Engineer at Google',
  },
  {
    stars: 5,
    quote: "The feedback on my filler words and speaking pace was eye-opening. After just a week of practice, I eliminated my 'ums' and 'likes' completely.",
    author: 'Mark T.',
    role: 'Marketing Manager',
  },
  {
    stars: 4.5,
    quote: "As someone with interview anxiety, practicing with an AI removed the pressure. By my real interview, I felt prepared and ended up getting the job!",
    author: 'Jamie K.',
    role: 'Project Manager',
  },
]

const TestimonialStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <div className="text-indigo-500 mb-2 flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5" fill="currentColor" />
      ))}
      {halfStar && <StarHalf key="half" className="h-5 w-5" fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5" /> // Outline for empty
      ))}
    </div>
  )
}

const Testimonials = () => {
  return (
    <div className="bg-white py-16 sm:py-24"> {/* This was part of the #home section in original HTML */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Success stories from our users
          </p>
        </div>
        <div className="mt-10 space-y-8 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.author} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <TestimonialStars rating={testimonial.stars} />
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">{testimonial.author}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonials
```
## File: components/landing/FeedbackSection.tsx
```
import React from 'react'
import { Star, Timer, MessageCircle, Lock } from 'lucide-react'

// Placeholder data, in a real app this would come from props or state
const feedbackData = {
  overallScore: 85,
  averageAnswerTime: "1:45",
  confidenceScore: 7.8,
  speakingPace: {
    wpm: 175,
    idealMin: 150,
    idealMax: 170,
    percentage: 70, // For the progress bar
    feedbackText: "Your speaking pace is slightly faster than ideal (150-170 WPM). Try to slow down slightly for maximum clarity.",
  },
  fillerWords: {
    detected: [
      { word: "Um", count: 12 },
      { word: "Like", count: 8 },
      { word: "You know", count: 4 },
    ],
    tips: "Try pausing instead of using filler words. Practice replacing \"um\" with a brief moment of silence.",
  },
  questionAnalysis: [
    {
      question: "Q1: Tell me about a time when you had to solve a challenging problem at work.",
      strengths: ["Used STAR method effectively", "Provided specific metrics of success", "Demonstrated technical expertise"],
      areasToImprove: ["Answer was slightly too long (2:30)", "Could highlight teamwork more", "Consider mentioning what you learned"],
      isPremium: false,
    },
    {
      question: "Q2: How do you handle tight deadlines?",
      isPremium: true,
    },
  ],
  premiumUpsell: {
    suggestedAnswers: true,
  }
}

const FeedbackSection = () => {
  return (
    <section id="feedback" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Feedback</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Detailed Performance Analysis
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            See how you performed and get actionable insights to improve.
          </p>
        </div>

        <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Interview Performance Summary</h3>
                <p className="text-sm text-gray-500">Software Engineer Interview - {feedbackData.questionAnalysis.length} questions</p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Overall Score Card */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <Star className="h-6 w-6 text-white" fill="currentColor"/>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Overall Score</dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.overallScore}/100</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Answer Time Card */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <Timer className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Average Answer Time</dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.averageAnswerTime}</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Score Card (Premium) */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg relative">
                  <Lock className="lock-icon h-5 w-5" />
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Confidence Score <span className="text-xs text-indigo-600">Premium</span>
                          </dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.confidenceScore}/10</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaking Style Analysis */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900">Speaking Style Analysis</h4>
                <div className="mt-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Speaking Pace</h5>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${feedbackData.speakingPace.percentage}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{feedbackData.speakingPace.wpm} WPM</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{feedbackData.speakingPace.feedbackText}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Filler Words</h5>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Detected:</p>
                          <ul className="mt-1 text-sm text-gray-700">
                            {feedbackData.fillerWords.detected.map(fw => (
                              <li key={fw.word}>"{fw.word}" - {fw.count} times</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tips:</p>
                          <p className="mt-1 text-sm text-gray-700">{feedbackData.fillerWords.tips}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Analysis */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900">Question Analysis</h4>
                <div className="mt-4 overflow-hidden">
                  {feedbackData.questionAnalysis.map((qa, index) => (
                    <div key={index} className={`bg-gray-50 p-4 rounded-lg shadow-sm mb-4 ${qa.isPremium ? 'relative' : ''}`}>
                      {qa.isPremium && <Lock className="lock-icon h-5 w-5" />}
                      <h5 className="font-medium text-gray-900">
                        {qa.question}
                        {qa.isPremium && <span className="text-xs text-indigo-600 ml-1">Premium</span>}
                      </h5>
                      {qa.isPremium ? (
                        <div className="mt-2 blur-sm">
                          <p className="text-sm text-gray-700">Upgrade to Premium to see feedback for all questions.</p>
                        </div>
                      ) : (
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <h6 className="text-sm font-medium text-gray-500">Strengths</h6>
                            <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                              {qa.strengths?.map(s => <li key={s}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-gray-500">Areas to Improve</h6>
                            <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                              {qa.areasToImprove?.map(a => <li key={a}>{a}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {feedbackData.premiumUpsell.suggestedAnswers && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm relative">
                      <Lock className="lock-icon h-5 w-5" />
                      <h5 className="font-medium text-gray-900">
                        Suggested Improved Answers <span className="text-xs text-indigo-600">Premium</span>
                      </h5>
                      <div className="mt-2 blur-sm">
                        <p className="text-sm text-gray-700">Upgrade to see AI-generated improved versions of your answers.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center">
                <button 
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upgrade to Premium for Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeedbackSection
```
## File: components/landing/Waveform.module.css
```css
.waveform {
  display: flex;
  align-items: center;
  height: 50px;
}

.waveform span {
  width: 3px;
  margin: 0 1px;
  background: #4F46E5; /* Corresponds to Tailwind's indigo-600 */
  height: 100%;
  animation: wave 1s infinite;
  animation-play-state: paused;
}

.waveformActive span { /* Changed from .waveform.active for CSS Modules */
  animation-play-state: running;
}

@keyframes wave {
  0% { height: 10%; }
  50% { height: 100%; }
  100% { height: 10%; }
}

/* Individual animation delays for the bars */
.waveform span:nth-child(1) { animation-delay: 0.1s; }
.waveform span:nth-child(2) { animation-delay: 0.2s; }
.waveform span:nth-child(3) { animation-delay: 0.3s; }
.waveform span:nth-child(4) { animation-delay: 0.4s; }
.waveform span:nth-child(5) { animation-delay: 0.5s; }
.waveform span:nth-child(6) { animation-delay: 0.4s; } /* Symmetrical pattern */
.waveform span:nth-child(7) { animation-delay: 0.3s; }
.waveform span:nth-child(8) { animation-delay: 0.2s; }
.waveform span:nth-child(9) { animation-delay: 0.1s; }
```
## File: components/auth/register-form.tsx
```
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Sign in the user after successful registration
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      setError("Something went wrong with Google sign in. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Sign up to get started with VocaHire</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative w-full mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Sign up with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
```
## File: components/auth/login-form.tsx
```
"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      setError("Something went wrong with Google sign in. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative w-full mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Sign in with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
```
## File: app/register/page 2.tsx
```
import { RegisterForm } from "@/components/auth/register-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
```
## File: app/register/page.tsx
```
import { RegisterForm } from "@/components/auth/register-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
```
## File: app/profile/page 2.tsx
```
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Credits: {user.credits}</Badge>
              <Badge variant="outline">Member since {new Date(user.createdAt).toLocaleDateString()}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your most recent interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {user.interviews.length > 0 ? (
              <ul className="space-y-4">
                {user.interviews.map((interview) => (
                  <li key={interview.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Interview on {new Date(interview.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {interview.duration ? `${Math.round(interview.duration / 60)} minutes` : "N/A"}
                        </p>
                      </div>
                      <Badge>{interview.feedback ? "Completed" : "Pending"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">You haven't completed any interviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```
## File: app/profile/page.tsx
```
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Credits: {user.credits}</Badge>
              <Badge variant="outline">Member since {new Date(user.createdAt).toLocaleDateString()}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your most recent interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {user.interviews.length > 0 ? (
              <ul className="space-y-4">
                {user.interviews.map((interview) => (
                  <li key={interview.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Interview on {new Date(interview.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {interview.duration ? `${Math.round(interview.duration / 60)} minutes` : "N/A"}
                        </p>
                      </div>
                      <Badge>{interview.feedback ? "Completed" : "Pending"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">You haven't completed any interviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```
## File: app/login/page.tsx
```
import { LoginForm } from "@/components/auth/login-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```
## File: app/api/generate-feedback/route.ts
```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Define the schema for the request body
const GenerateFeedbackSchema = z.object({
  interviewId: z.string().min(1, { message: "Interview ID is required" }),
  transcript: z.string().min(1, { message: "Transcript is required" }),
  // Add other expected fields from the transcript or feedback generation if needed
})

// Rate limit configuration: 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 5, // 5 requests per minute
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User is not authenticated." },
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Apply rate limiting
    try {
      await limiter.check(userId)
    } catch (rateLimitError) {
      console.warn("Rate limit exceeded for user:", userId, rateLimitError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded. Please try again later.",
            retryable: true,
          },
        },
        { status: 429 }
      )
    }

    // Process and validate the request body
    let parsedBody
    try {
      const body = await request.json()
      parsedBody = GenerateFeedbackSchema.parse(body)
    } catch (e: unknown) { // Rename to 'e' for clarity in this scope
      if (e instanceof z.ZodError) {
        // After this check, 'e' is narrowed to type ZodError
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_INPUT",
              message: "Invalid request body.",
              details: e.format(), // 'e' is now correctly typed here
            },
          },
          { status: 400 }
        )
      }
      // Handle cases where request.json() itself fails (e.g., not valid JSON)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid JSON format in request body.",
          },
        },
        { status: 400 }
      )
    }

    const { interviewId, transcript } = parsedBody

    // Check if the interview belongs to the user
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
        userId,
      },
    })

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Interview not found or user is not authorized to access it.",
          },
        },
        { status: 404 }
      )
    }

    // Placeholder for feedback generation logic
    // TODO: Implement actual feedback generation based on `transcript`
    // const generatedFeedback = await generateActualFeedback(transcript);
    const generatedFeedback = {
      summary: "This is a placeholder summary.",
      strengths: ["Good clarity."],
      areasForImprovement: ["Could provide more specific examples."],
      // Ensure this structure matches what you intend to store in Prisma `Json` type
    }

    // Track usage
    await trackUsage(userId, "generate_feedback")

    // Save feedback to the database
    // Ensure the 'feedback' field in your Prisma schema is of type Json
    // and can store the structure of `generatedFeedback`
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        // @ts-ignore - Prisma might need specific type for Json, ensure generatedFeedback matches
        feedback: generatedFeedback,
      },
    })

    // Return the success response
    return NextResponse.json({
      success: true,
      data: { message: "Feedback generated and saved successfully.", feedback: generatedFeedback },
    })
  } catch (error) {
    console.error("Error in generate-feedback route:", error)
    // Determine if the error is a known type to provide more specific code/message
    let errorCode = "INTERNAL_SERVER_ERROR"
    let errorMessage = "Something went wrong. Please try again."
    // Example: if (error instanceof CustomError) { errorCode = error.code; errorMessage = error.message; }

    return NextResponse.json(
      {
        success: false,
        error: { code: errorCode, message: errorMessage },
      },
      { status: 500 }
    )
  }
}
```
## File: app/api/register/route 2.ts
```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Define a schema for input validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the input
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Return the user without the password
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
```
## File: app/api/register/route.ts
```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Define a schema for input validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the input
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Return the user without the password
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
```
## File: app/api/realtime-session/route.ts
```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { trackUsage } from "@/lib/usage-tracking"
import { prisma } from "@/lib/prisma"

// Define the schema for the request body
const CreateRealtimeSessionSchema = z.object({
  model: z.string().optional().default("gpt-4o-mini-realtime"), // Or your specific model
  voice: z.string().optional().default("echo"), // Or your preferred voice
  instructions: z.string().optional().default("You are a helpful interview assistant."),
  modalities: z.array(z.enum(["audio_input", "audio_output"])).optional().default(["audio_input", "audio_output"]),
  turn_detection: z.object({
    strategy: z.enum(["silence", "end_of_speech_marker"]).optional().default("silence"),
    silence_duration_ms: z.number().optional().default(1000),
  }).optional(),
  // Add any other parameters your client might send for session creation
})

// Rate limit configuration: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 10, // 10 requests per minute per user
})

// It's better to augment NextAuth.js types globally,
// but for a quick fix, we'll assume the session user object has an 'id' property.
// Ensure your next-auth.d.ts correctly augments the Session['user'] type.
// Example next-auth.d.ts:
// import NextAuth, { DefaultSession } from "next-auth"
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//     } & DefaultSession["user"]
//   }
// }


export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    // Assuming session.user.id is populated by your NextAuth config
    // For a robust solution, ensure next-auth.d.ts correctly augments Session['user']
    const userIdFromSession = (session?.user as { id?: string })?.id;

    if (!userIdFromSession) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User is not authenticated or user ID is missing." } },
        { status: 401 }
      )
    }

    const userId = userIdFromSession // userId is now guaranteed to be a string here

    // Apply rate limiting
    try {
      await limiter.check(userId)
    } catch (rateLimitError) {
      console.warn("Rate limit exceeded for user:", userId, rateLimitError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded. Please try again later.",
            retryable: true,
          },
        },
        { status: 429 }
      )
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: "Insufficient credits. Please purchase more credits.",
          },
        },
        { status: 403 }
      )
    }

    // Process and validate the request body
    let parsedBody
    try {
      const body = await request.json()
      parsedBody = CreateRealtimeSessionSchema.parse(body)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_INPUT",
              message: "Invalid request body.",
              details: e.format(),
            },
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid JSON format in request body.",
          },
        },
        { status: 400 }
      )
    }

    // Create OpenAI Realtime Session
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set.")
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Server configuration error. Please contact support.",
          },
        },
        { status: 500 }
      )
    }

    let openAIResponse: Response; // Will be assigned in the try block
    try {
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(parsedBody),
      });
      openAIResponse = response; // Assign here

      if (!openAIResponse.ok) {
        const errorBody = await openAIResponse.json().catch(() => ({ // Catch if errorBody itself is not JSON
          message: "OpenAI API request failed with status " + openAIResponse.status,
        }));
        console.error("OpenAI API Error:", openAIResponse.status, errorBody);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "OPENAI_API_ERROR",
              message: `Failed to create OpenAI session: ${errorBody.error?.message || errorBody.message || "Unknown error"}`,
              details: errorBody,
            },
          },
          { status: openAIResponse.status } // Propagate OpenAI's error status
        );
      }
    } catch (fetchError: any) {
      console.error("Error fetching OpenAI API:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Failed to connect to OpenAI API. Please check your network or try again later.",
            details: fetchError.message,
          },
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    // If we reach here, openAIResponse must have been successfully assigned and Response.ok was true.
    // Or, an error occurred and the function returned earlier.
    // The explicit check for !openAIResponse is technically redundant if the catch block for fetch always returns,
    // but it can remain as a safeguard if needed. The main change is assigning to openAIResponse within the try.
    
    // The previous check `if (!openAIResponse)` should now be unnecessary if the logic flow is correct,
    // as an error in fetch would have been caught and returned.
    // If openAIResponse was not assigned due to fetch error, the catch block would have handled it.
    // If openAIResponse.ok was false, it would have returned.
    // Thus, openAIResponse here should be a valid, ok Response.
    const openAIData = await openAIResponse.json();

    // TODO: Consider creating the Interview record in Prisma here, storing openAIData.session_id
    // For now, we'll assume the client handles this or it's done in a subsequent step.

    // Track usage
    await trackUsage(userId, "realtime_session")

    // Deduct a credit
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    })

    // Return the OpenAI session details to the client
    return NextResponse.json({
      success: true,
      data: {
        sessionId: openAIData.session_id,
        ephemeralToken: openAIData.client_secret?.value, // client_secret.value is the ephemeral token
        // You might want to return other relevant data from openAIData if needed
      },
    })
  } catch (error: any) { // Catch any other unexpected errors
    console.error("Error in realtime-session route:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Something went wrong. Please try again.",
        },
      },
      { status: 500 }
    )
  }
}
```
## File: app/api/admin/usage/route.ts
```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getGlobalUsage } from "@/lib/usage-tracking"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    // This is a simple check - in production, you'd want a proper role system
    const adminEmails = ["admin@example.com"] // Replace with actual admin emails
    const isAdmin = user && adminEmails.includes(user.email || "")

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get global usage statistics
    const globalUsage = await getGlobalUsage()

    // Get user statistics
    const userStats = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            interviews: true,
          },
        },
      },
      orderBy: {
        interviews: {
          _count: "desc",
        },
      },
      take: 100,
    })

    // Get recent interviews
    const recentInterviews = await prisma.interview.findMany({
      select: {
        id: true,
        createdAt: true,
        duration: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    return NextResponse.json({
      globalUsage,
      userStats,
      recentInterviews,
    })
  } catch (error) {
    console.error("Error in admin usage route:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
```
## File: app/admin/usage/page.tsx
```
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getGlobalUsage } from "@/lib/usage-tracking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminUsagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Check if user is an admin (you would need to add an isAdmin field to your User model)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })

  // This is a simple check - in production, you'd want a proper role system
  const adminEmails = ["admin@example.com"] // Replace with actual admin emails
  const isAdmin = user && adminEmails.includes(user.email || "")

  if (!isAdmin) {
    redirect("/")
  }

  // Get global usage statistics
  const globalUsage = await getGlobalUsage()

  // Get top users by interview count
  const topUsersByInterviews = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          interviews: true,
        },
      },
    },
    orderBy: {
      interviews: {
        _count: "desc",
      },
    },
    take: 10,
  })

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Usage Statistics</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Interviews</CardTitle>
            <CardDescription>Interviews conducted today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.daily}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Interviews</CardTitle>
            <CardDescription>Interviews conducted this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.monthly}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Interviews</CardTitle>
            <CardDescription>All-time interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.interviews.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Feedback</CardTitle>
            <CardDescription>Feedback generated today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.daily}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Feedback</CardTitle>
            <CardDescription>Feedback generated this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.monthly}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Feedback</CardTitle>
            <CardDescription>All-time feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{globalUsage.feedback.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Users by Interview Count</CardTitle>
          <CardDescription>Users who have conducted the most interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Interviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsersByInterviews.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user._count.interviews}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```
