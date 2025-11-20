export const Sidebar = () => {
  return (
    <div className="w-[300px] bg-background-dark border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-white">streamula</h1>
      </div>

      {/* Control Button */}
      <div className="p-4 border-t border-border mt-auto">
        <button className="w-full px-4 py-2 bg-accent-blue rounded-lg text-white hover:bg-[#5855eb] transition-colors duration-150 font-medium">
          Сам текст
        </button>
      </div>
    </div>
  );
};

