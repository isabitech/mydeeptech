import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
// import { useState } from "react";

const chartData = [
  { month: "January", blank: 60 },
  { month: "February", blank: 80 },
  { month: "March", pending: 70 },
  { month: "April", blank: 65 },
  { month: "May", blank: 67 },
  { month: "June", income: 110 },
  { month: "July", blank: 100 },
  { month: "Aug", blank: 75 },
  { month: "Sep", blank: 20 },
  { month: "Oct", expance: 80 },
  { month: "Nov", blank: 70 },
  { month: "Dec", blank: 80 },
];

const chartConfig = {
  pending: {
    label: "Pending 10%",
    color: "#33C600",
  },
  income: {
    label: "Income",
    color: "#B8B7FF",
  },
  expance: {
    label: "Expance",
    color: "#FF4CE2",
  },
  blank: {
    // label: "blank",
    color: "#E6E8F0",
  },
} satisfies ChartConfig;

// const [isOpen, setIsOpen] = useState(false);
// const handleOpen = () => {
//   setIsOpen(!isOpen);
// };

const Component = () => {
  return (
    <div className="p-4 h-full w-full">
      {/* Header */}
      <div>
        <span>
          <p className="text-2xl font-bold">Revenue</p>
        </span>
        {/* <span>
          
          <p onClick={handleOpen}>Hi</p>
          {isOpen ? <span></span> : <span></span>}
        </span> */}
      </div>
      <hr />
      <div>
        <p className=" text-4xl font-bold mt-4">$112,000</p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full p-6">
        <BarChart data={chartData} layout="horizontal" barSize={35}>
          <CartesianGrid vertical={false} horizontal={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: any) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="pending"
            fill="var(--color-pending)"
            radius={8}
            stackId="a" // Stack bars together
          />
          <Bar
            dataKey="income"
            fill="var(--color-income)"
            radius={8}
            stackId="a" // Stack bars together
          />
          <Bar
            dataKey="expance"
            fill="var(--color-expance)"
            radius={8}
            stackId="a" // Stack bars together
          />
          <Bar
            dataKey="blank"
            fill="var(--color-blank)"
            radius={8}
            stackId="a" // Stack bars together
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default Component;
