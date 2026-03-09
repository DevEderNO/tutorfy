import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<
      string,
      { label?: React.ReactNode; icon?: React.ComponentType; color?: string }
    >;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = React.useId();
  const resolvedId = id || chartId;

  return (
    <div
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/20 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className,
      )}
      {...props}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: Object.entries(config)
            .map(
              ([key, value]) => `
                [data-chart=${resolvedId}] {
                  --color-${key}: ${value.color};
                }
              `,
            )
            .join(""),
        }}
      />
      <div data-chart={resolvedId} className="h-full w-full">
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    active?: boolean;
    payload?: any[];
    label?: any;
    labelFormatter?: (label: any, payload: any) => React.ReactNode;
    labelClassName?: string;
    formatter?: any;
    color?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[8rem] items-start rounded-lg border bg-background/90 px-2.5 py-1.5 text-xs shadow-xl glass-panel border-white/10",
          className,
        )}
      >
        {!hideLabel && (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter ? labelFormatter(label, payload) : label}
          </div>
        )}
        <div className="grid grid-cols-1 gap-1.5 mt-1">
          {payload.map((item: any, index: number) => {
            const key = `${item.name}-${index}`;

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center space-x-2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground w-full p-1",
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      "h-2 w-2 rounded-[2px]",
                      indicator === "dot" && "rounded-full",
                    )}
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <div className="flex flex-1 items-center justify-between space-x-2">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
