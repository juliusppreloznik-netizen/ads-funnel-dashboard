/**
 * Survey CSS Generation Prompt Builder
 * Generates custom CSS to style GoHighLevel survey forms
 */

export function buildSurveyCssPrompt(accentColor: string) {
  return `You are a CSS expert specializing in GoHighLevel survey form styling.

Generate custom CSS that styles a GoHighLevel survey form to match a high-converting funnel aesthetic.

ACCENT COLOR: ${accentColor}

REQUIREMENTS:

1. **Button Styling:**
   - Primary button background: ${accentColor}
   - Hover state: 15% brighter
   - Border-radius: 8-12px (modern, not too round)
   - Padding: 14px 32px
   - Font-weight: 600-700
   - Transition: all 0.3s ease
   - Hover transform: translateY(-2px)
   - Box-shadow on hover: 0 8px 30px with accent color at 40% opacity

2. **Input Fields:**
   - Background: #111111 (dark card background)
   - Border: 1px solid #1a1a1a
   - Border-radius: 8px
   - Padding: 12px 16px
   - Color: #ffffff (white text)
   - Focus state: border color changes to accent color
   - Focus box-shadow: 0 0 0 3px with accent color at 20% opacity

3. **Typography:**
   - Question labels: #ffffff (white), font-weight 600
   - Helper text: #888888 (muted gray)
   - Error messages: #ef4444 (red)

4. **Form Container:**
   - Background: #0a0a0a (dark background)
   - If there's a form card/container, use #111111 with 1px border #1a1a1a

5. **Radio/Checkbox Styling:**
   - Custom styled with accent color for checked state
   - Border: 2px solid #1a1a1a when unchecked
   - Border: 2px solid ${accentColor} when checked
   - Background: ${accentColor} when checked

6. **Progress Bar (if applicable):**
   - Background: #1a1a1a
   - Fill color: ${accentColor}
   - Height: 6-8px
   - Border-radius: 100px

7. **Mobile Responsive:**
   - Ensure all elements stack properly on mobile
   - Touch-friendly button sizes (min 44px height)

OUTPUT FORMAT:
Return ONLY the CSS code. No explanations. No markdown code blocks. Just raw CSS that can be copy-pasted directly into GoHighLevel's custom CSS field.

Start with a comment indicating the accent color:
/* Survey CSS - Accent Color: ${accentColor} */

Then provide all the CSS rules.`;
}

export function parseSurveyCssResponse(response: string): string {
  // The response should already be pure CSS
  // Remove any markdown code blocks if present
  let css = response.trim();
  
  // Remove markdown code block markers if present
  css = css.replace(/^```css\n?/i, '');
  css = css.replace(/^```\n?/i, '');
  css = css.replace(/\n?```$/i, '');
  
  return css.trim();
}
