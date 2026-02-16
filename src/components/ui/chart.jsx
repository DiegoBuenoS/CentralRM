import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({ id, className, children, config }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-auto min-h-[220px] w-full items-center justify-center text-xs",
          className
        )}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }) {
  const entries = Object.entries(config || {}).filter(([, item]) => item?.color);
  if (!entries.length) return null;

  const rules = entries
    .map(([key, item]) => `[data-chart=${id}] { --color-${key}: ${item.color}; }`)
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: rules }} />;
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  formatter,
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-[180px] gap-2 rounded-lg border border-graphite-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-graphite-700 dark:bg-graphite-900",
        className
      )}
    >
      {!hideLabel ? (
        <div className="font-medium text-graphite-900 dark:text-graphite-100">{label}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = item.dataKey;
          const itemConfig = config?.[key];
          const itemLabel = itemConfig?.label || item.name || key;
          const itemColor = item.color || `var(--color-${key})`;
          const value = formatter
            ? formatter(item.value, item.name, item)
            : Number(item.value).toLocaleString("pt-BR");

          return (
            <div key={`${key}-${item.value}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-graphite-600 dark:text-graphite-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: itemColor }} />
                <span>{itemLabel}</span>
              </div>
              <span className="font-semibold text-graphite-900 dark:text-graphite-100">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
