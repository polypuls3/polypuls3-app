import { PartialPollData } from '@/lib/ai/poll-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Eye, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollPreviewPanelProps {
  pollData: PartialPollData;
}

export function PollPreviewPanel({ pollData }: PollPreviewPanelProps) {
  const isFieldComplete = (value: any) => value !== null && value !== undefined;

  return (
    <div className="h-full overflow-y-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Poll Preview
          </CardTitle>
          <CardDescription>Live preview of your poll as you build it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isFieldComplete(pollData.question) ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Question</span>
            </div>
            <div
              className={cn(
                'rounded-lg border p-3',
                isFieldComplete(pollData.question)
                  ? 'border-green-600/20 bg-green-600/5'
                  : 'border-dashed'
              )}
            >
              <p className="text-sm">
                {pollData.question || 'Question will appear here...'}
              </p>
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isFieldComplete(pollData.options) && pollData.options!.length >= 2 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                Options {pollData.options ? `(${pollData.options.length})` : ''}
              </span>
            </div>
            <div className="space-y-2">
              {pollData.options && pollData.options.length > 0 ? (
                pollData.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/5 p-2"
                  >
                    <Circle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{option}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-3">
                  <p className="text-sm text-muted-foreground">Options will appear here...</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3">
            {/* Duration */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <Badge variant={isFieldComplete(pollData.durationInDays) ? 'default' : 'outline'}>
                {pollData.durationInDays ? `${pollData.durationInDays} days` : 'Not set'}
              </Badge>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Vote className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Category</span>
              </div>
              <Badge variant={isFieldComplete(pollData.category) ? 'default' : 'outline'}>
                {pollData.category || 'Not set'}
              </Badge>
            </div>

            {/* Voting Type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Voting Type</span>
              </div>
              <Badge variant={isFieldComplete(pollData.votingType) ? 'default' : 'outline'}>
                {pollData.votingType || 'Not set'}
              </Badge>
            </div>

            {/* Visibility */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Visibility</span>
              </div>
              <Badge variant={isFieldComplete(pollData.visibility) ? 'default' : 'outline'}>
                {pollData.visibility || 'Not set'}
              </Badge>
            </div>
          </div>

          {/* Reward Pool */}
          {pollData.rewardPool && pollData.rewardPool !== '0' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Reward Pool</span>
              </div>
              <Badge variant="secondary">{pollData.rewardPool} POL</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
