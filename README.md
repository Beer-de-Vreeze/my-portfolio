# Beer de Vreeze - Game Portfolio

A modern, responsive portfolio website showcasing my game development projects and software engineering journey. Built with Next.js, TypeScript, and Tailwind CSS.

## Key Features

- **Interactive Project Cards**: Detailed modals with media carousels, code snippets, and download links
- **Touch Gesture Support**: Swipe navigation for mobile devices
- **Video & YouTube Integration**: Embedded media with custom controls and fullscreen support
- **Dynamic Tech Stack Display**: Visual technology badges with hover effects
- **Contact Form**: Server-side email integration for direct communication
- **File Downloads**: Direct access to game builds and project files
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router & Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) & [Lucide React](https://lucide.dev/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) & [Devicons](https://devicon.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Code Highlighting**: [Highlight.js](https://highlightjs.org/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Progress Bar**: [NProgress](https://ricostacruz.com/nprogress/)
- **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

```text
src/
├── app/                 # Next.js App Router pages
│   ├── about/          # About page with personal info
│   ├── contact/        # Contact page with form
│   ├── projects/       # Projects showcase page
│   ├── lib/            # Utility functions and configurations
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── about/          # About page specific components
│   ├── projects/       # Project related components
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility components and functions
│   └── ...             # Other shared components
├── pages/api/          # API routes for server-side functionality
├── styles/             # CSS modules and component styles
└── public/             # Static assets (images, downloads, favicon)
    ├── images/         # Project screenshots and media
    ├── downloads/      # Downloadable files (games, CV)
    └── favicon/        # Favicon and app icons
```

## Featured Projects

- **Bearly Stealth**: A stealth-based game featuring intelligent AI hunters and environmental interactions
- **AI Movement Training**: Machine learning experiments demonstrating game AI behavior and training
- **LP Cafe**: Interactive visual novel with dialogue system and character interactions
- **Sketching Spells**: Creative spell-casting game with drawing-based mechanics
- **Better Tetris**: Enhanced Tetris implementation with modern features
- **Audio Previewer**: Desktop application for efficient audio file management and preview

## Design Features

- **Modern UI/UX**: Clean, dark-themed interface with glass morphism effects
- **Interactive Media Carousel**: Touch-friendly slideshow with autoplay and gesture controls
- **Responsive Design**: Mobile-first approach optimized for all device sizes
- **Advanced Animations**: Smooth transitions powered by Framer Motion
- **Code Syntax Highlighting**: Collapsible code snippets with copy functionality
- **Progressive Loading**: Optimized image loading with blur placeholders
- **Accessibility**: Keyboard navigation and screen reader support
- **Modern Typography**: Beautiful font hierarchy with proper contrast ratios

## Responsive Design

The portfolio is fully responsive and tested across:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build optimized production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Code Quality & Performance

- **TypeScript**: Full type safety across the entire codebase
- **ESLint**: Automated code quality and consistency checks
- **Tailwind CSS**: Utility-first CSS with purging for optimal bundle size
- **Next.js 15**: Latest features including App Router and Turbopack for fast development
- **Component Architecture**: Modular, reusable React components with clear separation of concerns
- **Performance Optimizations**: Image optimization, lazy loading, and efficient bundle splitting

## Deployment

This project is optimized for deployment on Vercel with automatic optimizations:

### Vercel Deployment

1. Fork or clone this repository
2. Connect your repository to [Vercel](https://vercel.com/)
3. Configure environment variables for email functionality
4. Deploy with automatic CI/CD on every push

### Environment Variables

```bash
# Email configuration (optional - for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@gmail.com
```

### Performance Features

- Automatic image optimization and WebP conversion
- Edge runtime for API routes
- Static generation for optimal loading speeds
- Automatic code splitting and tree shaking

## Contact

- **Email**: [beer@vreeze.com](mailto:beer@vreeze.com)
- **GitHub**: [Beer-de-Vreeze](https://github.com/bjeer.peer)
- **LinkedIn**: [beer-de-vreeze](https://www.linkedin.com/in/beer-de-vreeze-59040919a/)
- **Itch.io**: [bjeerpeer](https://bjeerpeer.itch.io/)

## License

This project is personal portfolio work. Please contact me if you'd like to use any part of this code.

---

Built with love by Beer de Vreeze
