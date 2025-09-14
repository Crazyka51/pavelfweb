'use client';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import MediaManager from './MediaManager';
import { useState } from 'react';

interface MediaPickerDialogProps {
  onSelectMedia: (url: string) => void
  trigger?: React.ReactNode
}

export default function MediaPickerDialog({
  onSelectMedia,
  trigger
}: MediaPickerDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSelectMedia = (url: string) => {
    onSelectMedia(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Vybrat médium
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Správce médií</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <MediaManager onSelectMedia={handleSelectMedia} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
