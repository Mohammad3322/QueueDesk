import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  child?: string;
}

export const GoButton: React.FC<ButtonProps> = ({ child }) => {
  return (
    <div className="flex items-center border px-2 pl-5 py-1 rounded-2xl bg-accent  text-x font-semibold  w-fit  text-white hover:text-accent hover:bg-white transition-colors decoration-0">
      {child}
      <span>
        <KeyboardArrowRightIcon />
      </span>
    </div>
  );
};
