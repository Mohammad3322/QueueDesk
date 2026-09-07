import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function BackButton() {
  return (
    <div className="flex items-center border px-3 py-1 rounded-2xl bg-accent  text-x font-semibold  w-fit  text-white hover:text-accent hover:bg-white transition-colors ">
      <span>
        <ArrowBackIosIcon />
      </span>
      Back
    </div>
  );
}
