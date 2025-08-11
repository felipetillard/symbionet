"use client";
import { z } from "zod";
import { useParams } from "next/navigation";

// We call a server action exported from a separate file
import { addProductAction } from "./server-actions";

export default function AddProductPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = params?.tenant as string;
  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 justify-between overflow-x-hidden">
      <div>
        <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
          <div className="text-[#101319] flex size-12 shrink-0 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
          </div>
          <h2 className="text-[#101319] text-lg font-bold flex-1 text-center pr-12">Add Product</h2>
        </div>
        <form action={(fd: FormData) => addProductAction(tenant, fd)} className="max-w-[480px] mx-auto">
          <input type="hidden" name="tenant" value={tenant} />
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input name="name" placeholder="Product Name" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input name="brand" placeholder="Brand" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input name="size" placeholder="Size" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input name="code" placeholder="Code" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea name="description" placeholder="Description" className="form-input w-full rounded-lg bg-[#e9ecf1] min-h-36 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea name="details" placeholder="Details" className="form-input w-full rounded-lg bg-[#e9ecf1] min-h-36 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea name="extras" placeholder="Extras" className="form-input w-full rounded-lg bg-[#e9ecf1] min-h-36 p-4" />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input name="price" placeholder="Price" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
            <label className="flex flex-col min-w-40 flex-1">
              <input name="inventory_count" placeholder="Inventory" className="form-input w-full rounded-lg bg-[#e9ecf1] h-14 p-4" />
            </label>
          </div>

          <h2 className="text-[#101319] text-[22px] font-bold px-4 pb-3 pt-5">Images</h2>
          <div className="flex flex-col p-4">
            <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-[#d3d9e3] px-6 py-14">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[#101319] text-lg font-bold">Add Images</p>
                <p className="text-[#101319] text-sm">Upload product images</p>
              </div>
              <input type="file" name="images" multiple className="hidden" id="file-input" />
              <label htmlFor="file-input" className="flex h-10 px-4 bg-[#e9ecf1] text-[#101319] text-sm font-bold rounded-lg cursor-pointer">Upload</label>
            </div>
          </div>
          <div className="flex px-4 py-3">
            <button className="flex h-12 px-5 flex-1 bg-[#1e3c6b] text-gray-50 text-base font-bold rounded-lg">Add Product</button>
          </div>
        </form>
      </div>
      <div className="h-5 bg-gray-50" />
    </div>
  );
} 