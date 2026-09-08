import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

export interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 24, ...props }: SVGProps) => {
  return <LoaderIcon size={size} className={cn("animate-spin", props.className)} />
};