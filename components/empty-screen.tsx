import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

import OfficeOracle from '@/app/oracle-images/office-oracle-7.png'
import Image from 'next/image'

import OracleImage from '@/components/office-oracle-image'


const exampleMessages = [
  {
    heading: 'Tell me about some The Office characters',
    message: `How would you describe Jim?`
  },
  {
    heading: 'Explain a situation that occurred in The Office',
    message: 'What is one of the grossest things that happened in The Office?'
  },
  {
    heading: 'Answer some Office trivia questions',
    message: 'What are some interesting things that occurred during Halloween?'
  },
  {
    heading: 'Draft an email',
    message: `Draft a humorous email to my boss: I'm going to be late because I discovered YouTube`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to the Office Oracle!
        </h1>

        {OracleImage()}

        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
