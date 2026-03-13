'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AVATARS = [
  {
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
    fallback: 'JH',
    name: 'Jhey',
    role: 'Editor (you)',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg',
    fallback: 'DH',
    name: 'David Haz',
    role: 'Editor',
  },
];

const [currentUser, ...others] = AVATARS;

export const CollaboratorsPopover = () => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button className="rounded-full ring-2 ring-background focus:outline-none focus-visible:ring-primary" />
        }
      >
        <Avatar className="size-6">
          <AvatarImage src={currentUser.src} />
          <AvatarFallback>{currentUser.fallback}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-64 gap-3">
        <PopoverTitle className="text-sm font-medium">Collaborators</PopoverTitle>
        <div className="flex flex-col gap-2">
          {[currentUser, ...others].map((user) => (
            <div key={user.fallback} className="flex items-center gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user.src} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
