export default function OrderConfirmation() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 justify-between overflow-x-hidden">
      <div>
        <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
          <div className="text-[#101319] flex size-12 shrink-0 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
          </div>
          <h2 className="text-[#101319] text-lg font-bold flex-1 text-center pr-12">Order Confirmation</h2>
        </div>
        <h3 className="text-[#101319] text-lg font-bold px-4 pb-2 pt-4">Order Summary</h3>
        <div className="p-4">
          <div className="flex justify-between gap-x-6 py-2"><p className="text-[#586d8d] text-sm">Order Number</p><p className="text-[#101319] text-sm text-right">#123456789</p></div>
          <div className="flex justify-between gap-x-6 py-2"><p className="text-[#586d8d] text-sm">Date</p><p className="text-[#101319] text-sm text-right">July 26, 2024</p></div>
        </div>
        {[1,2,3].map((i)=> (
          <div key={i} className="flex items-center gap-4 bg-gray-50 px-4 min-h-[72px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14" style={{ backgroundImage: "url('/placeholder-1x1.png')" }} />
              <div className="flex flex-col justify-center">
                <p className="text-[#101319] text-base font-medium leading-normal line-clamp-1">Item {i}</p>
                <p className="text-[#586d8d] text-sm leading-normal line-clamp-2">Size M</p>
              </div>
            </div>
            <div className="shrink-0"><p className="text-[#101319] text-base">$60.00</p></div>
          </div>
        ))}
        <h3 className="text-[#101319] text-lg font-bold px-4 pb-2 pt-4">Payment Details</h3>
        <div className="p-4">
          <div className="flex justify-between gap-x-6 py-2"><p className="text-[#586d8d] text-sm">Subtotal</p><p className="text-[#101319] text-sm text-right">$120.00</p></div>
          <div className="flex justify-between gap-x-6 py-2"><p className="text-[#586d8d] text-sm">Shipping</p><p className="text-[#101319] text-sm text-right">$5.00</p></div>
          <div className="flex justify-between gap-x-6 py-2"><p className="text-[#586d8d] text-sm">Total</p><p className="text-[#101319] text-sm text-right">$125.00</p></div>
        </div>
      </div>
      <div>
        <div className="flex px-4 py-3"><button className="flex h-12 px-5 flex-1 bg-[#1e3c6c] text-gray-50 text-base font-bold rounded-lg"><span className="truncate">Share via WhatsApp</span></button></div>
        <div className="flex gap-2 border-t border-[#e9ecf1] bg-gray-50 px-4 pb-3 pt-2">
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-[#586d8d]" href="#"><div className="text-[#586d8d] flex h-8 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"/></svg></div><p className="text-[#586d8d] text-xs font-medium">Home</p></a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-[#586d8d]" href="#"><div className="text-[#586d8d] flex h-8 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg></div><p className="text-[#586d8d] text-xs font-medium">Categories</p></a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#101319]" href="#"><div className="text-[#101319] flex h-8 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM180,192a12,12,0,1,1-12,12A12,12,0,0,1,180,192Zm-96,0a12,12,0,1,1-12,12A12,12,0,0,1,84,192Z"/></svg></div><p className="text-[#101319] text-xs font-medium">Cart</p></a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-[#586d8d]" href="#"><div className="text-[#586d8d] flex h-8 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/></svg></div><p className="text-[#586d8d] text-xs font-medium">Profile</p></a>
        </div>
        <div className="h-5 bg-gray-50"></div>
      </div>
    </div>
  );
} 