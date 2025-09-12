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
    <div className='flex h-full items-center gap-3 px-1'>
      {/* Logo Icon - Always visible, adapts size based on sidebar state */}
      <Logo
        className={cn(
          "object-contain transition-all duration-200 hover:scale-105",
          state === 'expanded' ? "h-14 w-14" : "h-8 w-8"
        )}
      />

      {/* Logo Text - Only visible when expanded */}
      {state === 'expanded' && (
        <div className='flex flex-col'>
          <span className='whitespace-nowrap text-lg font-bold text-primary'>
            MedCortex
          </span>
          <span className='text-xs text-muted-foreground font-medium'>
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
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader className='h-auto p-4 border-b border-sidebar-border/50'>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent className='px-2 py-4'>
        {computedNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='p-4'>
        {/* Removed system online status */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
