---
name: Samadhan Setu Jharkhand
colors:
  surface: '#faf9fd'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#090b0c'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f2223'
  on-tertiary-container: '#87898a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
typography:
  headline-xl:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system for this platform is built on the principles of **Modern Corporate Governance**. It balances the authority of a state institution with the accessibility of a modern tech startup. The aesthetic is professional, trustworthy, and highly organized, ensuring that citizens, educational institutions, and government officials feel a sense of security and efficiency.

The design style is **Corporate / Modern**, leaning into a structured grid and clean, functional layers. It avoids unnecessary decoration, focusing instead on clarity, ease of navigation, and a high signal-to-noise ratio. The emotional response should be one of reliability and progress—bridging the gap between the people of Jharkhand and effective governance.

## Colors
The color palette is anchored by **Navy Blue**, representing stability and institutional strength. **Accent Gold** is used sparingly for primary actions, high-level highlights, and official seals, providing a sense of prestige. 

The neutral palette utilizes cool grays to maintain a clean environment for data-heavy dashboards. Status indicators (Success, Warning, Danger) are calibrated for high legibility against white and light gray backgrounds to ensure critical alerts are immediately recognizable across all portals.

## Typography
This design system employs a dual-font strategy to differentiate between structure and content. **Poppins** is used for headlines to provide a modern, friendly yet professional character. **Inter** is used for all body text, labels, and data points due to its exceptional legibility at small sizes and high x-height, which is critical for complex dashboards.

Maintain a clear hierarchy by using weight (SemiBold/Bold) for headers and regular weights for descriptions. In the Government Analytics and HEI dashboards, prioritize `body-sm` for table data and `label-md` for column headers to maximize information density without sacrificing clarity.

## Layout & Spacing
The layout follows a **Fluid Grid** system. For the Citizen Portal (Mobile-first), use a single-column stack with generous vertical padding to facilitate touch interactions. For the Dashboard portals (HEI, Industry, Analytics), utilize a 12-column grid.

- **Sidebars:** Dashboards should use a fixed left sidebar (280px) with a collapsible state for smaller screens.
- **Content Area:** Use an 8px base scaling system for all margins and padding. 
- **Data Grids:** In the Analytics portal, use compact spacing (8px gutters) within tables to allow for multi-column comparisons, while maintaining large outer margins (24px+) to prevent visual clutter.

## Elevation & Depth
To maintain a modern professional look, the system uses **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (Background):** Solid `#F8F9FA`.
2.  **Level 1 (Cards/Sidebar):** Pure white `#FFFFFF` with a 1px border in `#E9ECEF`.
3.  **Level 2 (Dropdowns/Modals):** Pure white with a soft, diffused shadow (0px 8px 24px rgba(0, 33, 71, 0.08)).

Avoid heavy black shadows. Instead, use the Primary Navy Blue at very low opacity (5-10%) for shadow tints to maintain color harmony and a "tech-forward" feel.

## Shapes
The shape language is **Rounded (Level 2)**. This balances the "hard" nature of government data with a "soft" and approachable user experience. 

- **Standard Elements (Buttons, Inputs):** 8px (0.5rem) corner radius.
- **Containers (Cards, Section Blocks):** 12px (0.75rem) to 16px (1rem) corner radius.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Navy Blue background, white text. High emphasis.
- **Secondary:** White background, Navy Blue border and text.
- **Accent:** Gold background, Navy Blue text. Reserved for "Submit" or "Apply" actions on Citizen portals.
- **Size:** 48px height for mobile/citizen, 40px for desktop dashboards.

### Cards
Cards are the primary container for information. They must feature a 1px light gray border and a soft shadow on hover. For the HEI and Industry portals, cards should include a consistent "Header" section with a title and an optional action icon.

### Form Inputs
Inputs should have a 1px border that turns Primary Navy Blue on focus. Labels must always be visible (no floating labels that disappear) to ensure accessibility. Error states must use the Danger Red color for both the border and the helper text.

### Status Badges
Used extensively for grievance tracking and application status.
- **Pending:** Neutral Gray.
- **In Progress:** Primary Navy Blue.
- **Approved/Resolved:** Success Green.
- **Rejected/Action Required:** Danger Red.

### Data Tables (Dashboard Specific)
Tables should use zebra-striping with a very light gray (`#F1F3F5`) for readability. Headers should be sticky and use the `label-md` typography style.

### Progress Steppers
For citizen applications, use a vertical or horizontal stepper to break down long forms into manageable chunks, providing clear feedback on the user's current stage in the process.