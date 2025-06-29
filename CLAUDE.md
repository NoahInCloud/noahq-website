# CLAUDE.md

This file provides guidance when working with the NoahQ.ai website codebase.

## Project Overview

NoahQ.ai is a static website for an AI consultancy business that helps companies implement practical AI solutions. The site showcases services, process, solutions, and contact information for the global AI consulting team.

## 🚨 CRITICAL INSTRUCTIONS - ALWAYS START WITH THIS 🚨

**FOR EVERY TASK, YOU MUST:**
> "Ultrathink your way through this. Use parallel agents to investigate these issues. Then come up with a plan to solve them."

- **ALWAYS** use deep analysis before taking any action
- **ALWAYS** launch multiple parallel agents for thorough research
- **ALWAYS** create comprehensive plans before implementation
- **NEVER** skip the investigation phase
- **ALWAYS** use TodoWrite to track all tasks and show progress

## Project Structure

```
noahq-website/
├── index.html              # Main landing page
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet with CSS custom properties
│   ├── images/            # Company and technology logos
│   │   ├── claude-logo.svg
│   │   ├── elevenlabs-logo.svg
│   │   ├── make-logo.svg
│   │   ├── n8n-logo.svg
│   │   └── openai-logo.svg
│   └── js/
│       └── main.js        # Interactive features and animations
├── CLAUDE.md              # This file (project guidelines)
```

## Technology Stack

### Frontend
- **HTML5**: Semantic markup with modern standards
- **CSS3**: Custom properties (CSS variables), Flexbox, Grid
- **Vanilla JavaScript**: No frameworks, pure DOM manipulation
- **Modern Web APIs**: Intersection Observer, Smooth Scrolling

### Core Technologies Showcased
- **Claude AI**: Anthropic's AI assistant
- **OpenAI**: GPT models and APIs
- **Make.com**: No-code automation platform
- **n8n**: Open-source workflow automation
- **ElevenLabs**: Voice AI technology

## Design System

### CSS Custom Properties (Variables)
Located in `:root` of `style.css`:

```css
--primary-bg: #0a0a0a          /* Main background */
--surface-bg: rgba(255, 255, 255, 0.05)  /* Card backgrounds */
--text-primary: #ffffff         /* Main text */
--text-secondary: #cccccc       /* Secondary text */
--accent-gradient: linear-gradient(135deg, #ff6b35, #f7931e, #ffd700)
```

### Color Scheme
- **Primary**: Dark theme (#0a0a0a background)
- **Accent**: Orange to gold gradient
- **Text**: White primary, light gray secondary
- **Surfaces**: Semi-transparent white overlays

### Typography
- **Font Stack**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)
- **Features**: Optimized rendering, antialiasing, kerning

### Spacing System
- `--spacing-xs`: 0.5rem
- `--spacing-sm`: 1rem
- `--spacing-md`: 2rem
- `--spacing-lg`: 4rem
- `--spacing-xl`: 6rem

## Development Guidelines

### HTML Best Practices
- Use semantic HTML5 elements (`<section>`, `<nav>`, `<header>`, etc.)
- Include proper meta tags for SEO
- Maintain accessibility with proper alt text and ARIA labels
- Use meaningful class names following BEM-like conventions

### CSS Best Practices
- Leverage CSS custom properties for consistency
- Use modern layout methods (Flexbox, Grid)
- Implement responsive design principles
- Maintain consistent spacing using the spacing system
- Use transitions for smooth interactions

### JavaScript Best Practices
- Use modern ES6+ syntax
- Implement progressive enhancement
- Add proper error handling
- Use event delegation where appropriate
- Optimize performance with efficient DOM queries

## Key Features & Components

### Navigation
- Fixed navbar with scroll effect
- Smooth scrolling anchor links
- Responsive hamburger menu (when implemented)

### Hero Section
- Status indicator with online dot
- Animated title with gradient highlight
- Call-to-action buttons
- Mouse parallax effect on background pattern

### Technology Showcase
- Logo grid with hover effects
- Staggered animations on scroll
- SVG logos for scalability

### Services Grid
- 6 main service offerings
- Icon + title + description + features format
- Consistent card layout

### Process Timeline
- 6-step numbered process
- Timeline with duration indicators
- Clear step descriptions

### Solutions/Packages
- 3-tier pricing structure
- Featured package highlighting
- Price ranges and timelines

### Interactive Elements
- Smooth scroll navigation
- Intersection Observer animations
- Mouse move parallax effects
- Hover states and transitions

## Content Management

### Business Information
- **Company**: NoahQ.ai
- **Email**: hello@noahq.ai
- **Focus**: Practical AI implementation without hype
- **Team**: Global, remote-first
- **Response Time**: Within 24 hours

### Service Categories
1. **AI Strategy & Consulting**
2. **Automation & Workflows**
3. **Conversational AI**
4. **Data Intelligence**
5. **Custom AI Development**
6. **AI Training & Support**

