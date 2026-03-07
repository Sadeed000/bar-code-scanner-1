export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-[#0b1220] md:bg-[#0b1220] flex items-center justify-center p-3">
      <div className="w-full max-w-[430px] md:rounded-[28px] md:shadow-2xl bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}