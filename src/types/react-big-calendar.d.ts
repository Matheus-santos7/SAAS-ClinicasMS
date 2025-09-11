declare module "react-big-calendar" {
  import { ComponentType, CSSProperties } from "react";

  export interface Event {
    title: string;
    start: Date;
    end: Date;
    resource?: unknown;
  }

  export interface CalendarProps {
    localizer: object;
    events: Event[];
    startAccessor: string | ((event: Event) => Date);
    endAccessor: string | ((event: Event) => Date);
    culture?: string;
    messages?: Record<string, string>;
    eventPropGetter?: (event: Event) => { style?: CSSProperties };
    onEventDrop?: (args: { event: Event; start: Date; end: Date }) => void;
    selectable?: boolean;
    resizable?: boolean;
    [key: string]: unknown;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function dayjsLocalizer(dayjs: { locale: (locale: string) => void }): object;
}
