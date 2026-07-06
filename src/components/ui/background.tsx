import { StarsBackground } from './stars.tsx';
import { cn } from '@/lib/utils';
// Assuming useTheme is not installed or available, let's just make it dark/light based on class or pass a prop, but wait, the original used next-themes. We'll just hardcode or omit useTheme for a plain React app if next-themes isn't there, or keep it if it is. Let's see if next-themes is installed. Let's just use dark theme by default since it looks like a dark theme app based on the text reveal and vibe.

export const StarsBackgroundDemo = () => {
  return (
    <StarsBackground
      starColor="rgba(0, 0, 0, 0.15)"
      className={cn(
        'fixed inset-0 z-0',
        'bg-[#F9F8F6] pointer-events-none'
      )}
    />
  );
};
