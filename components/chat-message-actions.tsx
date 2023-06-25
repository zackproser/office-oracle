'use client'

import { type Message } from 'ai'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy, IconUser } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

import AudioStream from '@/components/audio-stream'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const [isPlayed, setPlayed] = useState<Boolean>(false)

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const speakMichael = () => {
    if (isPlayed) return
    AudioStream({ text: message.content })
    setPlayed(true)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
      </Button>
      <Button variant="ghost" size="icon" onClick={speakMichael}>
        <IconUser />
      </Button>
      <span className="sr-only">Copy message</span>
    </div>
  )
}
