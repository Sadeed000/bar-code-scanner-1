export default function IconTile({ icon, label, onClick }) {
  const isGradient = icon.bg?.includes("linear-gradient");

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group transition cursor-pointer"
    >
      <div
        className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110"
        style={
          isGradient
            ? { backgroundImage: icon.bg }
            : { backgroundColor: icon.bg }
        }
      >
        <img
          src={icon.img}
          alt={label}
          className="w-8 h-8 object-contain"
        />
      </div>

      <span className="text-xs text-gray-700 text-center">
        {label}
      </span>
    </button>
  );
}