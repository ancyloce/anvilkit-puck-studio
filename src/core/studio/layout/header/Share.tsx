'use client';

import * as React from 'react';
import { Link2, Check, Users, Globe, Lock } from 'lucide-react';
import {
  Popover,
  PopoverPanel,
  PopoverTrigger,
  PopoverTitle,
} from '@/components/animate-ui/components/base/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collaborators } from './Collaborators';
import { useMsg } from '@/store/hooks';

type Access = 'private' | 'anyone-view' | 'anyone-edit';

export const Share = () => {
  const [access, setAccess] = React.useState<Access>('private');
  const [copied, setCopied] = React.useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareButton = useMsg('share.button');
  const shareTitle = useMsg('share.title');
  const peopleWithAccess = useMsg('share.people-with-access');
  const generalAccess = useMsg('share.general-access');
  const copyLabel = useMsg('share.copy');
  const copiedLabel = useMsg('share.copied');

  const ACCESS_OPTIONS: { value: Access; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'private',
      label: useMsg('share.access.private.label'),
      description: useMsg('share.access.private.description'),
      icon: <Lock className="w-4 h-4" />,
    },
    {
      value: 'anyone-view',
      label: useMsg('share.access.anyone-view.label'),
      description: useMsg('share.access.anyone-view.description'),
      icon: <Globe className="w-4 h-4" />,
    },
    {
      value: 'anyone-edit',
      label: useMsg('share.access.anyone-edit.label'),
      description: useMsg('share.access.anyone-edit.description'),
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="outline" />}>
        <Link2 className="h-4 w-4" />
        {shareButton}
      </PopoverTrigger>
      <PopoverPanel side="bottom" align="end" className="w-80 flex flex-col gap-3">
        <PopoverTitle className="text-base font-medium">{shareTitle}</PopoverTitle>

        {/* Collaborators */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{peopleWithAccess}</span>
          <Collaborators />
        </div>

        <Separator />

        {/* Access level */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{generalAccess}</span>
          {ACCESS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAccess(opt.value)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {access === opt.value && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>

        <Separator />

        {/* Copy link */}
        <div className="flex gap-2">
          <Input readOnly value={shareUrl} className="flex-1 text-xs" />
          <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? copiedLabel : copyLabel}
          </Button>
        </div>
      </PopoverPanel>
    </Popover>
  );
};
