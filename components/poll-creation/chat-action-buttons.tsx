import { Button } from '@/components/ui/button';
import { Eye, Send, RotateCcw, Loader2 } from 'lucide-react';

interface ChatActionButtonsProps {
  actions: string[];
  onAction: (action: string) => void;
  isLoading?: boolean;
}

export function ChatActionButtons({ actions, onAction, isLoading }: ChatActionButtonsProps) {
  const getActionConfig = (action: string) => {
    switch (action) {
      case 'preview':
        return {
          label: 'Show Preview',
          icon: Eye,
          variant: 'outline' as const,
        };
      case 'create':
        return {
          label: 'Create Poll',
          icon: Send,
          variant: 'default' as const,
        };
      case 'reset':
        return {
          label: 'Start Over',
          icon: RotateCcw,
          variant: 'ghost' as const,
        };
      default:
        return {
          label: action,
          icon: null,
          variant: 'outline' as const,
        };
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const config = getActionConfig(action);
        const Icon = config.icon;

        return (
          <Button
            key={action}
            variant={config.variant}
            size="sm"
            onClick={() => onAction(action)}
            disabled={isLoading}
            className="text-sm"
          >
            {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
