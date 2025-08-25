// @ts-nocheck
import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useStudentSearch } from '@/context/student-search-context'
import { Button } from '@/components/ui/button'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function StudentSearch({
  className = '',
  placeholder = 'Search'
}: Props) {
  const { setOpen } = useStudentSearch()

  return (
    <Button
      variant='outline'
      className={cn(
        'relative h-10 w-full flex-1 justify-start text-sm font-normal shadow-sm',
        'bg-background/50 text-muted-foreground border-border/50',
        'hover:bg-background hover:text-foreground hover:border-border',
        'focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400',
        'transition-all duration-200',
        'sm:pr-12 md:pr-16 md:w-40 md:flex-none lg:w-56 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch
        aria-hidden='true'
        className='absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-muted-foreground/70'
      />
      <span className='ml-9 sm:ml-10 truncate text-sm'>{placeholder}</span>
      <kbd className='pointer-events-none absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 hidden h-5 sm:h-6 items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 sm:px-2 font-sans text-[9px] sm:text-[10px] font-medium text-muted-foreground select-none sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}
