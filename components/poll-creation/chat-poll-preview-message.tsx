import { PartialPollData } from '@/lib/ai/poll-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Eye, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPollPreviewMessageProps {
  pollData: PartialPollData;
}

export function ChatPollPreviewMessage({ pollData }: ChatPollPreviewMessageProps) {
  const isFieldComplete = (value: any) => value !== null && value !== undefined;

  return (
    <Card className="border-purple-600/20 bg-purple-600/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Poll Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Question */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isFieldComplete(pollData.question) ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs font-medium">Question</span>
          </div>
          <div
            className={cn(
              'rounded-md border p-2.5 text-sm',
              isFieldComplete(pollData.question)
                ? 'border-green-600/20 bg-green-600/5'
                : 'border-dashed'
            )}
          >
            {pollData.question || 'Question will appear here...'}
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isFieldComplete(pollData.options) && pollData.options!.length >= 2 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs font-medium">
              Options {pollData.options ? `(${pollData.options.length})` : ''}
            </span>
          </div>
          <div className="space-y-1.5">
            {pollData.options && pollData.options.length > 0 ? (
              pollData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border border-green-600/20 bg-green-600/5 p-2 text-sm"
                >
                  <Circle className="h-2.5 w-2.5 text-muted-foreground" />
                  <span>{option}</span>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-2.5">
                <p className="text-xs text-muted-foreground">Options will appear here...</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Duration */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Duration</span>
            </div>
            <Badge variant={isFieldComplete(pollData.durationInDays) ? 'default' : 'outline'} className="text-xs">
              {pollData.durationInDays ? `${pollData.durationInDays} days` : 'Not set'}
            </Badge>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Vote className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Category</span>
            </div>
            <Badge variant={isFieldComplete(pollData.category) ? 'default' : 'outline'} className="text-xs">
              {pollData.category || 'Not set'}
            </Badge>
          </div>

          {/* Voting Type */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Voting Type</span>
            </div>
            <Badge variant={isFieldComplete(pollData.votingType) ? 'default' : 'outline'} className="text-xs">
              {pollData.votingType || 'Not set'}
            </Badge>
          </div>

          {/* Visibility */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Visibility</span>
            </div>
            <Badge variant={isFieldComplete(pollData.visibility) ? 'default' : 'outline'} className="text-xs">
              {pollData.visibility || 'Not set'}
            </Badge>
          </div>
        </div>

        {/* Reward Pool */}
        {pollData.rewardPool && pollData.rewardPool !== '0' && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-medium">Reward Pool</span>
            </div>
            <Badge variant="secondary" className="text-xs">{pollData.rewardPool} POL</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
