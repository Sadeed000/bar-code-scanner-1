export default function DecorativeBackground({ backgroundUrl = "" }) {
  if (!backgroundUrl) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: 'url("' + encodeURI(backgroundUrl) + '")',
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    />
  );
}
