import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeContext } from '@/contexts/theme-context';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes, useContext, useState } from 'react';

export function ThemeSwitch({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { setMode } = useContext(ThemeContext);
    const { appearance } = useAppearance();
    const init = () => (localStorage.getItem('appearance') as Appearance) || appearance;
    const [theme, setTheme] = useState(init());

    const tabs: { value: Appearance; icon: LucideIcon }[] = [
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
        { value: 'system', icon: Monitor },
    ];

    const updateMode = (value: Appearance) => {
        setTheme(value);
        setMode(value);
        localStorage.setItem('appearance', value);
    };

    return (
        <div className={cn('inline-flex gap-1', className)} {...props}>
            {tabs.map(({ value, icon: Icon }) => (
                <TooltipProvider key={value}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => updateMode(value)}
                                className={cn(
                                    'flex cursor-pointer items-center rounded-md px-1.5 py-1.5 transition-colors',
                                    theme == value
                                        ? 'text-inst-secondary'
                                        : 'hover:text-inst-secondary/50 dark:hover:text-inst-secondary/50 text-neutral-500 dark:text-neutral-400',
                                )}
                            >
                                <Icon className="-ml-1 h-3 w-3" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="capitalize">{value} </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}
