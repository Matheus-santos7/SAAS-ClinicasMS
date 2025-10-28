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
    messages?: {
      [key: string]: string | ((total: number) => string);
      showMore?: (total: number) => string;
    };
    view?: "month" | "week" | "day" | "agenda";
    views?: Array<"month" | "week" | "day" | "agenda">;
    onView?: (view: "month" | "week" | "day" | "agenda") => void;
    eventPropGetter?: (event: Event) => { style?: CSSProperties };
    onEventDrop?: (args: { event: Event; start: Date; end: Date }) => void;
    onEventResize?: (args: { event: Event; start: Date; end: Date }) => void;
    selectable?: boolean;
    resizable?: boolean;
    [key: string]: unknown;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function dayjsLocalizer(dayjs: {
    locale: (locale: string) => void;
  }): object;
}

declare module "react-big-calendar/lib/addons/dragAndDrop" {
  import { ComponentType } from "react";
  import type { Event } from "react-big-calendar";
  const withDragAndDrop: <P = Record<string, unknown>>(
    component: ComponentType<P>,
  ) => ComponentType<
    P & {
      onEventDrop?: (args: { event: Event; start: Date; end: Date }) => void;
      onEventResize?: (args: { event: Event; start: Date; end: Date }) => void;
      resizable?: boolean;
      draggableAccessor?: string | ((event: Event) => boolean);
      resizableAccessor?: string | ((event: Event) => boolean);
    }
  >;
  export default withDragAndDrop;
}