### Solution Packages
1. **AI Starter**: $5K-$15K (2-4 weeks)
2. **AI Accelerator**: $25K-$75K (6-12 weeks) - Most Popular
3. **Enterprise AI**: $100K+ (3-6 months)

## Development Commands

### Local Development
```bash
# Serve locally (various options)
python -m http.server 8000
python3 -m http.server 8000
npx serve .
npx live-server .

# Open in browser
open http://localhost:8000
```

### File Operations
```bash
# Check file structure
find . -type f -name "*.html" -o -name "*.css" -o -name "*.js"

# Validate HTML (if html5validator installed)
html5validator --root .

# Optimize images (if imagemin installed)
imagemin assets/images/* --out-dir=assets/images/optimized
```

### Quality Checks
```bash
# Check for broken links (if linkchecker installed)
linkchecker index.html

# Validate CSS (if csslint installed)
csslint assets/css/style.css

# Check JavaScript (if jshint installed)
jshint assets/js/main.js
```

## Performance Considerations

### Optimization Opportunities
- **Images**: Ensure SVGs are optimized, consider WebP for raster images
- **CSS**: Minify for production
- **JavaScript**: Bundle and minify if needed
- **Fonts**: Use font-display: swap for system fonts
- **Critical CSS**: Consider inlining above-the-fold styles

### Loading Strategy
- CSS in `<head>` for render-blocking
- JavaScript before `</body>` for non-blocking
- Lazy load images below the fold if implemented
- Use Intersection Observer for scroll animations

## SEO & Accessibility

### Current SEO Elements
- Semantic HTML structure
- Meta description and title tags
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images
- Clean URL structure

### Accessibility Features
- Semantic markup
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader compatibility

### Enhancement Opportunities
- Add more structured data (JSON-LD)
- Implement Open Graph tags
- Add favicon and app icons
- Consider adding robots.txt and sitemap.xml

## Content Updates

### Adding New Services
1. Update the services grid in `index.html`
2. Add corresponding service icon
3. Update navigation if needed
4. Maintain consistent formatting

### Modifying Pricing
1. Update solution cards in the solutions section
2. Ensure pricing consistency across the site
3. Update any references in FAQ or other sections

### Technology Updates
1. Add new logo to `assets/images/`
2. Update technology grid in HTML
3. Update footer technology list
4. Ensure logo styling consistency

## Browser Support

### Target Browsers
- Chrome 80+ (95%+ coverage)
- Safari 13+ (iOS 13+)
- Firefox 75+
- Edge 80+

### Progressive Enhancement
- Core functionality works without JavaScript
- CSS Grid with Flexbox fallbacks
- Intersection Observer with fallback handling
- Modern CSS features with reasonable fallbacks

## Deployment Considerations

### Static Hosting Options
- **Netlify**: Drag-and-drop or Git integration
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: With CloudFront CDN
- **Cloudflare Pages**: Fast global distribution

### Pre-deployment Checklist
- [ ] Test all anchor links work correctly
- [ ] Verify all images load properly
- [ ] Check responsive design on different screen sizes
- [ ] Test JavaScript interactions
- [ ] Validate HTML and CSS
- [ ] Check page load performance
- [ ] Verify contact form/email links work
- [ ] Test cross-browser compatibility

## Security Considerations

### Static Site Security
- No server-side vulnerabilities
- Ensure external links use HTTPS
- Validate any user input if forms are added
- Use CSP headers if hosting supports them
- Keep dependencies updated if any are added

## Maintenance Tasks

### Regular Updates
- Update copyright year in footer
- Review and update pricing information
- Keep technology logos current
- Update team information
- Refresh FAQ content based on client questions

### Performance Monitoring
- Check Core Web Vitals regularly
- Monitor page load speeds
- Audit accessibility compliance
- Review mobile usability
- Check for broken links

## Common Modifications

### Adding New Sections
1. Create HTML structure following existing patterns
2. Add CSS styles maintaining design system
3. Update navigation if needed
4. Add JavaScript interactions if required
5. Test responsiveness and accessibility

### Styling Changes
1. Modify CSS custom properties in `:root` for theme changes
2. Use existing spacing and color variables
3. Maintain consistent component patterns
4. Test across different screen sizes

### Interactive Features
1. Follow existing JavaScript patterns
2. Use modern APIs (Intersection Observer, etc.)
3. Provide fallbacks for older browsers
4. Test performance impact

## Best Practices Summary

1. **Always investigate thoroughly** before making changes
2. **Use parallel agents** for comprehensive research
3. **Create detailed plans** with TodoWrite
4. **Maintain design system consistency**
5. **Follow semantic HTML practices**
6. **Optimize for performance and accessibility**
7. **Test across browsers and devices**
8. **Keep content accurate and up-to-date**
9. **Follow progressive enhancement principles**
10. **Document significant changes**

Remember: This is a business-critical website representing NoahQ.ai's professional brand. Maintain high quality standards and thoroughly test any changes before deployment.