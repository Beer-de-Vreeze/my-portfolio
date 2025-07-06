import { ReactNode, MouseEvent, KeyboardEvent } from "react";

/**
 * Card size variants with their corresponding dimensions
 * Using responsive design patterns for optimal display across devices
 */
export const CARD_VARIANTS = {
  compact: 'w-[90vw] max-w-[500px] h-[200px] md:w-[500px] md:h-[250px] lg:w-[550px] lg:h-[280px] xl:w-[600px] xl:h-[300px]',
  default: 'w-[95vw] max-w-[600px] h-[250px] md:w-[600px] md:h-[297px] lg:w-[650px] lg:h-[330px] xl:w-[700px] xl:h-[360px] 2xl:w-[750px] 2xl:h-[390px]',
  large: 'w-[98vw] max-w-[800px] h-[300px] md:w-[700px] md:h-[350px] lg:w-[750px] lg:h-[380px] xl:w-[800px] xl:h-[420px] 2xl:w-[850px] 2xl:h-[450px]'
} as const;

/**
 * Union type for all available card variants
 */
export type CardVariant = keyof typeof CARD_VARIANTS;

/**
 * Card interaction states for managing hover, focus, and pressed states
 */
export interface CardInteractionState {
  /** Whether the card is currently being hovered */
  isHovered: boolean;
  /** Whether the card is currently pressed/active */
  isPressed: boolean;
  /** Whether the card currently has focus */
  isFocused: boolean;
}

/**
 * Performance optimization options for the card component
 */
export interface CardPerformanceOptions {
  /** Whether to prefetch the route immediately (for high-priority cards) */
  priority?: boolean;
  /** Delay in milliseconds before prefetching on hover (default: 100ms) */
  prefetchDelay?: number;
  /** Whether to enable view transitions for navigation */
  enableViewTransition?: boolean;
}

/**
 * Accessibility configuration for the card component
 */
export interface CardAccessibilityProps {
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional aria-describedby reference */
  ariaDescribedBy?: string;
  /** Role override for the card element */
  role?: 'button' | 'link' | 'article' | 'card';
  /** Tab index override for custom focus management */
  tabIndex?: number;
}

/**
 * Event handlers for card interactions
 */
export interface CardEventHandlers {
  /** Custom click handler (called after default navigation handling) */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Custom mouse enter handler */
  onMouseEnter?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Custom mouse leave handler */
  onMouseLeave?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Custom keyboard event handler */
  onKeyDown?: (event: KeyboardEvent<HTMLAnchorElement>) => void;
  /** Custom focus handler */
  onFocus?: (event: React.FocusEvent<HTMLAnchorElement>) => void;
  /** Custom blur handler */
  onBlur?: (event: React.FocusEvent<HTMLAnchorElement>) => void;
}

/**
 * Enhanced props interface for the BaseCard component with improved type safety
 * and comprehensive configuration options
 */
export interface BaseCardProps extends 
  CardPerformanceOptions, 
  CardAccessibilityProps, 
  Partial<CardEventHandlers> {
  /** Content to be rendered inside the card */
  children: ReactNode;
  
  /** Navigation URL for the card link */
  href: string;
  
  /** Additional CSS classes to apply to the card */
  className?: string;
  
  /** Whether the card is disabled (non-interactive) */
  disabled?: boolean;
  
  /** Size variant of the card */
  variant?: CardVariant;
  
  /** Whether to show loading state */
  loading?: boolean;
  
  /** Custom data attributes for testing or analytics */
  'data-testid'?: string;
  'data-analytics'?: string;
}

/**
 * Props for card containers that manage multiple cards
 */
export interface CardContainerProps {
  /** Array of card configurations */
  cards: ReadonlyArray<Omit<BaseCardProps, 'children'>>;
  /** Layout configuration for the card grid */
  layout?: 'grid' | 'masonry' | 'flex';
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Maximum number of columns in grid layout */
  maxColumns?: number;
}

/**
 * Type guard to check if a variant is valid
 */
export const isValidCardVariant = (variant: string): variant is CardVariant => {
  return variant in CARD_VARIANTS;
};

/**
 * Utility type for extracting card variant classes
 */
export type CardVariantClasses = typeof CARD_VARIANTS[CardVariant];

/**
 * Default values for card props
 */
export const CARD_DEFAULTS = {
  variant: 'default' as const,
  disabled: false,
  priority: false,
  prefetchDelay: 100,
  enableViewTransition: false,
  role: 'button' as const,
  tabIndex: 0
} satisfies Partial<BaseCardProps>;

/**
 * Type for card component ref
 */
export interface CardRef {
  /** The underlying anchor element */
  element: HTMLAnchorElement | null;
  /** Focus the card programmatically */
  focus: () => void;
  /** Blur the card programmatically */
  blur: () => void;
  /** Trigger click programmatically */
  click: () => void;
}
