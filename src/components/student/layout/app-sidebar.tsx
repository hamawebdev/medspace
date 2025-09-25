// @ts-nocheck
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/student/layout/nav-group'
import { sidebarData } from './data/sidebar-data'
import { Stethoscope, GraduationCap } from 'lucide-react'
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

function AppSidebarHeader() {
  const { state } = useSidebar()

  return (
    <div className={cn(
      'flex h-full items-center transition-all duration-200',
      state === 'expanded' ? 'justify-start gap-3 px-3 py-3' : 'justify-center px-2 py-4'
    )}>
      {/* Logo Icon - Always visible, enhanced size and centering */}
      <Logo
        className={cn(
          "object-contain transition-all duration-200 hover:scale-110 drop-shadow-sm",
          state === 'expanded' ? "h-10 w-10" : "h-9 w-9"
        )}
      />

      {/* Logo Text - Only visible when expanded, better typography */}
      {state === 'expanded' && (
        <div className='flex flex-col justify-center min-w-0 flex-1'>
          <span
            className='whitespace-nowrap text-lg font-bold leading-tight drop-shadow-sm'
            style={{
              background: 'linear-gradient(to right, var(--gradient-left), var(--gradient-center), var(--gradient-right))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            MedCortex
          </span>
          <span className='text-xs text-white/80 dark:text-muted-foreground font-medium leading-tight'>
            For Better Study
          </span>
        </div>
      )}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Compute sidebar items dynamically and enforce subscription-based disabling
  const { subscriptions } = useUserSubscriptions();
  const { effective, isResidency } = selectEffectiveActiveSubscription(subscriptions);
  const hasActiveSubscription = !!effective;

  const computedNavGroups = (() => {
    const groups = sidebarData.navGroups.map(g => ({
      title: g.title,
      items: [...g.items],
    }));

    // Always insert Residency after Practice (or before Exams if Practice not found)
    const coreIdx = groups.findIndex(g => g.title === 'Core');
    if (coreIdx !== -1) {
      const core = groups[coreIdx];
      const practiceIdx = core.items.findIndex((it: any) => it.url === '/student/practice');
      const examsIdx = core.items.findIndex((it: any) => it.url === '/student/exams');
      const insertionIdx = practiceIdx !== -1 ? practiceIdx + 1 : Math.max(0, examsIdx);
      const residencyItem = { title: 'Residency', url: '/student/residency', icon: Stethoscope } as any;
      // Avoid duplicate insertion if already present
      const alreadyHas = core.items.some((it: any) => it.url === '/student/residency');
      if (!alreadyHas) {
        core.items = [
          ...core.items.slice(0, insertionIdx),
          residencyItem,
          ...core.items.slice(insertionIdx),
        ];
      }
      // Disable Residency link if user does not have a residency subscription
      core.items = core.items.map((it: any) =>
        it.url === '/student/residency' ? { ...it, disabled: !isResidency } : it
      );
      groups[coreIdx] = core;
    }

    // If user has no active subscription, disable all items except subscription pages and settings
    if (!hasActiveSubscription) {
      for (const g of groups) {
        g.items = g.items.map((it: any) => {
          const url: string | undefined = (it as any).url;
          const isSubscriptionPage = url?.startsWith('/student/subscriptions');
          const isSettingsPage = url === '/student/settings';
          if (url && !isSubscriptionPage && !isSettingsPage) {
            return { ...it, disabled: true } as any;
          }
          return it;
        });
      }
    }

    return groups;
  })();

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className="group-data-[collapsible=icon]:w-16"
      {...props}
    >
      <SidebarHeader
        className={cn(
          'h-auto border-b border-sidebar-border/50 bg-sidebar',
          'group-data-[collapsible=icon]:min-h-[5rem] group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center',
          'min-h-[4.5rem] p-0 relative overflow-hidden'
        )}
      >
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent className='px-3 py-4 space-y-2 group-data-[collapsible=icon]:px-2'>
        {computedNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='p-3 border-t border-sidebar-border/30 group-data-[collapsible=icon]:p-2'>
        {/* Footer content can be added here */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
