"use client";

import * as React from "react";
import {
  Drumstick,
  Egg,
  Cookie,
  Wheat,
  ChefHat,
  Snowflake,
  Sprout,
  CupSoda,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Drumstick,
  Egg,
  Cookie,
  Wheat,
  ChefHat,
  Snowflake,
  Sprout,
  CupSoda,
};

interface Props extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className, ...rest }: Props) {
  const Icon = map[name] ?? Cookie;
  return <Icon className={className} {...rest} />;
}
