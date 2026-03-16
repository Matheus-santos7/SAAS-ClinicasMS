import * as React from "react";

import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className,
    )}
    {...props}
  >
    <NavigationMenuPrimitive.List className="group flex flex-1 list-none items-center justify-center space-x-2 rounded-full border border-border/60 bg-background/80 px-2 py-1 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {props.children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.List>
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute left-1/2 top-full z-50 mt-2 flex w-full -translate-x-1/2 justify-center">
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative h-[var(--radix-navigation-menu-viewport-height)] w-full min-w-[200px] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg transition-[width,_height] duration-200 md:w-auto",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 items-center justify-center gap-1 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10 hover:bg-muted/70",
);

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "whitespace-nowrap", className)}
    {...props}
  >
    {children}
    <ChevronDown
      className="relative top-[1px] ml-1 size-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in data-[motion=from-start]:slide-in-from-left-8 data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in data-[motion=from-end]:slide-in-from-right-8 data-[motion=to-start]:animate-out data-[motion=to-start]:fade-out data-[motion=to-start]:slide-out-to-left-8 data-[motion=to-end]:animate-out data-[motion=to-end]:fade-out data-[motion=to-end]:slide-out-to-right-8",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName =
  NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-50 flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=visible]:fade-in data-[state=visible]:slide-in-from-top-1 data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=hidden]:slide-out-to-top-1",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] size-2 rotate-45 rounded-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

const NavigationMenuSub = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ul className="grid gap-2 p-3 md:w-[320px]">{children}</ul>
);

const NavigationMenuSubItem = ({
  title,
  description,
  href,
  icon,
  active,
}: {
  title: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}) => (
  <li>
    <NavigationMenuLink
      href={href}
      className={cn(
        "block rounded-lg border border-transparent p-3 text-xs transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{title}</span>
          {description && (
            <span className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
              {description}
            </span>
          )}
        </div>
      </div>
    </NavigationMenuLink>
  </li>
);

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuSub,
  NavigationMenuSubItem,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};

