// export default function IconTile({ icon, label, onClick }) {
//   const isGradient = icon.bg?.includes("linear-gradient");

//   // detect if backend icon (no gradient background)
//   const isCustomIcon = icon.bg === "#ffffff" || icon.bg === "transparent";

//   return (
//     <button
//       onClick={onClick}
//       className="flex flex-col items-center gap-2 group transition cursor-pointer"
//     >
//       <div
//         className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110 overflow-hidden"
//         style={
//           isGradient
//             ? { backgroundImage: icon.bg }
//             : { backgroundColor: icon.bg }
//         }
//       >
//         <img
//           src={icon.img}
//           alt={label}
//           className={`${
//             isCustomIcon
//               ? "w-full h-full object-cover"
//               : "w-8 h-8 object-contain"
//           }`}
//         />
//       </div>

//       <span className="text-xs text-gray-700 text-center">
//         {label}
//       </span>
//     </button>
//   );
// }



// export default function IconTile({ icon, label, onClick }) {
//   const isGradient = icon.bg?.includes("linear-gradient");

//   const isCustomIcon =
//     icon.bg === "#ffffff" || icon.bg === "transparent";

//   return (
//     <button
//       onClick={onClick}
//       className="flex flex-col items-center gap-2 group transition cursor-pointer"
//     >
//       <div
//         className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110 overflow-hidden p-2"
//         style={
//           isGradient
//             ? { backgroundImage: icon.bg }
//             : { backgroundColor: icon.bg }
//         }
//       >
//         <img
//           src={icon.img}
//           alt={label}
//           className={
//             isCustomIcon
//               ? "w-full h-full object-contain"
//               : "w-8 h-8 object-contain"
//           }
//         />
//       </div>

//       <span className="text-xs text-gray-700 text-center">
//         {label}
//       </span>
//     </button>
//   );
// }


export default function IconTile({ icon, label, onClick }) {
  const formattedLabel = label
    ? String(label)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex min-w-0 flex-col items-center gap-1.5 group transition cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
    >
      <div
        className="w-15 max-w-full aspect-square sm:w-15 shrink-0 border p-1 flex items-center justify-center rounded-[16px] overflow-hidden transition-transform duration-200 motion-safe:group-hover:scale-105"
        style={{
          backgroundColor: "var(--link-tile-bg, #fafafa)",
          borderColor: "var(--link-tile-border, #e5e7eb)",
          boxShadow: "0 3px 6px -3px var(--link-tile-shadow, #d1d5db), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        }}
      >
        <img
          src={icon.img}
          alt={formattedLabel}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
        />
      </div>

      <span className="text-[11px] leading-tight text-gray-700 text-center break-words whitespace-normal margin-0">
        {formattedLabel}
      </span>
    </button>
  );
}


// export default function IconTile({ icon, label, onClick }) {

//   const isBackendIcon = icon.bg === "transparent";

//   return (
//     <button
//       onClick={onClick}
//       className="flex flex-col items-center gap-1 group transition cursor-pointer"
//     >
//       <div
//         className={`w-14 h-14 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-110 ${
//           isBackendIcon ? "" : "rounded-[16px]"
//         }`}
//         style={icon.bg ? { background: icon.bg } : {}}
//       >
//         <img
//           src={icon.img}
//           alt={label}
//           loading="lazy"
//           decoding="async"
//           className={`w-full h-full ${
//             isBackendIcon ? "object-contain" : "object-cover rounded-[16px]"
//           }`}
//         />
//       </div>

//       <span className="text-xs text-gray-700 text-center">
//         {label}
//       </span>
//     </button>
//   );
// }
